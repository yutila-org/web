---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Core Utilities
description: Camelot core primitives including the Result type and Iterator patterns.
---

The Core subsystem provides foundational utilities required for error handling and standard traversal across Camelot data structures.

## Result

### What it does
Camelot utilizes a tri-state tagged union (`Result`) for all fallible operations.

### Usage
```c
#define DOMAIN_CAMELOT 0x00010000
#define DOMAIN_APP     0x00020000

#define ERR_OUT_OF_MEMORY (DOMAIN_CAMELOT | 0x0001)
#define ERR_FILE_ERROR    (DOMAIN_CAMELOT | 0x0002)
#define ERR_OUT_OF_BOUNDS (DOMAIN_CAMELOT | 0x0003)

typedef enum {
    OK,
    NIL,
    ERR
} State;

typedef struct CAMELOT_NODISCARD {
    State state;
    union {
        void* val;
        u32 err_code;
    } payload;
} Result;
```

> [!NOTE] Outputs
> Returns an evaluated state (`OK`, `NIL`, `ERR`) alongside an optional payload containing either the successful pointer or the specific domain-prefixed error code.

<!-- -->

> [!WARNING] Caveats
> The `CAMELOT_NODISCARD` macro expands to `[[nodiscard]]` in C23 or `__attribute__((warn_unused_result))`. It generates a compiler warning if the return value is ignored, preventing unhandled system failures.

<!-- -->

> [!TIP] Rationale
> C lacks native exception handling and safe return value enforcement.

| Pros | Cons |
|------|------|
| Forces explicit error handling at call sites via compiler attributes. | Increases verbosity. |
| Eliminates conflation of expected logic branching with system failures. | Requires manual unpacking of state payloads. |

## Iterator

### What it does
The `Iterator` struct defines a polymorphic interface for sequential traversal over any collection.

### Usage
```c
typedef struct Iterator Iterator;

struct Iterator {
    void* (*next)(Iterator* self);
};
```

<!-- -->

> [!NOTE] Outputs
> The `next` function pointer outputs the next available pointer in the collection, or `nullptr` when the collection is exhausted.

<!-- -->

> [!CAUTION] Caveats
> Data structures provide specific iterator implementations (e.g., `VECTOR_Iterator`) that safely cast their underlying structures into this signature.

<!-- -->

> [!TIP] Rationale
> To allow algorithms to operate over diverse collections without hardcoding specific loop structures.

| Pros | Cons |
|------|------|
| Standardized data traversal across vectors, lists and tables. | Incurs a function pointer dereference overhead per iteration. |
