---
layout: ../../../layouts/MerlinDocsLayout.astro
title: CLI Commands
description: Complete catalogue of Merlin CLI commands and options.
---

Merlin exposes a CLI for project scaffolding, building, testing and cleaning.

## Commands

### `all`
Compiles the framework or project.
- **Usage**: `merlin all`
- **Description**: Scans the `src/` directory recursively for all `.c` files, compiles them independently and links the object files into the final binary.
- **Output**: Produces an executable in the `bin/` directory.

### `test`
Executes the sanitizer test suite.
- **Usage**: `merlin test`
- **Description**: Links the sources in the `tests/` directory with the project's source files and compiles them with memory and undefined behavior sanitizers enabled (`-fsanitize=address,undefined,leak`). 
- **Output**: Executes `bin/test_executable` and outputs the test results.
- > [!CAUTION] Caveats
  > Requires a zero exit code from ASan (exit code 1), UBSan (exit code 1) and LSan (exit code 23). Memory leaks will cause the pipeline to crash.

### `run`
Builds and launches the executable.
- **Usage**: `merlin run`
- **Description**: Automatically triggers the `all` command to compile the executable if necessary, then immediately launches it via a child process.
- **Output**: Streams the standard output and standard error of the child process.

### `clean`
Removes build artifacts.
- **Usage**: `merlin clean`
- **Description**: Recursively deletes the `obj/` and `bin/` directories, ensuring a fresh state for the next build.
- **Output**: Removes directories and their contents.

### `init`
Scaffolds a standard project structure in the current directory.
- **Usage**: `merlin init`
- **Description**: Generates `src/main.c`, `tests/test_main.c`, `.gitignore` and `compile_flags.txt` in the current working directory.
- **Output**: Project scaffolding files.

### `new`
Creates a new directory and scaffolds the project structure inside it.
- **Usage**: `merlin new <project_name>`
- **Description**: Creates a directory with the given name and performs the equivalent of `merlin init` inside it.
- **Output**: A new project folder containing the scaffolded files.
