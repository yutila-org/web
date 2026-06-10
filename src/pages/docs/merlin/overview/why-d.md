---
layout: ../../../../layouts/MerlinDocsLayout.astro
title: Why D?
description: Why Merlin was built using D instead of C.
---

# Why D instead of C?

D was chosen as Merlin's implementation language instead of C because it provides modern, high-level orchestration capabilities without sacrificing native performance:

- **Memory-Safe Orchestration**: String manipulation, dynamic arrays and regex support are built-in with zero-cost slicing. In C, manual memory management for complex path resolution and string parsing is notoriously error-prone and verbose.
- **Native Process Spawning**: `std.process` enables secure and seamless execution of compiler child processes, avoiding the low-level boilerplate of `fork`, `execvp` and manual pipe handling required in pure C.
- **Recursive Filesystem Traversal**: `std.file.dirEntries` allows effortless scanning of source and test directories without the complexity of interacting directly with POSIX `dirent` or Windows-specific APIs.
- **Static Binary Compilation**: Like C, D compiles to a single, standalone native binary with no heavyweight runtime dependencies (unlike Python or Node.js), retaining C-like speed and deployment simplicity.
