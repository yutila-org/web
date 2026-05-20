---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Architecture
description: The structural design of Camelot and Merlin.
---

The architecture of the Camelot ecosystem is intentionally split into two distinct tiers: **the Orchestrator** and **the Framework**.

## The Orchestrator (Merlin)

Merlin is the singular, monolithic build engine for the Camelot framework, written in the D programming language. 

Unlike traditional Makefiles, Merlin acts as an intelligent supervisor. It automatically detects source files, dynamically probes the compiler (GCC) for C23 standard support, and dispatches compilation commands with built-in parallelism and strict compiler flags.

> [!TIP]
> Merlin can gracefully fallback to `-std=c2x` on environments operating older compilers, ensuring zero breakage in Continuous Integration pipelines.

## The Framework (Camelot)

Camelot is the runtime framework written in C23. It provides low-level abstractions that prioritize predictability.

### Deterministic Memory Management
At the core of Camelot's architecture is its Arena memory allocator. Instead of invoking the system's dynamic allocator (`malloc/free`) haphazardly, Camelot applications allocate vast, contiguous blocks of memory at startup (Arenas).

Subsequent memory requests simply bump a pointer forward inside the Arena, yielding completely deterministic, fragmentation-free memory acquisition with `O(1)` complexity.

### Yutila Mitigations
Camelot binaries are enforced by Merlin to compile under strict security configurations:
- **PIE** (Position Independent Executables)
- **Stack Protectors** (`-fstack-protector-strong`)
- **Sanitizers** (Address, Undefined Behavior, Leak Sanitizers enabled during Debug profiles)
