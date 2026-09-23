---
title: "Why LeetCode Is Actually Useful for SRE and DevOps Engineers"
description: "LeetCode is easy to dismiss as interview prep, but problems like Two Sum and Longest Substring train reasoning patterns that show up constantly in automation, observability, and production systems."
date: 2026-09-23
tags: ["SRE", "DevOps", "Career", "Engineering"]
featured: false
draft: false
readTime: "7 min read"
---

LeetCode has a reputation problem among experienced infrastructure engineers.

Mention it to an SRE or DevOps engineer and there is a reasonable chance the response will be some variation of:

> I do not reverse linked lists during incidents.

Fair.

Neither do I.

Most production outages are not resolved by implementing a binary tree from memory.

But after working through LeetCode problems again, I think dismissing it entirely misses the useful part.

The value is not memorizing puzzle solutions.

The value is practicing how to recognize data structures, constraints, complexity, and reusable problem-solving patterns quickly.

Those things absolutely do show up in SRE and DevOps work.

## Two Sum is not really about two numbers

One of the first exercises I worked through was the classic Two Sum problem.

Given an array of numbers and a target, find two entries whose values add to that target.

The obvious solution is to compare every possible pair.

That works.

It is also roughly \(O(n^2)\).

The better approach walks through the input once and stores previously seen values in a hash map.

For each value:

1. calculate the complement you need
2. check whether you have already seen it
3. if not, store the current value for later

The time complexity becomes roughly \(O(n)\), trading a modest amount of memory for dramatically less repeated work.

The important lesson is not Two Sum.

It is the question:

**Can I retain something I already learned so I do not have to recompute it?**

Infrastructure engineers make that trade constantly.

Think about:

- deduplicating events
- caching API lookups
- correlating request IDs
- recording already-processed cloud resources
- reconciling desired and actual state
- joining data from multiple monitoring sources
- suppressing duplicate alerts
- tracking locks or leases
- mapping hostnames, instance IDs, and metadata

A hash map is not an interview trick.

It is one of the basic shapes of production automation.

Two Sum simply reduces the idea to a problem small enough that you can practice recognizing it immediately.

## Longest Substring teaches bounded state

Another exercise I worked through was Longest Substring Without Repeating Characters.

The brute-force instinct is to generate many possible substrings and inspect them repeatedly.

The better solution uses a sliding window.

You maintain a valid region of the input.

As new characters arrive, the window expands.

When a duplicate violates the constraint, the left edge moves forward until the window becomes valid again.

The useful concept is:

**Maintain only the state required for the current window instead of repeatedly reprocessing the entire history.**

That should sound familiar to anyone who works with operational systems.

Variations of sliding windows appear in:

- request-rate calculations
- moving averages
- error-budget burn
- latency analysis
- burst detection
- rolling log analysis
- rate limiting
- alert suppression
- autoscaling signals
- circuit breakers
- stream processing

The LeetCode problem happens to use characters in a string.

The reasoning pattern is much broader.

## Complexity matters more in SRE than we sometimes admit

Infrastructure code has an unfortunate habit of starting small.

A script manages 50 instances.

Then 500.

Then somebody points it at an organization containing 50,000 resources.

A log parser written for a few megabytes begins processing gigabytes.

A reconciliation loop that looked harmless starts running every minute across an entire fleet.

This is where algorithmic complexity stops being academic.

A nested scan over 30 objects is irrelevant.

The same pattern over hundreds of thousands of objects can become the incident.

LeetCode builds the habit of asking:

- How does this scale?
- Am I scanning the same data repeatedly?
- Can I store something I already know?
- Can I bound the amount of state I retain?
- Can I process this as a stream?
- What is the worst case?

Those are good SRE questions.

## It improves scripting, not just “coding”

SRE and DevOps engineers often write code in an unusual context.

The code may be:

- an incident tool
- a migration
- a one-off data repair
- a deployment utility
- a capacity report
- a log parser
- a controller
- a Lambda function
- a command-line tool
- a cleanup job

Because the code is sometimes described as “just a script,” it can escape the scrutiny we would give a production service.

But scripts become production systems surprisingly often.

The more comfortable you are with basic algorithmic patterns, the easier it becomes to notice when the quick solution is going to behave badly at scale.

## LeetCode also trains explanation

For interview preparation, there is another benefit that is easy to overlook.

Working through a problem properly forces you to explain your reasoning.

A useful process is:

1. state the brute-force solution
2. identify the expensive part
3. choose a data structure that removes that expense
4. implement it
5. describe time and space complexity
6. test edge cases

That process is useful outside interviews.

It is essentially a compressed design review.

Production engineering frequently requires you to say:

- here is the straightforward solution
- here is where it stops scaling
- here is the tradeoff I am choosing
- here is the additional state or complexity it requires
- here is what happens at the edges

That is good engineering communication.

## The important part is pattern recognition

I do not think the best way to use LeetCode is to grind hundreds of problems until you can reproduce solutions from memory.

That can produce interview reflexes without much understanding.

I prefer treating problems as representatives of a smaller number of patterns.

For example:

- hash maps for fast lookup
- sets for uniqueness
- sliding windows for bounded sequences
- two pointers for ordered traversal
- stacks for nested state
- queues for breadth-first work
- heaps for top-N and priority work
- graphs for dependencies and reachability

The objective is to encounter a new problem and think:

> I have seen the shape of this before.

That is much closer to real engineering.

## Translate each problem into an operational example

One technique I have found particularly useful is to ask how the problem would appear in infrastructure.

After Two Sum:

> Where do I repeatedly search data that I could index once?

After Longest Substring:

> Where am I keeping too much historical state instead of maintaining a valid moving window?

This translation step makes the exercise stick.

It also exposes places in normal SRE work where the same reasoning can simplify a tool or make it scale better.

## What LeetCode cannot teach you

There is also a limit.

LeetCode does not teach:

- how Kubernetes actually fails
- how DNS behaves under pressure
- how to interpret a messy production graph
- how to read logs across five services
- how to coordinate an incident
- how to design an alert
- how to understand somebody else’s Terraform
- how to decide whether the safest fix is to do nothing yet

Those require real systems.

That is why I see LeetCode as one part of a larger practice loop.

Algorithm problems sharpen the reasoning.

Hands-on systems work provides the context.

## A better practice stack for SREs

For an SRE or DevOps engineer preparing for interviews or simply trying to stay sharp, I would combine three kinds of practice:

**LeetCode** for algorithmic patterns and complexity.

**Realistic troubleshooting labs** for Linux, networking, containers, Kubernetes, and production reasoning.

**Small personal projects** for architecture, automation, deployment, and the experience of maintaining something you actually built.

Each covers a different part of the job.

The mistake is expecting any one of them to represent the entire profession.

## The unexpected benefit

The part I did not expect was that solving these problems became enjoyable once I stopped treating them as interview hazing.

They are small, bounded systems.

There is a clear constraint.

You form a model.

You try something.

You discover where the model is inefficient.

Then you improve it.

That loop is not particularly different from the part of SRE work I enjoy most.

The scale is smaller.

The feedback is faster.

And there is no pager involved.
