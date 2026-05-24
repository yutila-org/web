---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Merlin Build Engine
description: The Merlin TUI build orchestrator — architecture, compiler detection and CI/CD integration.
---

Merlin is the singular build engine for the Camelot toolkit, written in the **D programming language**. It replaces traditional Makefiles and CMake with an interactive TUI supervisor.

## Why D?

D was chosen as Merlin's implementation language because it provides:

- **Native process spawning** via `std.process` for invoking GCC
- **Recursive filesystem traversal** via `std.file.dirEntries`
- **String manipulation** with zero-cost slicing and regex support
- **Compilation to a single static binary** — no runtime dependencies

The Makefile serves only as a bootstrap entry point: it compiles `merlin.d` into `bin/merlin` using `dmd`, then delegates all subsequent build logic to Merlin.

## Bootstrap Sequence

```text
make ──► dmd merlin.d -of=bin/merlin ──► ./bin/merlin all
         (bootstrap)                     (build orchestration)
```

The Makefile's default target:

```makefile
MERLIN_BIN := bin/merlin

default: $(MERLIN_BIN)
    @./$(MERLIN_BIN) all $(if $(RELEASE),RELEASE=1,)

$(MERLIN_BIN): merlin.d
    @dmd merlin.d -of=bin/merlin
```

## Dynamic C23 Standard Detection

GitHub Actions runners ship with varying GCC versions. Older GCC (≤13) aliases the C23 standard as `-std=c2x`, while newer GCC uses `-std=c23`. Merlin dynamically probes the compiler at build time:

```d
string stdFlag = "-std=c23";
try {
    auto res = executeShell("gcc -std=c23 -E - < /dev/null");
    if (res.status != 0) {
        stdFlag = "-std=c2x";
    }
} catch (Exception e) {
    stdFlag = "-std=c2x";
}
```

This ensures zero manual configuration regardless of the host environment.

## Compilation Pipeline

For each `.c` source file, Merlin:

1. **Recursively scans** `src/` for all `.c` files
2. **Detects the entry point** by searching for `int main` in source text
3. **Compiles each file** independently with full warning and security flags
4. **Links** all object files into the final binary

### Compiler Flags

All flags are injected automatically by Merlin based on the active profile:

**All Builds (Exploit Mitigation):**

| Flag | Purpose |
|---|---|
| `-Wall -Wextra -Wpedantic -Werror` | Maximum warning coverage, treated as errors |
| `-fPIE` | Position-Independent Executable (ASLR) |
| `-fstack-protector-strong` | Stack canary instrumentation |
| `-Iinclude` | Public header include path |

**Debug Profile** (`make` or `make all`):

| Flag | Purpose |
|---|---|
| `-O0 -g` | No optimization, full debug symbols |
| `-fsanitize=address,undefined,leak` | ASan + UBSan + LSan runtime checks |
| `-ftrapv` | Trap on signed integer overflow |

**Release Profile** (`make all RELEASE=1`):

| Flag | Purpose |
|---|---|
| `-O2` | Optimization level 2 |
| `-D_FORTIFY_SOURCE=2` | Automated bounds checking for libc functions |
| `-fwrapv` | Define signed overflow as two's complement wrap |
| `-fno-delete-null-pointer-checks` | Preserve null dereference checks |
| `-fno-strict-overflow` | Prevent optimizations relying on undefined overflow |

**Linker Flags (All Builds):**

| Flag | Purpose |
|---|---|
| `-pie` | Link as Position-Independent Executable |
| `-Wl,-z,noexecstack` | Mark stack as non-executable (NX bit) |

## Interactive TUI Shell

When launched without arguments, Merlin presents an animated terminal dashboard with project metrics and an interactive command prompt:

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃          .                                                              ┃
┃         / \                                                             ┃
┃       /_____\    *   M E R L I N   B U I L D   S Y S T E M   v1.0   *  ┃
┃       ( •⩊• )  < "Poof! Let's cast some build spells!"                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  Compiler : gcc (v14.2.1)               Profile : DEBUG (Sanitized)     ┃
┃  Standard : C23 (-std=c23)                   Target  : camelot          ┃
┃  Sources  : 2      Headers : 6          Tests   : 0                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  make all   Compile framework          make test  Run tests (ASan)      ┃
┃  make run   Launch executable          make clean Clean workspace       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🔮 Merlin >
```

## Command Reference

### `all`

**Aliases**: `build`, `1`

**Summary**: Compiles the entire Camelot framework. It discovers all `.c` files in the `src/` directory and compiles them based on the active profile.

- **Side Effects**: Generates object files in `obj/` and outputs the final binary to `bin/camelot`.
- **Errors**: Halts and displays compiler errors if any source file fails to compile.

<details>
<summary><b>Example Usage</b></summary>

```bash
# Interactive mode
🔮 Merlin > all

# Non-interactive CI mode
./bin/merlin all
```

</details>

### `test`

**Aliases**: `2`

**Summary**: Compiles and executes the sanitizer test suite. It builds all framework objects and test files, automatically excluding the main application entry point.

- **Side Effects**: Generates the `bin/test_camelot` executable and runs it.
- **Errors**: Returns a non-zero exit code if any assertions fail or if Address/Leak/Undefined Behavior Sanitizers detect issues.

<details>
<summary><b>Example Usage</b></summary>

```bash
🔮 Merlin > test
```

</details>

### `run`

**Aliases**: `3`

**Summary**: Builds the executable (if not already up-to-date) and launches it directly from the build engine.

- **Side Effects**: Suspends Merlin temporarily while the child process `bin/camelot` runs.
- **See Also**: [`all`](#all)

### `clean`

**Aliases**: `4`

**Summary**: Purges all generated artifacts to ensure a pristine workspace.

- **Side Effects**: Recursively deletes the `obj/` and `bin/` directories.

<details>
<summary><b>Example Usage</b></summary>

```bash
🔮 Merlin > clean
```

</details>

### `help`

**Aliases**: `dashboard`, `h`

**Summary**: Redraws the interactive dashboard UI. Useful if the terminal gets cluttered by compiler warnings or child process output.

### `exit`

**Aliases**: `quit`, `q`, `5`

**Summary**: Gracefully terminates the interactive Merlin shell and returns to the system prompt.

### CI/CD Non-Interactive Mode

When invoked with arguments (e.g., `./bin/merlin all`), Merlin executes the command immediately and exits — no TUI, no interactive prompt. The main loop also handles `EOF` gracefully:

```d
string line = readln();
if (line is null) {
    break;  // stdin closed, exit cleanly
}
```

This prevents infinite CPU spin-loops when running under GitHub Actions or other headless CI runners.

## Test Orchestration

Merlin's test pipeline (`make test`) performs:

1. **Excludes the main entry point** — filters out the file containing `int main` to avoid linker conflicts
2. **Compiles all framework sources** into object files with sanitizer flags
3. **Scans `tests/`** for test source files
4. **Compiles test sources** with the same sanitizer flags
5. **Links** framework objects + test objects into `bin/test_camelot`
6. **Executes** the test binary — any ASan/UBSan/LSan violation causes a non-zero exit code
