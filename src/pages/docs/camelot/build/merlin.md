---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Merlin Build Engine
description: The Merlin TUI build orchestrator — architecture, compiler detection and CI/CD integration.
---

Merlin is the build engine for Camelot, written in the D programming language.

## Security Mechanics

Merlin enforces strict compiler flags (`-Wall -Werror -fPIE -fstack-protector-strong`) and automated sanitizer execution (`-fsanitize=address,undefined,leak`) at the build-orchestration level. This structurally prohibits the compilation or deployment of memory-unsafe patterns. Deviating from these specific build instructions strips the library of its security guarantees.

## Orchestration

### What it does
Merlin replaces Makefiles with a supervised compilation process. It recursively scans `src/` for `.c` files, identifies the entry point, compiles each file independently, and links object files into the final binary.

### Usage
The Makefile acts exclusively as a bootstrap trigger:

```makefile
MERLIN_BIN := bin/merlin

default: $(MERLIN_BIN)
    @./$(MERLIN_BIN) all $(if $(RELEASE),RELEASE=1,)

$(MERLIN_BIN): merlin/app.d merlin/builder.d merlin/tui.d
    @dmd merlin/app.d merlin/builder.d merlin/tui.d -of=bin/merlin
```

### Outputs
Produces a compiled binary in the `bin/` directory or object files in the `obj/` directory.

### Caveats
Requires the D compiler (`dmd`) for bootstrap compilation.

### Rationale
Makefiles lack objective external state tracking and cross-platform native execution.

### Pros
- Native process control.
- Recursive directory scanning.
- Static binary deployment.

### Cons
- Requires an external compiler (`dmd`) for bootstrapping the build system itself.

## Commands

### What it does
Merlin exposes a CLI for project scaffolding, building, testing, and cleaning.

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

### Outputs
Project directories, binaries, or test execution logs depending on the command.

### Caveats
The `test` command requires a zero exit code from ASan, UBSan and LSan.

### Rationale
Consolidating build logic into a single binary prevents platform-dependent shell scripting.

### Pros
- Unified interface for all developer tasks.
- Non-interactive mode for CI/CD pipelines when invoked with command arguments.

### Cons
- Custom CLI replaces standard `make` workflows.

## Flags

### What it does
Merlin enforces specific compilation flags based on the target profile.

### Usage
- **All Builds:** `-Wall -Wextra -Wpedantic -Werror` (Warning strictness), `-fPIE` (Position-Independent Executable), `-fstack-protector-strong` (Stack canary), `-Iinclude` (Header resolution).
- **Debug Profile:** `-O0 -g` (Optimization disabled, symbols preserved), `-fsanitize=address,undefined,leak` (Runtime sanitizers), `-ftrapv` (Trap on signed integer overflow).
- **Release Profile:** `-O2` (Level 2 optimization), `-D_FORTIFY_SOURCE=2` (Bounds checking), `-fwrapv` (Signed overflow defined as two's complement wrap), `-fno-delete-null-pointer-checks` (Null dereference preservation), `-fno-strict-overflow` (Overflow optimization prevention).

### Outputs
Compiler directives applied during the build phase.

### Caveats
Sanitizers severely degrade runtime performance and are disabled in the release profile.

### Rationale
To guarantee bounds checking and memory safety during development, while ensuring performant bounds-checked binaries in production.

### Pros
- Uniform security baseline across all environments.

### Cons
- Prevents compilation of legacy C code with warnings.
