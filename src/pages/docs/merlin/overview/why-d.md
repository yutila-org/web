---
layout: ../../../../layouts/MerlinDocsLayout.astro
title: Why D?
description: Architectural decisions for selecting D over C for the Merlin build engine.
---

# Why D instead of C?

Building a cross-platform orchestrator requires manipulating strings, recursively scanning filesystems and natively spawning child processes. Doing this in C involves boilerplate and risk of memory vulnerabilities. D was chosen because it provides high-level string operations while compiling to a native executable.

> [!TIP] Architecture Decision
> Merlin provides a statically compiled build orchestrator without requiring runtimes like Node.js or Python.

## Core Advantages

### Memory-Safe Orchestration
String manipulation, dynamic arrays and regex support are built directly into D. In C, manual memory management (`malloc` / `free`) for path resolution is error-prone.

| D Implementation | C Equivalent |
|------------------|--------------|
| Native slicing (`str[0 .. 5]`) | Manual `memcpy` and null-termination |
| Garbage-collected strings | Prone to buffer overflows and leaks |
| Safe array concatenations (`~`) | Verbose `realloc` and capacity tracking |

### Native Process Spawning
`std.process` enables execution of GCC/Clang child processes. It abstracts the POSIX and Windows process APIs required in pure C.

```d
// Executing the compiler in D
auto result = executeShell("gcc -Wall -c main.c -o main.o");
if (result.status != 0) {
    writeln("Compilation failed: ", result.output);
}
```

> [!WARNING] C Boilerplate
> Replicating the above in C requires `fork()`, `execvp()`, manual pipe creation (`pipe()`), `waitpid()` and signal handling across different operating systems.

### Filesystem Traversal
Build systems recursively scan source trees. `std.file.dirEntries` iterates over source files and tests without requiring direct interaction with OS-specific APIs like POSIX `dirent`.

```d
// Recursively collect all C source files
auto sources = dirEntries("src/", "*.c", SpanMode.depth);
```

> [!NOTE] Cross-Platform Consistency
> D abstracts away OS-level path separators (`/` vs `\`), simplifying Windows and POSIX compatibility out-of-the-box.

### Zero-Dependency Static Binaries
Like C, D compiles directly to machine code. Merlin ships as a single, standalone native binary. 

| Language | Deployment Profile | Boot Speed |
|----------|-------------------|------------|
| **D (Merlin)** | Single Native Binary | Instantaneous (< 10ms) |
| Python / Node.js | Requires VM / Runtime | Slow (100ms+) |
| Make / CMake | Requires external binaries | Fast, but heavily fragmented |

> [!CAUTION] The Trade-Off
> Bootstrapping Merlin from scratch requires the D compiler (`dmd` or `ldc2`). However, once compiled, the resulting `merlin` binary requires absolutely zero external dependencies.
