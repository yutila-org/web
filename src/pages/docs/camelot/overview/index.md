---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Introduction
description: Overview of the Camelot C23 utility library — its design philosophy, component model and the Merlin build orchestrator.
---

Camelot is a C23 utility library. It is orchestrated by **Merlin**, a build engine written in the D programming language.

Camelot provides structural alternatives to libc subsystems. It requires explicit allocator boundaries, localized memory arenas, a tri-state error model and specific compiler flags. It is portable across GCC, Clang and MSVC. It is not a foundational framework, web server or application runtime.

## Philosophy

### Predictability

Camelot prioritizes explicit mechanisms, cross-platform interoperability and traceable state transitions.

- **Rationale**: To reduce undefined behavior and memory leaks common in C applications.
- **Solves**: Implicit state mutation, uncontrolled heap allocations and unhandled error states.
- **Pros**: Traceable execution, isolated memory regions and compiler-verified error checking.
- **Cons**: Requires explicit allocator passing, verbose error handling and strict adherence to conventions.

### Guarantees

Camelot enforces constraints across four layers:
1. **Compiler-enforced**: Error handling via `[[nodiscard]]` and poisoned legacy functions via `#pragma GCC poison`.
2. **Library-enforced**: Memory isolation via the `Allocator` VTable.
3. **Test-enforced**: Memory leak and bounds checking via ASan, UBSan and LSan.
4. **Convention-only**: Explicit Deferral (`goto defer`) and domain-prefixed naming conventions.

### Naming (Convention)

Functions utilize the `DOMAIN_functionSubfunction` format.

- **Domain prefix**: Uppercase (e.g., `ARENA`, `VECTOR`, `STRING`).
- **Primary function name**: Lowercase.
- **Subfunction qualifier**: CamelCase.

### Portability (Compiler)

Reliance on non-standard runtime compiler extensions is prohibited.
- Attributes operating during compilation (e.g., `[[nodiscard]]`) are required.
- Runtime-altering extensions (e.g., GCC's `__attribute__((cleanup))`) are prohibited.

## Structure

```text
camelot/
├── include/              # Public API Headers
│   └── camelot/          # Unified namespace
│       ├── core/         # Core utilities (Result, Safety)
│       ├── memory/       # Memory structures (Arena, Allocator)
│       ├── types/        # Primitives and String types
│       └── camelot.h     # Umbrella header
├── src/                  # Implementation (.c files)
├── tests/                # Unit and Integration Tests
├── merlin/               # Merlin Build Orchestrator
├── Makefile              # Bootstrap entry point
└── README.md             # Project entry point
```

### Architecture

- **Rationale**: To separate interface from implementation and enable dead-code elimination.
- **Solves**: Header collisions, unintended API usage and large binary sizes.
- **Pros**: Strict API boundaries, modular compilation and flat namespaces.
- **Cons**: Requires explicit include paths and directory mirroring.

## Usage

To use the library, include the umbrella header:

```c
#include <camelot/camelot.h>
```

This includes all primitives, allocators, arenas, result types and safety restrictions.

## License

Camelot is released under the Mozilla Public License 2.0 (MPL-2.0) and is OpenSSF Best Practices certified.
