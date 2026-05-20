---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Introduction
description: Overview of the Camelot C23 framework — its design philosophy, security posture, and the Merlin build orchestrator.
---

Camelot is a lightweight, zero-latency C framework engineered for strict memory safety, predictability, and secure execution under the C23 standard. It is powered entirely by **Merlin**, a custom build orchestrator written in the D programming language.

The framework provides a complete standard library replacement featuring allocator-agnostic data structures, deterministic memory arenas, a tri-state error model, and compile-time security hardening — all while remaining fully portable across GCC, Clang, and MSVC.

## Design Philosophy

### Enterprise Reliability (The Java Paradigm)

Camelot prioritizes long-term enterprise reliability, cross-platform interoperability, and transaction stability over trendy syntactic sugar. Borrowing the survivability thesis of platforms like the JVM ("Write Once, Run Anywhere"), Camelot's abstractions are engineered to be predictably robust, backward-compatible, and rigorously tested so they can run undisturbed for decades in mission-critical environments.

### Naming Convention

All functions strictly utilize the `DOMAIN_functionSubfunction` format:

- **Domain prefix**: Fully uppercase (e.g., `ARENA`, `VECTOR`, `STRING`)
- **Primary function name**: Fully lowercase
- **Subfunction qualifier**: Appended in camelCase without additional underscores

Word truncations or casual abbreviations are prohibited unless using universally standard acronyms (e.g., `IO`).

### Portability & Compiler Extensions

To guarantee absolute portability across arbitrary C compilers, reliance on non-standard runtime compiler extensions is explicitly prohibited.

- Compiler attributes that operate strictly during compilation (e.g., `__attribute__((warn_unused_result))`) are acceptable.
- Runtime-altering extensions, specifically GCC's `__attribute__((cleanup))` for RAII emulation, are **forbidden** due to lack of support in non-GNU environments.

## Project Structure

```text
camelot/
├── include/              # Public API Headers (read-only for clients)
│   └── camelot/          # Unified namespace
│       ├── core/         # Fundamental abstractions (Result, Safety)
│       ├── memory/       # Memory management (Arena, Allocator)
│       ├── types/        # Primitives and String types
│       └── camelot.h     # Umbrella header for full framework access
├── src/                  # Private Implementation (.c files)
│   ├── core/
│   ├── memory/
│   ├── io/
│   ├── ds/
│   └── types/
├── tests/                # Unit and Integration Testing suite
├── merlin.d              # Merlin Build Orchestrator (D language)
├── Makefile              # Bootstrap entry point for Merlin
└── README.md             # Project entry point
```

### Architectural Rationale

1. **Public/Private Isolation**: Headers in `include/camelot/` ensure only intended APIs are accessible via `#include <camelot/subsystem.h>`. Private headers remain within `src/`.
2. **Namespace Mirroring**: The `src/` directory mirrors `include/` exactly, predictably mapping implementation files to their corresponding headers.
3. **Modular Compilation**: Every module compiles into an independent object file, enabling the linker to prune unused modules in static builds.
4. **Flat Namespace**: All headers are accessed through the `camelot/` prefix to prevent header collision in large projects.

## Unified Header

Including the entire framework is a single line:

```c
#include <camelot/camelot.h>
```

This umbrella header transitively includes all subsystems: primitives, allocators, arenas, result types, and the safety header.

## License

Camelot is released under the **Mozilla Public License 2.0 (MPL-2.0)** and is [OpenSSF Best Practices certified](https://www.bestpractices.dev/projects/12919).
