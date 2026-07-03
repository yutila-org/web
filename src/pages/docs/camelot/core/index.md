---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Core Utilities
description: Camelot core primitives including the Result type and Iterator patterns.
---

The Core subsystem provides foundational utilities required for error handling and standard traversal across Camelot data structures.

## Result

> [!TIP] Rationale
> C lacks native exception handling and safe return value enforcement.

### Concept
Camelot utilizes a tri-state tagged union (`Result`) for all fallible operations.

### API Reference

#### `enum State`
```c
typedef enum {
    OK,
    NIL,
    ERR
} State;
```
- **Description**: Defines the three possible outcomes of an operation.

#### `struct Result`
```c
typedef struct CAMELOT_NODISCARD {
    State state;
    union {
        void* val;
        u32 err_code;
    } payload;
} Result;
```
- **Description**: Evaluated state (`OK`, `NIL`, `ERR`) alongside an optional payload containing either the successful pointer or the specific domain-prefixed error code.
- **Macros**:
  - `DOMAIN_CAMELOT 0x00010000`
  - `DOMAIN_APP     0x00020000`
  - `ERR_OUT_OF_MEMORY (DOMAIN_CAMELOT | 0x0001)`
  - `ERR_FILE_ERROR    (DOMAIN_CAMELOT | 0x0002)`
  - `ERR_OUT_OF_BOUNDS (DOMAIN_CAMELOT | 0x0003)`

> [!WARNING] Caveats
> The `CAMELOT_NODISCARD` macro expands to `[[nodiscard]]` in C23 or `__attribute__((warn_unused_result))`. It generates a compiler warning if the return value is ignored, preventing unhandled system failures.

## Iterator

> [!TIP] Rationale
> To allow algorithms to operate over diverse collections without hardcoding specific loop structures.

### Concept
The `Iterator` struct defines a polymorphic interface for sequential traversal over any collection.

### API Reference

#### `struct Iterator`
```c
typedef struct Iterator Iterator;

struct Iterator {
    void* (*next)(Iterator* self);
};
```
- **Description**: Standard interface for iterators.

#### `next`
- **Signature**: `void* (*next)(Iterator* self)`
- **Description**: Outputs the next available pointer in the collection.
- **Parameters**:
  - `self`: Pointer to the `Iterator`.
- **Returns**: A pointer to the next element, or `nullptr` when the collection is exhausted.

> [!CAUTION] Caveats
> Do not instantiate the base `Iterator` struct directly. Data structures provide specific iterator implementations that embed the base `Iterator` struct as their first member:
> 
> ```c
> typedef struct {
>     Iterator base; // Must be first for safe casting
>     Vector* arr;
>     size_t index;
> } VECTOR_Iterator;
> ```
> 
> This allows them to be safely cast to `Iterator*` when passed to generic functions. Always use the initialization functions provided by the data structure (e.g., `VECTOR_iteratorInit`) to properly configure the internal state before traversal.
