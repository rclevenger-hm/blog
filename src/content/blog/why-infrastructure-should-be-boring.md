---
title: "Why Infrastructure Should Be Boring"
description: "Boring infrastructure is a feature, not a failure of imagination. Reliability improves when the system is easier to predict than it is to admire."
date: 2026-09-22
tags: ["SRE", "Reliability", "Infrastructure"]
featured: true
draft: false
readTime: "5 min read"
---

There is a kind of infrastructure that looks impressive in a diagram and exhausting at 2:17 in the morning.

The distinction matters.

A production system is not a portfolio of interesting technologies. It is a machine that people have to understand while it is changing, failing, recovering, scaling, and occasionally surprising everyone involved. The more novelty we place between a symptom and its cause, the more expensive every surprise becomes.

That is why I have increasingly come to value *boring* infrastructure.

## Boring does not mean primitive

A boring system can still be large, distributed, automated, highly available, and technically sophisticated.

What makes it boring is that its behavior is legible.

A deployment has one obvious path. An alert points toward a useful decision. Capacity has a model. Ownership is clear. The common failure modes have already been turned into automation or documentation. When something unusual happens, the engineer responding to it does not have to rediscover the architecture before they can begin diagnosing the problem.

That kind of predictability is an achievement.

## Complexity has an operating cost

Engineering teams usually discuss complexity in terms of development effort. Operations exposes the second bill.

Every additional service boundary creates another place to observe. Every abstraction creates another layer that can hide the real state of the system. Every clever optimization creates another piece of institutional knowledge that eventually has to survive the departure of the person who invented it.

The question is not whether a technology is good. The question is whether the additional capability is worth the permanent operational surface area it creates.

A great deal of reliability work is simply paying down complexity that once looked free.

## The best automation removes decisions

I like automation most when it makes routine judgment unnecessary.

If a stale resource can be identified safely, clean it automatically. If capacity follows a predictable pattern, encode the response. If every incident begins with the same ten commands, put the useful information on one screen.

The goal is not to remove engineers from the system. It is to reserve engineering attention for the cases that actually require engineering.

A healthy operational environment should make the normal path almost uneventful.

## Good systems explain themselves

Dashboards, logs, metrics, runbooks, naming, ownership, and deployment workflows are often treated as supporting material around the "real" system.

Operationally, they *are* part of the system.

A service that is technically healthy but impossible to diagnose is not reliably operable. A platform that works only when a particular person remembers an undocumented rule is carrying hidden state in a human being.

The closer we can move that knowledge into the system itself, the less fragile the organization becomes.

## Boring is what success feels like

The ideal production day is not dramatic.

Deployments happen. Capacity moves. Old resources disappear. Alerts are uncommon and meaningful. Engineers spend more time improving the system than proving they can survive it.

There will always be incidents. There will always be unexpected interactions in sufficiently complicated systems.

But infrastructure should not generate excitement as a routine operating condition.

If it is doing its job well, most days it should be almost disappointingly quiet.
