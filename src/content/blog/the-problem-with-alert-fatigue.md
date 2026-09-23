---
title: "The Problem With Alert Fatigue"
description: "An alert is valuable only when it changes a decision. Everything else is telemetry pretending to be urgency."
date: 2026-09-20
tags: ["SRE", "Observability", "Reliability"]
featured: false
draft: false
readTime: "4 min read"
---

The fastest way to teach an engineer to ignore an alert is to send it often enough when nothing needs to be done.

That sounds obvious, but alerting systems regularly drift in exactly that direction. A new metric looks important, a threshold gets added, a notification fires, and nobody wants to be the person who removes something that *might* matter later.

Eventually the monitoring system becomes a stream of technically correct statements with no clear relationship to action.

## Telemetry and alerts have different jobs

Telemetry should be abundant. Alerts should be selective.

Metrics, traces, logs, events, dashboards, and historical data exist to help us understand the system. They can describe interesting conditions without demanding an immediate response.

An alert is different. It interrupts somebody.

That interruption should have a reason.

A useful test is simple: **what decision should the person receiving this notification make?**

If there is no answer, the signal probably belongs on a dashboard rather than a pager.

## Symptoms usually matter more than mechanisms

Infrastructure gives us thousands of things we *can* alert on.

CPU is high. A queue is deep. A pod restarted. Disk latency moved. A process count changed.

Those facts may explain an incident, but they are not necessarily incidents themselves.

User-visible symptoms, violated service objectives, exhausted capacity, failed critical workflows, and conditions that will predictably become outages are generally better candidates for urgent notification.

Mechanism-level telemetry is still valuable. It becomes much more useful when it is available as context around a meaningful symptom.

## Every page spends trust

People sometimes describe noisy alerts as merely annoying. The real cost is worse: they reduce confidence in the monitoring system.

Each unactionable page trains the responder to add another fraction of a second before believing the next one. Eventually the response becomes "I have seen this before" rather than "the system needs me."

That is a reliability problem created by the reliability tooling itself.

## Delete alerts deliberately

Alert reviews should include removal as a normal outcome.

For each alert:

- What failure is this detecting?
- Is somebody expected to act immediately?
- Is the action documented or obvious?
- Does another alert already cover the meaningful symptom?
- Could automation handle the response?
- Would this be more useful as dashboard context?

The objective is not fewer alerts as an aesthetic preference. It is a higher ratio of signal to interruption.

The monitoring system should earn attention every time it asks for it.
