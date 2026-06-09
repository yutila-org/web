---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Introduction
description: Overview of the Camelot C23 utility library — its design philosophy, component model and the Merlin build orchestrator.
---

Camelot is a C23 utility library. It is orchestrated by **Merlin**, a build engine written in the D programming language.

Camelot provides structural alternatives to libc subsystems. It requires explicit allocator boundaries, localized memory arenas, a tri-state error model and specific compiler flags. It is portable across GCC, Clang and MSVC. It is not a foundational framework, web server or application runtime.

## Predictability

### What it does
Camelot prioritizes explicit mechanisms, cross-platform interoperability and traceable state transitions over developer convenience.

### Usage
By integrating the library and strictly following the `Allocator`, `Result` and `defer` patterns, developers achieve predictability.

### Outputs
Traceable execution, isolated memory regions and compiler-verified error checking.

### Caveats
Requires strict adherence to conventions.

### Rationale
To reduce undefined behavior and memory leaks common in C applications caused by implicit state mutation, uncontrolled heap allocations and unhandled error states.

### Pros
- Completely eliminates whole classes of undefined behavior.

### Cons
- Verbose error handling.

## Guarantees

### What it does
Camelot enforces constraints across four specific layers to ensure safety.

### Usage
1. **Compiler-enforced**: Error handling via `[[nodiscard]]` and poisoned legacy functions via `#pragma GCC poison`.
2. **Library-enforced**: Memory isolation via the `Allocator` VTable.
3. **Test-enforced**: Memory leak and bounds checking via ASan, UBSan and LSan in CI/CD.
4. **Convention-only**: Explicit Deferral (`goto defer`) and domain-prefixed naming conventions.

### Outputs
A verifiable security model indicating exactly how a constraint is applied.

### Caveats
Convention-only guarantees are not verified by tooling and rely on the developer.

### Rationale
Not all safety constraints can be enforced by the C compiler. Distinguishing between them provides clarity on risk vectors.

### Pros
- Clear delineation of responsibility between tooling and developer.

### Cons
- Fragmented enforcement mechanisms.

## Naming

### What it does
Functions utilize the `DOMAIN_functionSubfunction` format.

### Usage
- **Domain prefix**: Uppercase (e.g., `ARENA`, `VECTOR`, `STRING`).
- **Primary function name**: Lowercase.
- **Subfunction qualifier**: CamelCase.

### Outputs
Provides a pseudo-namespace mapping to prevent symbol collision.

### Caveats
This is a convention-only guarantee.

### Rationale
C lacks native namespaces.

### Pros
- Immediate identification of the subsystem an API belongs to.

### Cons
- Results in long function names.

## Portability

### What it does
Reliance on non-standard runtime compiler extensions is prohibited.

### Usage
- Attributes operating during compilation (e.g., `[[nodiscard]]`) are required.
- Runtime-altering extensions (e.g., GCC's `__attribute__((cleanup))`) are prohibited.

### Outputs
Cross-platform codebase compatible with GCC, Clang and MSVC.

### Caveats
MSVC lacks `#pragma poison` equivalents. Enforcement is delegated to static analysis on Windows.

### Rationale
To ensure the library compiles on any modern operating system without vendor lock-in.

### Pros
- High portability.

### Cons
- Cannot utilize ergonomic extensions like automatic scope-based cleanup.

## Structure

### What it does
The project isolates public APIs from private implementations.

### Usage
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

To use the library, include the umbrella header:

```c
#include <camelot/camelot.h>
```

### Outputs
Includes all primitives, allocators, arenas, result types and safety restrictions into the translation unit.

### Caveats
Requires explicit include paths (`-Iinclude`).

### Rationale
To separate interface from implementation and enable dead-code elimination while preventing header collisions.

### Pros
- Strict API boundaries.
- Modular compilation.

### Cons
- Requires directory mirroring between `include/` and `src/`.
