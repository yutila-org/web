---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Introduction
description: Overview of the Camelot C23 framework and Merlin build orchestrator.
---

Camelot is a lightweight, zero-latency C framework engineered for strict memory safety, predictability, and secure execution. It is powered entirely by **Merlin**, a custom build orchestrator written in the D programming language.

## Operational Philosophy

Modern C development is often plagued by archaic build systems (Makefiles, CMake) that are difficult to debug, scale, or integrate gracefully with modern CI/CD pipelines. Camelot resolves this by delegating the entire build orchestration, dependency resolution, and test generation to Merlin.

The framework itself operates under the rigorous C23 standard, strictly utilizing modern paradigms and custom memory allocators to prevent classical vulnerabilities.

## Core Features

- **Strict C23 Compliance:** Utilizes the latest C standard for enhanced typing and language ergonomics.
- **Merlin Build Orchestrator:** A terminal-based, dynamically animated build engine in D.
- **Zero-Latency Memory Arenas:** Pre-allocated, deterministic memory regions (Arenas) that completely bypass generic `malloc` calls for critical operations.
- **Yutila Security Mitigation:** Built-in fortification, PIE, stack-protectors, and Sanitizer suites.
