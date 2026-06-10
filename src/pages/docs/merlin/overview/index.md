---
layout: ../../../../layouts/MerlinDocsLayout.astro
title: Merlin Build Engine
description: The Merlin TUI build orchestrator — architecture, compiler detection and CI/CD integration.
---

Merlin is the build engine for Camelot, written in the D programming language.

## Why D instead of C?

D was chosen as Merlin's implementation language instead of C because it provides modern, high-level orchestration capabilities without sacrificing native performance:

- **Memory-Safe Orchestration**: String manipulation, dynamic arrays and regex support are built-in with zero-cost slicing. In C, manual memory management for complex path resolution and string parsing is notoriously error-prone and verbose.
- **Native Process Spawning**: `std.process` enables secure and seamless execution of compiler child processes, avoiding the low-level boilerplate of `fork`, `execvp` and manual pipe handling required in pure C.
- **Recursive Filesystem Traversal**: `std.file.dirEntries` allows effortless scanning of source and test directories without the complexity of interacting directly with POSIX `dirent` or Windows-specific APIs.
- **Static Binary Compilation**: Like C, D compiles to a single, standalone native binary with no heavyweight runtime dependencies (unlike Python or Node.js), retaining C-like speed and deployment simplicity.

## Security Mechanics

Merlin enforces strict compiler flags (`-Wall -Werror -fPIE -fstack-protector-strong`) and automated sanitizer execution (`-fsanitize=address,undefined,leak`) at the build-orchestration level. This structurally prohibits the compilation or deployment of memory-unsafe patterns. Deviating from these specific build instructions strips the library of its security guarantees.

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
    @dmd merlin/app.d merlin/builder.d merlin/tui.d -of=bin/merlin
```

> [!NOTE] Outputs
> Produces a compiled binary in the `bin/` directory or object files in the `obj/` directory.

| Pros | Cons |
|------|------|
| Native process control. | Requires an external compiler (`dmd`) for bootstrapping the build system itself. |
| Recursive directory scanning. | |
| Static binary deployment. | |

> [!WARNING] Caveats
> Requires the D compiler (`dmd`) for bootstrap compilation.

## Commands

> [!TIP] Rationale
> Consolidating build logic into a single binary prevents platform-dependent shell scripting.

### What it does
Merlin exposes a CLI for project scaffolding, building, testing and cleaning.

### Usage

```bash
./bin/merlin <command>
```
- `all`: Compiles the framework. Scans `src/` and outputs the executable to `bin/camelot`.
- `test`: Executes the sanitizer test suite. Links `tests/` sources and executes `bin/test_camelot`.
- `run`: Builds and launches the executable via a child process.
- `clean`: Recursively deletes the `obj/` and `bin/` directories.
- `init`: Scaffolds a standard project structure in the **current directory**. Generates `src/main.c`, `tests/test_main.c`, `.gitignore` and `compile_flags.txt`.
- `new <name>`: Creates a **new directory** with the given name and scaffolds the project structure inside it.

> [!NOTE] Outputs
> Project directories, binaries or test execution logs depending on the command.

| Pros | Cons |
|------|------|
| Unified interface for all developer tasks. | Custom CLI replaces standard `make` workflows. |
| Non-interactive mode for CI/CD pipelines when invoked with command arguments. | |

> [!CAUTION] Caveats
> The `test` command requires a zero exit code from ASan, UBSan and LSan. Memory leaks will cause the CI pipeline to crash.

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
