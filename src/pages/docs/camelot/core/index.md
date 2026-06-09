---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Core Utilities
description: Camelot core primitives including the Result type and Iterator patterns.
---

The Core subsystem provides foundational utilities required for error handling and standard traversal across Camelot data structures.

## Result (Compiler)

Camelot utilizes a tri-state tagged union (`Result`) for all fallible operations.

- **Rationale**: C lacks native exception handling and safe return value enforcement.
- **Solves**: Conflation of expected logic branching with system failures and silently ignored errors.
- **Pros**: Forces explicit error handling at call sites via compiler attributes.
- **Cons**: Increases verbosity and requires manual unpacking of state payloads.

### Usage

```c
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

The `CAMELOT_NODISCARD` macro expands to `[[nodiscard]]` in C23. It generates a compiler warning if the return value is ignored, preventing unhandled system failures.

## Iterator (Library)

The `Iterator` struct defines a polymorphic interface for sequential traversal.

- **Rationale**: To allow algorithms to operate over diverse collections without hardcoding specific loop structures.
- **Solves**: Duplicated iteration logic and tight coupling between algorithms and collection types.
- **Pros**: Standardized data traversal across vectors, lists and tables.
- **Cons**: Incurs a function pointer dereference overhead per iteration.

### Usage

```c
typedef struct Iterator Iterator;

struct Iterator {
    void* (*next)(Iterator* self);
};
```

Data structures provide specific iterator implementations (e.g., `VECTOR_Iterator`) that cast their `next` function to this signature.
