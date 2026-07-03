---
layout: ../../../../layouts/MerlinDocsLayout.astro
title: Merlin Build Engine
description: The Merlin TUI build orchestrator — architecture, compiler detection and CI/CD integration.
---

Merlin is the build orchestrator for the Camelot utility library, written in the D programming language.



## Security Mechanics

Merlin categorizes its safety guarantees through strict enforcement mechanisms:
- **Compiler-enforced**: Applies `-Wall -Werror -fPIE -fstack-protector-strong` to prohibit unsafe compilation patterns.
- **Test-enforced**: Requires automated sanitizer execution (`-fsanitize=address,undefined,leak`) to pass CI workflows.

## Orchestration

> [!TIP] Rationale
> Makefiles lack objective external state tracking and cross-platform native execution.

### What it does
Merlin replaces Makefiles with a supervised compilation process. It recursively scans `src/` for `.c` files, identifies the entry point, compiles each file independently and links object files into the final binary.

### Usage
The Makefile acts exclusively as a bootstrap trigger:

```makefile
MERLIN_BIN := bin/merlin

default: $(MERLIN_BIN)
    @./$(MERLIN_BIN) all $(if $(RELEASE),RELEASE=1,)

$(MERLIN_BIN): merlin/app.d merlin/builder.d merlin/tui.d
    @ldc2 merlin/app.d merlin/builder.d merlin/tui.d -of=bin/merlin
```

> [!NOTE] Outputs
> Produces a compiled binary in the `bin/` directory or object files in the `obj/` directory.

| Pros | Cons |
|------|------|
| Native process control. | Requires an external compiler (`ldc2`) for bootstrapping the build system itself. |
| Recursive directory scanning. | |
| Static binary deployment. | |

> [!WARNING] Caveats
> Requires the D compiler (`ldc2`) for bootstrap compilation.



## Flags

> [!TIP] Rationale
> To guarantee bounds checking and memory safety during development, while ensuring performant bounds-checked binaries in production.

### What it does
Merlin enforces specific compilation flags based on the target profile.

### Usage
- **All Builds:** `-Wall -Wextra -Wpedantic -Werror` (Warning strictness), `-fPIE` (Position-Independent Executable), `-fstack-protector-strong` (Stack canary), `-Iinclude` (Header resolution).
- **Debug Profile:** `-O0 -g` (Optimization disabled, symbols preserved), `-fsanitize=address,undefined,leak` (Runtime sanitizers), `-ftrapv` (Trap on signed integer overflow).
- **Release Profile:** `-O2` (Level 2 optimization), `-D_FORTIFY_SOURCE=2` (Bounds checking), `-fwrapv` (Signed overflow defined as two's complement wrap), `-fno-delete-null-pointer-checks` (Null dereference preservation), `-fno-strict-overflow` (Overflow optimization prevention).

> [!NOTE] Outputs
> Compiler directives applied during the build phase.

| Pros | Cons |
|------|------|
| Uniform security baseline across all environments. | Prevents compilation of legacy C code with warnings. |

> [!WARNING] Caveats
> Sanitizers severely degrade runtime performance and are disabled in the release profile.
