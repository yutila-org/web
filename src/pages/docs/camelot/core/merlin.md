---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Merlin Build Engine
description: The Merlin TUI build orchestrator — architecture, compiler detection and CI/CD integration.
---

Merlin is the build engine for Camelot, written in the D programming language.

**Critical Mechanism**: The greatest security and reliability gains in Camelot come entirely from following the Merlin documentation and build instructions. By enforcing strict compiler flags (`-Wall -Werror -fPIE -fstack-protector-strong`) and automated sanitizer execution (`-fsanitize=address,undefined,leak`) at the build-orchestration level, Merlin structurally prohibits the compilation or deployment of memory-unsafe patterns. Deviating from these specific build instructions strips the library of its security guarantees.

## Orchestration Implementation

Merlin replaces Makefiles with a supervised compilation process.

- **Why it was designed that way**: Makefiles lack objective external state tracking and cross-platform native execution.
- **Problems it solves**: Platform-dependent shell scripting and disjointed test execution.
- **Pros**: Native process control, recursive directory scanning and static binary deployment.
- **Cons**: Requires the D compiler (`dmd`) for bootstrap compilation.

### Exact Usage Details: Bootstrap Sequence

The Makefile acts exclusively as a bootstrap trigger:

```makefile
MERLIN_BIN := bin/merlin

default: $(MERLIN_BIN)
    @./$(MERLIN_BIN) all $(if $(RELEASE),RELEASE=1,)

$(MERLIN_BIN): merlin/app.d merlin/builder.d merlin/tui.d
    @dmd merlin/app.d merlin/builder.d merlin/tui.d -of=bin/merlin
```

## Compilation Pipeline

Merlin executes the following exact sequence:
1. Recursively scans `src/` for `.c` files.
2. Identifies the entry point by parsing `int main`.
3. Compiles each file independently using the specific compiler flags defined below.
4. Links object files into the final binary.

### Compiler Flags (Compiler-enforced)

**All Builds:**
- `-Wall -Wextra -Wpedantic -Werror`: Warning strictness.
- `-fPIE`: Position-Independent Executable configuration.
- `-fstack-protector-strong`: Stack canary insertion.
- `-Iinclude`: Header resolution.

**Debug Profile:**
- `-O0 -g`: Optimization disabled, symbols preserved.
- `-fsanitize=address,undefined,leak`: Runtime sanitizers.
- `-ftrapv`: Trap on signed integer overflow.

**Release Profile:**
- `-O2`: Level 2 optimization.
- `-D_FORTIFY_SOURCE=2`: Bounds checking injection.
- `-fwrapv`: Signed overflow defined as two's complement wrap.
- `-fno-delete-null-pointer-checks`: Null dereference preservation.
- `-fno-strict-overflow`: Overflow optimization prevention.

## Command Reference

### `all`
Compiles the framework. Scans `src/` and outputs the executable to `bin/camelot`.
```bash
./bin/merlin all
```

### `test`
Executes the sanitizer test suite. Excludes the main entry point, links `tests/` sources and executes `bin/test_camelot`. Requires a zero exit code from ASan, UBSan and LSan. (Test-enforced).
```bash
./bin/merlin test
```

### `run`
Builds and launches the executable via a child process.

### `clean`
Recursively deletes the `obj/` and `bin/` directories.

### `init` and `new`
Scaffolds a standard project structure. Generates `src/main.c`, `tests/test_main.c`, `.gitignore` and `compile_flags.txt`.

### Exact Usage Details
Merlin operates in a TUI mode when executed without arguments, or in a non-interactive mode for CI/CD pipelines when invoked with command arguments (e.g., `./bin/merlin all`).
