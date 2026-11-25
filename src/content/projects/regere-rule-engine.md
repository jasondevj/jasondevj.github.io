---
name: regere-rule-engine
summary: A fast rule engine, persisted or in-memory, that evaluates conditions against dynamic data and runs actions when they match.
repo: https://github.com/jasondevj/regere-rule-engine
language: Java
started: 2012
lastActive: 2020
stars: 8
featured: true
highlights:
  - title: Rules without a schema
    text: "Data arrives as a Map, so rules aren't tied to any domain class."
  - title: Fast by default
    text: "Rules are preloaded. Non-persisted mode handled up to a million transactions on a quad-core machine."
  - title: Change rules live
    text: "Add, remove or edit JSON rules while the engine is running."
---

Regere evaluates a set of rules against incoming data and runs actions when a rule's condition is met. The first version took about two days to write, and the to-do list below is what I planned next.

## Main features

- **Dynamic data.** Values are passed in as a `Map`, so rules aren't bound to a domain class.
- **Preloaded rules.** All rules are loaded up front to keep evaluation fast.
- **Persisted and non-persisted events.** In non-persisted mode it handled up to a million transactions on a quad-core machine.
- **JSON rules.** Rules are defined as JSON objects.
- **Live changes.** Rules can be added, removed and changed while the engine is running.

## What I wanted to add next

- Distributed rule processing
- JMX operations to add, remove and change rules

The repository doesn't include a licence, so it isn't licensed for commercial use.
