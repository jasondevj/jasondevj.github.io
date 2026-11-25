---
name: LDrive
summary: An early-stage OneDrive sync client for Linux, written in Java.
repo: https://github.com/jasondevj/LDrive
language: Java
started: 2018
lastActive: 2018
license: Apache-2.0
highlights:
  - title: OneDrive on Linux
    text: "A Java client for an operating system OneDrive didn't support."
  - title: Event-driven design
    text: "Built around local file changes and remote OneDrive changes."
  - title: Early prototype
    text: "A starting point to explore, not a finished client."
---

LDrive is a OneDrive client for Linux, written in Java in 2018. The code is organised around local change events (files changing on disk) and remote change events (files changing on OneDrive), with a monitor package that watches for them.

It's an early prototype, not a finished client. The code is on GitHub if you'd like to see how it's put together.
