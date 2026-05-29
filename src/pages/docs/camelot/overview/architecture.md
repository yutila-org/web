---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Architecture
description: The full architectural design of Camelot — VTable dispatch, module hierarchy and data flow.
---

The architecture of the Camelot ecosystem is split into two distinct tiers: **the Orchestrator** (Merlin, in D) and **the Framework** (Camelot, in C23). Together they form a self-contained development platform.

## Allocator Agnosticism (VTable)

At the absolute foundation of Camelot's architecture is the `Allocator` VTable — an abstract interface that decouples every data structure from its memory source.

```c
typedef struct Allocator Allocator;
struct Allocator {
    void* (*allocate)(Allocator* self, size_t size, size_t align);
    void  (*free)(Allocator* self, void* ptr, size_t size);
};
```

Hardcoding `malloc` and `free` throughout a codebase creates rigid structures. The VTable solves this by allowing any Camelot type to be instantiated with a heap allocator, a local arena or a stack buffer — remaining completely agnostic to where the memory actually comes from.

This means the same `Vector` or `Table` can operate on heap memory in production and on a fixed arena in tests, without changing a single line of its internal logic.

## Result Type (Tri-State Error Model)

Standard C lacks mechanisms to enforce return value checking and frequently conflates expected logic branching (e.g., a missing table key) with systemic failures (e.g., out-of-memory). Camelot solves this with a tri-state tagged union:

```c
typedef enum {
    OK,   // Operation succeeded
    NIL,  // Intentional absence (e.g., key not found)
    ERR   // System failure (e.g., out of memory)
} State;

typedef struct [[nodiscard]] {
    State state;
    union {
        void* val;       // Success payload
        u32 err_code;    // Domain-prefixed error code
    } payload;
} Result;
```

Error codes are domain-prefixed to prevent collision across subsystems:

```c
#define DOMAIN_CAMELOT 0x00010000
#define DOMAIN_APP     0x00020000

#define ERR_OUT_OF_MEMORY (DOMAIN_CAMELOT | 0x0001)
#define ERR_FILE_ERROR    (DOMAIN_CAMELOT | 0x0002)
#define ERR_OUT_OF_BOUNDS (DOMAIN_CAMELOT | 0x0003)
```

The C23 `[[nodiscard]]` attribute (with fallback to `__attribute__((warn_unused_result))` on Clang) ensures callers can never silently ignore a `Result`.

## Explicit Deferral (goto cleanup)

Functions with multiple return paths frequently leak memory or file handles. Camelot enforces a strict convention: all fallible functions return through a single cleanup block via `goto`:

```c
Result IO_file(Allocator* alloc, String path) {
    Result res = { .state = ERR, .payload.err_code = ERR_FILE_ERROR };
    void* buffer = alloc->allocate(alloc, 1024, 8);

    if (buffer == nullptr) {
        res.payload.err_code = ERR_OUT_OF_MEMORY;
        goto defer;
    }

    res.state = OK;
    res.payload.val = buffer;

defer:
    if (res.state == ERR && buffer != nullptr) {
        alloc->free(alloc, buffer, 1024);
    }
    return res;
}
```

This ensures deterministic resource release regardless of where the error occurred.

## Explicit Deinit

Every owning type is paired with a mandatory, standardized destruction function. It safely delegates the free operation back to the specific `Allocator` interface that created it:

```c
void VECTOR_deinit(Vector* arr) {
    if (arr->data != nullptr) {
        arr->alloc->free(arr->alloc, arr->data, arr->cap * arr->stride);
    }
    arr->len = 0;
    arr->cap = 0;
}
```

## Safety Header (Compile-Time Function Poisoning)

The `camelot/core/safety.h` header uses `#pragma GCC poison` to transform any reference to banned legacy C string functions into a hard compilation error:

```c
#ifndef ALLOW_UNSAFE
  #if defined(__GNUC__) || defined(__clang__)
    #pragma GCC poison strcpy strcat strncpy strncat
  #elif defined(_MSC_VER)
    // MSVC: Enforcement delegated to /W4 + static analysis.
  #endif
#endif
```

Legacy string functions (`strcpy`, `strcat`, `strncpy`, `strncat`) are the root cause of the majority of buffer overflow CVEs. Including this header ensures they cannot be referenced in any translation unit. The `ALLOW_UNSAFE` guard permits explicit developer opt-out when strictly necessary.

## Primitives

Standard C primitive sizes vary across architectures. Camelot's `primitives.h` provides deterministic, fixed-width types:

```c
typedef uint8_t  u8;   typedef int8_t   i8;
typedef uint16_t u16;  typedef int16_t  i16;
typedef uint32_t u32;  typedef int32_t  i32;
typedef uint64_t u64;  typedef int64_t  i64;
typedef float    f32;
typedef double   f64;
```

A C23 `nullptr` polyfill is also provided for pre-C23 compilers:

```c
#if !defined(__cplusplus) && (!defined(__STDC_VERSION__) || __STDC_VERSION__ < 202311L)
#define nullptr ((void*)0)
#endif
```

## Module Dependency Graph

All modules flow through the Allocator VTable. The dependency chain is strictly acyclic:

```
primitives.h ──► allocator.h ──► arena.h
                      │
                      ├──► result.h
                      ├──► safety.h
                      └──► camelot.h (umbrella)
```

Every public header is accessed through the `camelot/` namespace prefix (e.g., `#include <camelot/memory/arena.h>`) and compiled with the `-Iinclude` flag.
