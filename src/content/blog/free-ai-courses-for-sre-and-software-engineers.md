---
title: "Four Free Courses for Engineers Who Want to Build Useful AI"
description: "A practical learning path for SREs, DevOps engineers, and software developers: better coding workflows, retrieval, agents, and tool integration, with exercises and honest certificate details."
date: 2026-09-24
tags: ["AI", "SRE", "Software Development", "Learning"]
featured: false
draft: false
readTime: "8 min read"
---

I already use AI to help build software. What I want next is a better understanding of the systems underneath it: why an approach works, how to recognize when it fails, and how to make the result useful enough to depend on.

That is the perspective behind this shortlist.

If you work in SRE, DevOps, platform engineering, or software development, you already have relevant experience. You know what happens when dependencies disappear, inputs are malformed, or a process keeps retrying something it should have abandoned.

Those instincts belong in AI development too.

I put together a study curriculum around that overlap. These are four resources I would pull out for other engineers with similar interests. This is a curated learning plan, not a claim that I have completed every course.

The selection criteria were straightforward: public material, a clear sequence, practical exercises, and something useful to build afterward.

## Pick the course that matches your next problem

| If you want to… | Start here | First useful outcome |
|---|---|---|
| Get better results from AI coding tools | MIT Missing Semester | A repeatable workflow for a verified code change |
| Build an assistant over your own documents | DataTalks.Club LLM Zoomcamp | Searchable documentation with evidence-backed answers |
| Understand agents and their execution loops | Hugging Face Agents Course | A small assistant with bounded tool use |
| Connect an assistant to your software | Hugging Face MCP Course | A narrow, testable tool integration |

For the complete path, I would use that order. If you only have time for one, choose the problem you can actually work on this week.

## 1. MIT Missing Semester: improve the way you develop

[The Missing Semester of Your CS Education](https://missing.csail.mit.edu/) teaches the tools and practices surrounding software development. The 2026 edition includes agentic coding alongside debugging, profiling, packaging, and code quality.

For experienced engineers, I would begin with the [Agentic Coding lesson](https://missing.csail.mit.edu/2026/agentic-coding/) and follow the gaps it exposes. The public notes and video cover how coding agents use tools, manage context, and participate in development workflows.

The useful question for me is: how do I make an assisted code change easier to inspect and verify?

**An exercise I would pair with it:** take a small bug in a personal repository. Before asking for a fix, write down the observed behavior, the expected behavior, and the command that reproduces the failure.

Then use this task brief:

```text
Goal:
Observed failure:
Expected behavior:
Relevant files:
Constraints:
Reproduction command:
Verification commands:
Acceptance criteria:
```

Review the resulting diff. Run the checks yourself. Explain the change without reading the assistant's explanation.

Record the total time, including review and rework. A change that takes seconds to generate and an hour to untangle still took an hour.

This is a manageable starting point for someone already writing software. You can apply it immediately without building a new application.

## 2. LLM Zoomcamp: build something you can evaluate

[DataTalks.Club's LLM Zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp) provides a structured route through retrieval-augmented generation, vector search, evaluation, monitoring, and an end-to-end project. The repository links the course material and video lectures.

Retrieval-augmented generation, or RAG, means finding relevant source material and supplying it to a model when it produces an answer.

For an SRE, that suggests a concrete project: an assistant that can find the relevant runbook and explain which parts support its answer.

**An exercise I would pair with it:** write ten short runbooks for a fictional service. Include deployment failures, resource exhaustion, connection errors, and a dependency outage. Build ordinary keyword search first, then compare it with an embedding-based approach.

Make a small evaluation set:

- Questions with an explicit answer in one document.
- Questions that require evidence from two documents.
- Questions that the documents cannot answer.
- Questions for which an outdated runbook conflicts with a newer one.

Check retrieval and answer quality separately. If the right passage never reaches the model, rewriting the prompt may be solving the wrong problem.

The course material is free. Its current setup lists approximately $1–5 in API credits for the standard exercises. A local model is an alternative for your own project, but adapting examples takes work and may differ from official assignment requirements.

The free certificate is tied to a scheduled cohort: complete the project, review three peers' projects, and meet the deadlines. Self-paced study does not currently earn that certificate. You can still build the project at any time.

## 3. Hugging Face Agents: understand the loop

The [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/unit0/introduction) moves from agent fundamentals to frameworks, use cases, and a final assignment. It assumes basic Python and some familiarity with language models.

The engineering questions become interesting once a model can request actions. Which tools can it call? What happens when it calls the wrong one? How long can it keep trying?

**An exercise I would pair with it:** give an assistant two read-only tools:

```text
search_runbooks(query)
get_service_status(service_name)
```

Use synthetic data. Require it to cite the evidence behind a proposed diagnosis and say when information is missing.

Add a total time limit, a maximum number of tool calls, and a trace showing each request and result. Test an unknown service, an unavailable tool, and a repeated call that produces no new information.

Then compare it with a fixed workflow that runs the same two tools in a predetermined order. Keep the design that earns its complexity.

The course offers a free fundamentals certificate through Unit 1. Its [certificate instructions](https://huggingface.co/learn/agents-course/unit1/get-your-certificate) specify an 80% quiz score. The full completion route also requires a use-case assignment and the final challenge.

Certificate fees and model execution costs are separate considerations; free certification does not make every hosted service free.

## 4. Hugging Face MCP: connect tools with clear boundaries

The [Hugging Face Model Context Protocol course](https://huggingface.co/learn/mcp-course/unit0/introduction) teaches MCP concepts and implementation through a sequence of fundamentals and practical use cases.

MCP provides a common way to expose tools and context to compatible AI applications. That is relevant to engineers with useful data sitting behind APIs, scripts, and internal services.

**An exercise I would pair with it:** expose your synthetic incident lookup through a local MCP server. Accept a specific incident identifier and return a bounded response.

Test what happens when the identifier is invalid, the record is missing, or the backing service times out.

For this exercise, a tool that reads one incident is more useful than a tool that accepts arbitrary shell commands. The narrow interface gives you a clear contract to validate and an obvious boundary to test.

A standard protocol does not decide your authorization policy. Your application still needs to determine who can call a tool and what that tool may do.

The course advertises a free fundamentals certificate through Unit 1 and a completion route through the use-case units. Follow the current submission instructions and check the services used by each assignment for separate usage costs.

## One project can connect all four

I would build a small incident investigation assistant throughout this sequence.

Start with a repository that is easy to run and test. Add a searchable collection of fictional runbooks. Introduce a model that produces answers with source references. Only then add tools.

A useful first version should answer:

> What do we know, which evidence supports it, and what should we inspect next?

The same project can work outside infrastructure:

| Interest | Use the same approach for… | Check for… |
|---|---|---|
| Software development | Repository documentation and onboarding | Answers that cite the correct code or documentation |
| Writing and fiction | Character notes and worldbuilding | Continuity mistakes and invented story facts |
| Ebook tools | Chapter summaries and book search | Missing events, altered chronology, and unsupported claims |
| Personal knowledge management | Notes and reference material | Accurate sources and appropriate uncertainty |

These are my suggested practice projects, not official course assignments.

A simple six-session plan is enough to begin. Set aside about 90 minutes per session; this is a project kickoff, not a promise to finish the courses.

1. Watch the MIT agentic coding lesson and write a task brief for one small repair.
2. Complete the repair, inspect the diff, and record the verification steps.
3. Follow the Zoomcamp retrieval introduction and index a few documents.
4. Write ten questions, including several with no answer in the documents.
5. Study agent fundamentals and add one bounded read-only tool.
6. Study MCP fundamentals and sketch the interface you would expose.

If a session needs more time, continue it. The deliverable matters more than the date.

## What to expect from the certificates

There are worthwhile free credentials here, but be precise about what they represent.

| Resource | Credential situation |
|---|---|
| MIT Missing Semester | Recommended here for its public learning material; no certificate is promised |
| LLM Zoomcamp | Free cohort certificate subject to project, peer review, and deadlines |
| Hugging Face Agents | Free fundamentals and completion routes with different requirements |
| Hugging Face MCP | Free fundamentals and completion routes with different requirements |

These are course credentials. Their strongest companion is a project you can demonstrate and explain.

For an engineering portfolio, I would include the setup instructions, a small evaluation set, a failure example, and one design decision. Show what the application does when it cannot produce a reliable answer.

That gives another engineer something concrete to inspect.

## Give yourself a stopping point

A good first milestone is small: an unfamiliar person can run your project, ask a question, inspect its evidence, and understand its limitations.

Once that works, measure a failure and improve it.

That is a study plan I can see myself sticking with: learn something, put it to work, and find out whether it helped.

*Course details checked September 24, 2026. Follow the linked providers for current access, assignment, and certificate requirements.*
