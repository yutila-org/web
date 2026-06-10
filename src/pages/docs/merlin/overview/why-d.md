---
layout: ../../../../layouts/MerlinDocsLayout.astro
title: Why D?
description: Architectural decisions for selecting D over C for the Merlin build engine.
---

# Why D instead of C?

Building a cross-platform orchestrator requires manipulating complex strings, recursively scanning filesystems and natively spawning child processes. Doing this safely in C involves significant boilerplate and high risk of memory vulnerabilities. D was chosen because it delivers the ergonomics of a scripting language while retaining the bare-metal performance of C.

> [!TIP] The Philosophy
> Merlin aims to replace bloated build pipelines by offering a statically compiled, fast and safe build engine without requiring heavy runtimes like Node.js or Python.

## Core Advantages

### Memory-Safe Orchestration
String manipulation, dynamic arrays and regex support are built directly into D with zero-cost slicing. In C, manual memory management (`malloc` / `free`) for complex path resolution is notoriously error-prone and verbose.

| D Implementation | C Equivalent |
|------------------|--------------|
| Native slicing (`str[0 .. 5]`) | Manual `memcpy` and null-termination |
| Garbage-collected strings | Prone to buffer overflows and leaks |
| Safe array concatenations (`~`) | Verbose `realloc` and capacity tracking |

### Native Process Spawning
`std.process` enables secure, seamless execution of GCC/Clang child processes. It completely sidesteps the low-level boilerplate required in pure C.

```d
// Executing the compiler in D
auto result = executeShell("gcc -Wall -c main.c -o main.o");
if (result.status != 0) {
    writeln("Compilation failed: ", result.output);
}
```

> [!WARNING] C Boilerplate
> Replicating the above in C requires `fork()`, `execvp()`, manual pipe creation (`pipe()`), `waitpid()` and signal handling across different operating systems.

### Effortless Filesystem Traversal
Build systems need to deeply scan source trees. `std.file.dirEntries` allows Merlin to lazily iterate over source files and tests without interacting with verbose POSIX `dirent` or convoluted Windows-specific APIs.

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
