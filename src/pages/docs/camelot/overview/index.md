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

> [!NOTE] Outputs
> Traceable execution, isolated memory regions and compiler-verified error checking.

> [!WARNING] Caveats
> Requires strict adherence to conventions.

> [!TIP] Rationale
> To reduce undefined behavior and memory leaks common in C applications caused by implicit state mutation, uncontrolled heap allocations and unhandled error states.

| Pros | Cons |
|------|------|
| Completely eliminates whole classes of undefined behavior. | Verbose error handling. |

## Guarantees

### What it does
Camelot enforces constraints across four specific layers to ensure safety.

### Usage
1. **Compiler-enforced**: Error handling via `[[nodiscard]]` and poisoned legacy functions via `#pragma GCC poison`.
2. **Library-enforced**: Memory isolation via the `Allocator` VTable.
3. **Test-enforced**: Memory leak and bounds checking via ASan, UBSan and LSan in CI/CD.
4. **Convention-only**: Explicit Deferral (`goto defer`) and domain-prefixed naming conventions.

> [!NOTE] Outputs
> A verifiable security model indicating exactly how a constraint is applied.

> [!CAUTION] Caveats
> Convention-only guarantees are not verified by tooling and rely entirely on the developer. 

> [!TIP] Rationale
> Not all safety constraints can be enforced by the C compiler. Distinguishing between them provides clarity on risk vectors.

| Pros | Cons |
|------|------|
| Clear delineation of responsibility between tooling and developer. | Fragmented enforcement mechanisms. |

## Naming

### What it does
Functions utilize the `DOMAIN_functionSubfunction` format.

### Usage
- **Domain prefix**: Uppercase (e.g., `ARENA`, `VECTOR`, `STRING`).
- **Primary function name**: Lowercase.
- **Subfunction qualifier**: CamelCase.

> [!NOTE] Outputs
> Provides a pseudo-namespace mapping to prevent symbol collision.

> [!WARNING] Caveats
> This is a convention-only guarantee.

> [!TIP] Rationale
> C lacks native namespaces.

| Pros | Cons |
|------|------|
| Immediate identification of the subsystem an API belongs to. | Results in long function names. |

## Portability

### What it does
Reliance on non-standard runtime compiler extensions is prohibited.

### Usage
- Attributes operating during compilation (e.g., `[[nodiscard]]`) are required.
- Runtime-altering extensions (e.g., GCC's `__attribute__((cleanup))`) are prohibited.

> [!NOTE] Outputs
> Cross-platform codebase compatible with GCC, Clang and MSVC.

> [!CAUTION] Caveats
> MSVC lacks `#pragma poison` equivalents. Enforcement is delegated to static analysis on Windows.

> [!TIP] Rationale
> To ensure the library compiles on any modern operating system without vendor lock-in.

| Pros | Cons |
|------|------|
| High portability. | Cannot utilize ergonomic extensions like automatic scope-based cleanup. |

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

> [!NOTE] Outputs
> Includes all primitives, allocators, arenas, result types and safety restrictions into the translation unit.

> [!WARNING] Caveats
> Requires explicit include paths (`-Iinclude`).

> [!TIP] Rationale
> To separate interface from implementation and enable dead-code elimination while preventing header collisions.

| Pros | Cons |
|------|------|
| Strict API boundaries. | Requires directory mirroring between `include/` and `src/`. |
| Modular compilation. | |
