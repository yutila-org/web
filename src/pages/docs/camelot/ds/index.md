---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Data Structures
description: Camelot's memory-aware collections including Vector, List and Table.
---

The Data Structures subsystem provides collections built strictly on the `Allocator` VTable. They do not invoke `malloc` or `free` directly.

## Vector (Library)

The `Vector` is a contiguous dynamic array that expands exponentially.

- **Rationale**: To provide an array capable of memory-recyclable growth without relying on a global heap.
- **Solves**: Static array limits and suboptimal 2.0x capacity reallocation overhead.
- **Pros**: Uses 1.5x bitwise capacity growth (`cap + (cap >> 1)`). Discarded allocations sum to exceed future requests, permitting block recycling by the host allocator.
- **Cons**: Slower growth than 2.0x requires more frequent reallocations.

### Usage

```c
typedef struct {
    Allocator* alloc;
    void* data;
    size_t len;
    size_t cap;
    size_t stride;
} Vector;

Vector VECTOR_init(Allocator* alloc, size_t stride);
void VECTOR_push(Vector* arr, const void* item);
void VECTOR_deinit(Vector* arr);
```

The `VECTOR_deinit` function conforms to Explicit Deinit by returning memory to the originating `Allocator*`.

### Vector Iterator

```c
typedef struct {
    Iterator base;
    Vector* arr;
    size_t index;
} VECTOR_Iterator;

void VECTOR_iteratorInit(VECTOR_Iterator* self, Vector* arr);
```

## List and Table

- **List**: A doubly linked list.
  - **Pros**: O(1) insertions at arbitrary nodes.
  - **Cons**: High cache-miss rate due to non-contiguous node allocations.
- **Table**: A hash map utilizing open addressing.
  - **Pros**: SIMD-friendly metadata probing and power-of-2 sizing.
  - **Cons**: High memory usage for sparse data sets.

(Usage models map structurally to `Vector` with explicit `Allocator` requirements and `_deinit` teardowns.)
