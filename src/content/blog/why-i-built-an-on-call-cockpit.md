---
title: "Why I Built an On-Call Cockpit"
description: "During an incident, the expensive part is often not missing data. It is forcing a human to assemble the same operational picture over and over again."
date: 2026-09-18
tags: ["SRE", "Observability", "Automation"]
featured: false
draft: false
readTime: "4 min read"
---

Most operational environments do not suffer from a shortage of data.

They suffer from fragmentation.

The alert is in one system. Host state is somewhere else. Recent changes live in another interface. Historical context requires a query. The person responding to the incident becomes the integration layer.

That is a poor use of a human being.

## Repeated triage is a design signal

When every incident starts with the same sequence of lookups, the sequence is telling us something.

Those steps are part of the operational interface whether we have formally designed them or not.

The first improvement is often not a smarter alert. It is a better starting point.

An on-call cockpit should answer the first questions quickly:

- What is unhealthy?
- How widespread is it?
- When did it begin?
- What changed recently?
- What dependencies are involved?
- Is this getting better or worse?
- Where do I go next for detail?

That does not resolve the incident automatically. It eliminates the tax required before useful reasoning can begin.

## Put context next to the signal

Observability tools naturally organize information around data sources. Responders think in terms of incidents.

Those are different shapes.

A useful operational view pulls together enough context to form a hypothesis without requiring the responder to remember which product owns which part of the story.

The goal is not one dashboard containing every possible metric. That becomes another form of noise.

The goal is a deliberately selected set of information that supports the first several decisions.

## Optimize for the tired version of yourself

Operational tooling is often designed during calm hours and used during bad ones.

That should change how we evaluate it.

The person using the interface may have been interrupted, may be carrying several hypotheses at once, and may be working with incomplete information. The UI should reduce memory requirements, not add to them.

Names should be obvious. Time ranges should line up. Important state should be visible without hunting. Links should lead directly to the next layer of detail.

A good cockpit is not impressive because it has many panels.

It is useful because it lowers the amount of cognition required to understand what the system is doing.

## The broader lesson

Any repeated incident-response ritual is a candidate for productization.

Sometimes that means automation. Sometimes it means a runbook. Sometimes it means a dashboard that finally puts the right things next to one another.

Reliability improves when the system carries more of its own operational context.

The less time engineers spend reconstructing the situation, the more time they can spend changing it.
