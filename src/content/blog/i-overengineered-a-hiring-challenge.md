---
title: "I Overengineered a Hiring Challenge I May Never Submit"
description: "Warp's hiring challenge asked for a small AWK solution. I solved it, then kept going: hardened parsing, typo handling, generated edge cases, cross-interpreter CI, and a 20 ms performance budget. Sometimes the unnecessary engineering is the part that makes the work fun."
date: 2026-10-04
tags: ["Engineering", "Career", "SRE", "Automation"]
featured: false
draft: false
readTime: "10 min read"
---

I found a hiring challenge for [Warp](https://github.com/rclevenger-hm/hiring-challenge/tree/dev) that asks a wonderfully small question:

Given a large pipe-delimited log of fictional space missions, use `awk` to find the security code for the longest completed mission to Mars.

That is basically it.

Warp's README even describes the challenge as short and fun. The exercise is optional, and the original prompt is narrow enough that the correct solution fits comfortably on one screen.

So naturally, I turned it into a small engineering project.

I may never even apply for the role.

That might be my favorite part.

## The first solution was already enough

The short version is intentionally boring:

```sh
LC_ALL=C awk '
BEGIN { FS = "|"; max = -1 }
/Mars/ {
    if (/Completed/ && !/^[[:space:]]*#/ &&
        $3 ~ /^[[:space:]]*Mars[[:space:]]*$/ &&
        $4 ~ /^[[:space:]]*Completed[[:space:]]*$/ &&
        $6 + 0 > max) {
        max = $6 + 0
        code = $8
    }
}
END {
    gsub(/[[:space:]]/, "", code)
    print code
}
' < "${1:-space_missions.log}"
```

That solves the supplied problem.

It is one pass.

It keeps constant working state.

It uses a cheap `/Mars/` prefilter before doing exact field checks.

It produces the expected code.

On the supplied ~10.15 MB log—about 105,000 lines and 100,000 mission records—the documented local benchmark for that short version came in around **8.34 ms median** with `mawk`.

For a hiring challenge, I could have stopped there.

In fact, there is a strong argument that I *should* have stopped there.

The short solution is easier to read, easier to explain, and better matched to the stated requirements.

Then I started asking questions the challenge never asked.

## What if the columns move?

The prompt documents the schema:

```text
Date | Mission ID | Destination | Status | Crew Size |
Duration (days) | Success Rate | Security Code
```

The short solution assumes those fields stay in those positions.

That is reasonable.

But the log also contains a `# Format:` header.

Once I noticed that, my brain immediately asked:

> If the file tells me where the fields are, why am I hardcoding them?

That question is how the second implementation began.

The hardened version reads the format header and discovers the positions of:

- Destination
- Status
- Duration
- Security Code

It normalizes header names for case, spacing, and punctuation.

So these can resolve to the same field:

```text
Duration (days)
duration(DAYS)
Duration
```

Repeated headers are allowed.

The column order can even change halfway through the file, and the current maximum carries across the schema change.

Was any of that necessary to answer the hiring challenge?

No.

Was it interesting?

Very much so.

## Then malformed data became a policy question

The simple version lets AWK perform numeric conversion on the duration.

That means something like:

```text
9994d
```

can behave like a numeric prefix.

For the challenge's documented data, that is not necessarily a problem.

For a hardened parser, it bothered me.

So the second version accepts only unsigned integers or decimals with digits on both sides of the decimal point.

It rejects or skips things such as:

```text
9994d
-10
+20
1e9
NaN
Inf
1,000
.5
5.
```

Zero remains valid.

Then ties needed semantics.

Then no-match behavior needed semantics.

Then missing headers needed semantics.

Then filter failures needed semantics.

Eventually the script had explicit exit codes:

| Exit | Meaning |
| --- | --- |
| 0 | One winning mission |
| 1 | No qualifying mission |
| 2 | Multiple missions tie for the maximum |
| 3 | Missing, invalid, or ambiguous header |
| 4 | A plausible typo could change the answer |
| 5 | Input or filtering failure |

At some point I had clearly stopped solving a hiring challenge and started designing a command-line interface.

I was fine with that.

## The typo problem was more interesting than the original problem

Imagine the longest record says:

```text
Mras | Completed
```

Should that count as Mars?

Automatically correcting it is dangerous.

Ignoring it is also dangerous if that row would have won.

So the hardened version does neither.

It treats a one-edit insertion, deletion, substitution, or adjacent transposition as a **possible typo**.

Examples:

```text
Mras
Marz
Completd
```

But it does not automatically include those rows.

Instead:

- if the suspicious row is shorter than an exact winner, the script returns the exact winner and emits a warning;
- if the suspicious row could win, tie, or become the only candidate, the script refuses to answer.

That is the kind of behavior I like in operational tooling.

When uncertainty is irrelevant to the outcome, keep going and tell me.

When uncertainty can change the answer, stop pretending the answer is known.

There is also an escape hatch for reviewed data:

```sh
DEST_ALIASES=mras,marz STATUS_ALIASES=completd \
  sh lcm_mars_hardened.sh space_missions.log
```

Nothing is silently invented.

An operator has to explicitly declare that the questionable spelling is intentional.

Again: wildly beyond the problem statement.

Also: much more fun than just printing the code.

## Then performance became part of the game

The hardened implementation had a problem.

Validation made it slower.

If every row is split, normalized, typo-checked, and compared, all the defensive behavior starts consuming the performance budget.

So the problem changed from:

> How do I make this correct?

to:

> How do I keep all these extra guarantees without destroying the thing that made AWK attractive in the first place?

The wrapper now uses `grep` as a prefilter.

It passes likely Mars records and format headers into AWK rather than forcing the expensive validation logic over every row.

The filter intentionally admits false positives.

That is okay.

Its job is not to decide the answer.

Its job is to cheaply shrink the candidate set.

AWK still performs the authoritative checks.

That separation—cheap filter first, exact decision second—is a pattern that shows up everywhere in production systems.

And now I was optimizing a 10 MB fictional Mars database for a hiring challenge I may never submit.

## Naturally, I gave it a performance SLO

The repository now has a Python benchmark harness.

Each implementation gets:

- 5 warmup runs
- 50 measured runs
- full output validation on every run
- exit-status validation
- stderr validation
- interpreter metadata
- input and script SHA-256 hashes
- median
- mean
- P95
- minimum
- maximum

And a hard condition:

**median runtime must stay below 20 ms.**

The benchmark writes a JSON artifact containing every sample and publishes the timing table into the GitHub Actions step summary.

The hardened version's documented local median landed at about **18.63 ms**.

Which is amusingly close to the line.

That made further changes immediately more interesting.

A new defensive check was no longer free.

If it pushed the median over 20 ms, I had to decide whether the extra guarantee justified the cost—or find a cheaper way to implement it.

That is a much more realistic engineering constraint than “make it as robust as possible.”

Reliability without budgets becomes architecture astronautics very quickly.

## Then I built the CI system around it

The GitHub Actions workflow is where the project crossed the line from “solution” to “tiny software product.”

The pipeline now has three layers.

### Lint

Both shell scripts get:

- `sh -n`
- ShellCheck

The Python tests and benchmark get:

- Ruff
- Python compilation checks

The workflow itself gets:

- actionlint

Actions are pinned to commit revisions, repository permissions are read-only, and checkout credentials are not persisted.

### Correctness

Both implementations run against:

- `mawk`
- `gawk`

That creates a four-cell matrix:

```text
short     × mawk
short     × gawk
hardened  × mawk
hardened  × gawk
```

The shared suite covers things like:

- the supplied log
- a newly appended winner
- numeric ordering
- exact field matching
- regular and indented comments
- whitespace
- CRLF
- zero-day missions
- ties
- no matches
- paths with spaces
- missing input

The hardened implementation gets additional cases for:

- reordered columns
- swapped duration/rate positions
- missing headers
- duplicate headers
- header misspellings
- uppercase values
- consequential typos
- harmless typos
- malformed records
- decimal durations
- numeric overflow
- three-way ties
- a later winner superseding an earlier tie
- explicit aliases
- mid-file schema changes
- missing final newlines
- bounded classification caches
- original source line numbers
- filter failures after a candidate has already been emitted

And then I generated single-edit variants at every character position to make sure the prefilter could not accidentally hide a typo the validator was supposed to see.

That sentence is probably evidence enough that the challenge had escaped containment.

### Performance

Only after lint and correctness succeed do both scripts get benchmarked with `mawk`.

If the median is 20 ms or more, the job fails.

Benchmark reports are uploaded as artifacts for 30 days.

None of this was requested.

That is exactly why I enjoyed it.

## Overengineering is not always a mistake

“Overengineering” is usually a criticism.

Often it should be.

Production systems can become expensive monuments to hypothetical problems.

The best solution is frequently the smallest one that actually satisfies the requirement.

That is why I kept the original script.

I did **not** replace the simple solution with the hardened one and declare the giant defensive version the winner.

The repository now has both:

**The short solution:** appropriate to the stated challenge.

**The hardened solution:** an exploration of what happens when the assumptions stop being trusted.

That distinction matters.

Overengineering becomes dangerous when you can no longer tell which version the problem actually needs.

As a learning exercise, though, deliberate overengineering can be fantastic.

It creates room to explore questions that a ticket would never fund.

## The joy is often in the questions after the answer

The original problem asks:

> What is the longest completed Mars mission?

The engineering questions became:

> What if a column moves?

> What if the header is misspelled?

> What if the data is misspelled?

> What if the typo would change the winner?

> What if two records tie?

> What if a malformed number starts with valid digits?

> What if a filter fails after emitting partial data?

> What if the input is CRLF?

> What if the filename contains spaces?

> Does `mawk` behave the same as `gawk` here?

> Can I preserve all of this and still finish under 20 ms?

Those questions had nothing to do with getting through a hiring funnel.

They were just interesting.

That is something I had forgotten is valuable on its own.

## A hiring challenge can be a playground instead of an audition

There is a strange pressure around take-home challenges.

Every minute spent on one feels like it needs to justify itself through employment.

Will this get me an interview?

Will someone appreciate the extra work?

Am I wasting time?

Those are reasonable questions.

Companies absolutely can ask too much of candidates.

But there is another category: a small public problem that happens to catch your interest.

At that point, the value does not have to come from the company.

The challenge can become raw material.

You can use it to practice:

- shell
- AWK
- parsing
- test design
- adversarial inputs
- performance measurement
- CI design
- documentation
- security hygiene
- portability
- failure semantics

Then even if you never submit the application, you still got something.

The work survives the hiring process.

## This is probably closer to how I actually engineer

The funny thing is that the unnecessary parts probably reveal more about me than the answer does.

The challenge did not require a benchmark artifact.

I wanted one because “it seems fast” is not the same as measured behavior.

It did not require two AWK implementations.

I wanted both because interpreter assumptions are easy to hide.

It did not require generated typo variants.

I wanted them because a prefilter that silently drops the exact edge case your validator claims to catch is worse than having no validator.

It did not require explicit failure codes.

I wanted them because operational ambiguity becomes somebody else's problem later.

It did not require two implementations.

I kept both because the simple version is still the right answer to the actual question.

That last part may be the most important.

Good engineering is not making everything hardened.

It is knowing what deserves hardening.

## The role may never matter

I do not know whether I will ever send this challenge to Warp.

That is no longer especially important to me.

The repository now contains something more useful than an application artifact.

It shows a progression:

```text
solve the problem
      ↓
identify assumptions
      ↓
attack the assumptions
      ↓
define failure behavior
      ↓
write tests
      ↓
measure performance
      ↓
automate verification
      ↓
document the tradeoffs
```

That is a workflow I recognize from SRE and infrastructure engineering.

The difference is that nobody assigned it.

Nobody put it on a sprint.

Nobody paged me.

Nobody needed a design review.

I just found a small problem and kept asking, **“What happens if...?”**

Sometimes that is enough reason to build something.

And sometimes the most enjoyable engineering starts immediately after you already have the answer.

---

The implementation, documentation, tests, and GitHub Actions harness discussed here are on the [dev branch of my Warp hiring-challenge repository](https://github.com/rclevenger-hm/hiring-challenge/tree/dev).
