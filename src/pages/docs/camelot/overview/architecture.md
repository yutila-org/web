---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Architecture
description: Architectural design of Camelot — VTable dispatch, error types and data flow.
---

Camelot is a utility library built in C23, orchestrated by Merlin.

## Allocator (Library)

Camelot utilizes an `Allocator` VTable to decouple data structures from memory sources.

- **Rationale**: To eliminate hardcoded `malloc` and `free` calls.
- **Solves**: Global heap contention, memory fragmentation and inability to swap allocation strategies for testing.
- **Pros**: Enables custom allocation (arenas, stack buffers), exact memory tracking and isolated teardown.
- **Cons**: Requires passing an `Allocator*` to every function and incurs a function pointer dereference overhead.

### Usage

```c
typedef struct Allocator Allocator;
struct Allocator {
    void* (*allocate)(Allocator* self, size_t size, size_t align);
    void  (*free)(Allocator* self, void* ptr, size_t size);
};
```

## Result (Compiler)

Camelot requires a tri-state tagged union for fallible operations.

- **Rationale**: C lacks native error handling and return value enforcement.
- **Solves**: Conflation of expected logic branching with system failures and silently ignored errors.
- **Pros**: Forces explicit error handling at call sites and standardizes error representation.
- **Cons**: Increases verbosity and requires manual unpacking of state payloads.

### Usage

```c
typedef enum {
    OK,
    NIL,
    ERR
} State;

typedef struct [[nodiscard]] {
    State state;
    union {
        void* val;
        u32 err_code;
    } payload;
} Result;
```

Error codes are domain-prefixed (Convention-only):
```c
#define DOMAIN_CAMELOT 0x00010000
#define ERR_OUT_OF_MEMORY (DOMAIN_CAMELOT | 0x0001)
```

The `[[nodiscard]]` attribute generates a compiler warning if the return value is ignored.

## Deferral (Convention)

Functions with multiple return paths must return through a single cleanup block via `goto`.

- **Rationale**: To centralize resource deallocation.
- **Solves**: Memory and file handle leaks across complex branching logic.
- **Pros**: Reduces duplicated cleanup code and ensures deterministic release.
- **Cons**: Relies on developer discipline and uses `goto`.

### Usage

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

## Deinit (Convention)

Owning types require a standardized destruction function delegating to the origin `Allocator`.

- **Rationale**: To map object destruction precisely to its creation mechanism.
- **Solves**: Dangling pointers and mismatched allocator freeing.
- **Pros**: Uniform teardown semantics.
- **Cons**: Requires explicit function calls per object.

### Usage

```c
void VECTOR_deinit(Vector* arr) {
    if (arr->data != nullptr) {
        arr->alloc->free(arr->alloc, arr->data, arr->cap * arr->stride);
    }
    arr->len = 0;
    arr->cap = 0;
}
```

## Safety (Compiler)

The `camelot/safety.h` header uses `#pragma GCC poison`.

- **Rationale**: Legacy C string functions are highly susceptible to buffer overflows.
- **Solves**: Accidental usage of `strcpy`, `strcat`, `strncpy` and `strncat`.
- **Pros**: Halts compilation if banned functions are referenced.
- **Cons**: Fails on legacy codebases attempting to integrate Camelot without `ALLOW_UNSAFE`.

### Usage

```c
#ifndef ALLOW_UNSAFE
  #if defined(__GNUC__) || defined(__clang__)
    #pragma GCC poison strcpy strcat strncpy strncat
  #endif
#endif
```

## Primitives (Compiler)

Fixed-width types guarantee architectural consistency.

- **Rationale**: Standard C types vary across platforms.
- **Solves**: Integer overflow bugs across 32-bit and 64-bit platforms.
- **Pros**: Exact sizing for cross-platform structs and binary protocols.
- **Cons**: Requires non-standard type names compared to `stdint.h`.

### Usage

```c
typedef uint8_t  u8;   typedef int8_t   i8;
typedef uint16_t u16;  typedef int16_t  i16;
typedef uint32_t u32;  typedef int32_t  i32;
typedef uint64_t u64;  typedef int64_t  i64;
typedef float    f32;
typedef double   f64;
```
