---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Introduction
description: A quick look at the Camelot C framework.
---

Camelot is a simple C framework that focuses on memory safety and predictable behavior using C23. It comes with its own build tool called **Merlin** (written in D).

Instead of using `malloc` directly and dealing with memory leaks, Camelot provides memory arenas. It also includes basic data structures and error handling, and it works across GCC, Clang, and MSVC.

## Why we built it

We wanted a C framework that's easy to read, doesn't break unexpectedly, and runs anywhere without needing complex build setups. We prefer keeping things straightforward over adding fancy syntax.

### Naming rules

All functions follow a strict `DOMAIN_functionSubfunction` naming style so you always know what a function does just by looking at it:

- **Domain prefix**: Always uppercase (e.g., `ARENA`, `VECTOR`, `STRING`)
- **Primary function name**: Always lowercase
- **Subfunction qualifier**: Added in camelCase with no extra underscores

We also try to avoid weird abbreviations unless they are very common (like `IO`).

### Keeping it portable

We avoid using non-standard compiler extensions that change how the code runs. 
- Compile-time checks (like `__attribute__((warn_unused_result))`) are fine.
- Things that change behavior at runtime (like GCC's `cleanup` attribute) are not allowed, because they don't work everywhere.

## Project Structure

```text
camelot/
├── include/              # Header files (what you include)
│   └── camelot/          
│       ├── core/         
│       ├── memory/       
│       ├── types/        
│       └── camelot.h     # Main header file
├── src/                  # The actual C code
│   ├── core/
│   ├── memory/
│   ├── io/
│   ├── ds/
│   └── types/
├── tests/                # Tests
├── merlin.d              # Build tool (Merlin)
├── Makefile              # Easy way to run Merlin
└── README.md             
```

### How the code is organized

1. **Clear separation**: Headers in `include/camelot/` define what you can use. Everything else stays hidden in `src/`.
2. **Matching folders**: The `src/` folder matches the `include/` folder exactly.
3. **Flat names**: All headers are under the `camelot/` folder so they don't clash with your own code.

## How to use it

Just include the main header file:

```c
#include <camelot/camelot.h>
```

This will include everything you need to start using the framework.

## License

Camelot uses the **Mozilla Public License 2.0 (MPL-2.0)** and is [OpenSSF Best Practices certified](https://www.bestpractices.dev/projects/12919).
