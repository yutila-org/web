---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Introduction
description: A quick look at the Camelot framework.
---

Camelot is a C framework that focuses on memory safety and predictable behavior under C23. It utilizes its own build tool called **Merlin** (written in D).

Instead of relying on `malloc` directly and risking memory leaks, Camelot provides memory arenas. It includes basic data structures and error handling, remaining fully compatible across GCC, Clang, and MSVC.

## Motivation

The framework was engineered to be straightforward to read, robust against unexpected failures, and portable without requiring complex build environments. Straightforward semantics are prioritized over syntactic sugar.

### Naming Convention

All functions follow a strict `DOMAIN_functionSubfunction` naming style to ensure intent is immediately recognizable:

- **Domain prefix**: Always uppercase (e.g., `ARENA`, `VECTOR`, `STRING`)
- **Primary function name**: Always lowercase
- **Subfunction qualifier**: Added in camelCase with no extra underscores

Arbitrary abbreviations are avoided unless they are universally recognized (such as `IO`).

### Portability Guidelines

Reliance on non-standard compiler extensions that alter runtime execution is explicitly avoided.
- Compile-time annotations (like `__attribute__((warn_unused_result))`) are permitted.
- Behavior-altering extensions (like GCC's `cleanup` attribute) are prohibited due to a lack of universal support.

## Project Structure

```text
camelot/
├── include/              # Public APIs
│   └── camelot/          
│       ├── core/         
│       ├── memory/       
│       ├── types/        
│       └── camelot.h     # Main header
├── src/                  # Implementation
│   ├── core/
│   ├── memory/
│   ├── io/
│   ├── ds/
│   └── types/
├── tests/                # Test suites
├── merlin.d              # Merlin build orchestrator
├── Makefile              # Bootstrap for Merlin
└── README.md             
```

### Architectural Principles

1. **Isolation**: Headers in `include/camelot/` define the public interface. Implementations remain isolated in `src/`.
2. **Mirroring**: The `src/` directory exactly mirrors the `include/` directory structure.
3. **Flat Namespace**: All headers are nested under the `camelot/` directory to prevent collisions.

## Usage

Include the primary header file:

```c
#include <camelot/camelot.h>
```

This single inclusion provides access to the entire framework.

## License

Camelot is released under the **Mozilla Public License 2.0 (MPL-2.0)** and is [OpenSSF Best Practices certified](https://www.bestpractices.dev/projects/12919).
