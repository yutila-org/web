---
layout: ../../../layouts/MerlinDocsLayout.astro
title: Getting Started
description: How to build custom projects with the Merlin build engine.
---

Merlin is designed to scaffold, build and test C projects. It utilizes a predefined directory structure and compiler flags to enforce safety constraints.

## Project Initialization

You can create a new project from scratch using the `new` command, which creates a new directory, or you can scaffold an existing directory using `init`.

### Using `new`
```bash
merlin new my_project
cd my_project
```

### Using `init`
```bash
mkdir my_project
cd my_project
merlin init
```

## Directory Structure

Merlin expects a strict directory layout. This is automatically generated when you scaffold a project.

```text
my_project/
├── src/                # All implementation (.c) and header (.h) files
│   └── main.c          # The entry point of the executable
├── tests/              # All unit and integration tests (.c)
│   └── test_main.c
├── bin/                # Generated executable binaries (ignored by Git)
├── obj/                # Generated object files (ignored by Git)
├── compile_flags.txt   # Configuration for Language Servers (clangd)
└── .gitignore
```

- **`src/`**: Place all of your application code here. Merlin recursively scans this directory.
- **`tests/`**: Place your tests here. These are compiled and linked against `src/` when running `merlin test`.

## Building and Running

Once your project is structured correctly, use the following commands to orchestrate your build.

### Building
To compile your project:
```bash
merlin all
```
The resulting binary will be placed in the `bin/` directory.

### Running
To compile (if necessary) and immediately run your project:
```bash
merlin run
```

### Testing
To run the automated sanitizer test suite:
```bash
merlin test
```

This requires a zero exit code from ASan (exit code 1), UBSan (exit code 1) and LSan (exit code 23).

> [!NOTE] Example: Handling Test Failures
> While your C test suite should return `0` on success, sanitizers operate at the compiler level. If they detect a violation, they will override your program's return value and force a specific exit code. 
> 
> For example, this C test will trigger a leak and cause the process to exit with **23**, bypassing the `return 0`:
> ```c
> int main() {
>     void* leak = malloc(100); 
>     return 0; // LSan intercepts this and exits with 23
> }
> ```
> 
> You can catch these specific codes in your CI/CD pipelines to know exactly what failed:
> ```bash
> #!/bin/bash
> merlin test
> EXIT_CODE=$?
> 
> if [ $EXIT_CODE -eq 23 ]; then
>     echo "Memory leak detected! Check your deallocations."
>     exit $EXIT_CODE
> elif [ $EXIT_CODE -ne 0 ]; then
>     echo "Undefined behavior or memory corruption detected!"
>     exit $EXIT_CODE
> fi
> 
> echo "All tests passed successfully."
> ```

## Adding Dependencies

Merlin is designed for self-contained projects using the Camelot utility library. Currently, external dependencies must be added as source files directly into the `src/` directory. Static library linking support (`.a` / `.lib`) is planned for future releases.
