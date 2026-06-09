---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Data Structures
description: Camelot's memory-aware collections including Vector, List and Table.
---

The Data Structures subsystem provides collections built strictly on the `Allocator` VTable. They do not invoke `malloc` or `free` directly.

## Vector

### What it does
The `Vector` is a contiguous dynamic array that expands exponentially using 1.5x bitwise capacity growth.

### Usage
```c
Vector VECTOR_init(Allocator* alloc, size_t stride);
void VECTOR_push(Vector* arr, const void* item);
void VECTOR_deinit(Vector* arr);

VECTOR_Iterator iter;
VECTOR_iteratorInit(&iter, &arr);
```

> [!NOTE] Outputs
> `VECTOR_init` returns a `Vector` struct containing the pointer to the data and its length. `VECTOR_push` appends the data to the buffer, triggering an allocation if capacity is exceeded.

> [!CAUTION] Caveats
> The `VECTOR_deinit` function must be explicitly called to return memory to the originating `Allocator*`. Failing to do so will permanently leak the array's backing buffer.

> [!TIP] Rationale
> To provide an array capable of memory-recyclable growth without relying on a global heap. 

| Pros | Cons |
|------|------|
| Discarded allocations sum to exceed future requests due to 1.5x growth (`cap + (cap >> 1)`), permitting block recycling by the host allocator. | Slower growth than 2.0x requires more frequent reallocations. |
| Fast contiguous memory access. | |

## Table

### What it does
The `Table` is a hash map utilizing open addressing and a metadata control array for fast probing.

### Usage
```c
#define CTRL_EMPTY   0x80
#define CTRL_DELETED 0xFE

Result TABLE_init(Allocator* alloc, size_t cap);
Result TABLE_set(Table* table, String key, void* value);
Result TABLE_get(Table* table, String key);
void TABLE_delete(Table* table, String key);
void TABLE_deinit(Table* table);
```

> [!NOTE] Outputs
> Operations return a `Result` type containing the requested `void*` value (`OK`), indicating the key was not found (`NIL`), or signaling an error like out-of-memory (`ERR`).

> [!WARNING] Caveats
> Tables utilize a 128-bit randomized `hash_key` array seeded during initialization to protect against HashDoS via SipHash-2-4. Requires explicit deallocation via `TABLE_deinit`.

> [!TIP] Rationale
> To provide O(1) key-value lookups without the cache-miss penalty of linked-list chaining.

| Pros | Cons |
|------|------|
| SIMD-friendly metadata probing using `CTRL_EMPTY` and `CTRL_DELETED`. | High memory usage for sparse data sets. |
| HashDoS protection built-in. | Pointers to values may invalidate during table resizing. |
| Power-of-2 sizing for fast modulo operations. | |

## List

### What it does
The `List` is a doubly linked list managing nodes dynamically through the provided allocator.

### Usage
```c
List LIST_init(Allocator* alloc, size_t stride);
void LIST_append(List* list, const void* item);
void LIST_deinit(List* list);

LIST_Iterator iter;
LIST_iteratorInit(&iter, &list);
```

> [!NOTE] Outputs
> Produces a structured list connecting `LIST_Node` elements containing `next` pointers and `void*` data payloads.

> [!CAUTION] Caveats
> Data is allocated per-node, which can heavily fragment an allocator if an Arena is not used. DO NOT use `List` with a standard heap allocator for large datasets.

> [!TIP] Rationale
> To support fast O(1) insertions and removals at arbitrary locations without reallocating contiguous arrays.

| Pros | Cons |
|------|------|
| Stable pointers to elements. | High cache-miss rate due to non-contiguous node allocations. |
| O(1) insertions at the head or tail. | Significant memory overhead per element for node pointers. |
