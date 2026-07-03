---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Data Structures
description: Camelot's memory-aware collections including Vector, List and Table.
---

The Data Structures subsystem provides collections built strictly on the `Allocator` VTable. They do not invoke `malloc` or `free` directly.

## Vector

> [!TIP] Rationale
> To provide an array capable of memory-recyclable growth without relying on a global heap. 

### Concept
The `Vector` is a contiguous dynamic array that expands exponentially using 1.5x bitwise capacity growth.

### API Reference

#### `VECTOR_init`
- **Signature**: `Vector VECTOR_init(Allocator* alloc, size_t stride)`
- **Description**: Initializes a dynamic array.
- **Parameters**:
  - `alloc`: Pointer to the `Allocator`.
  - `stride`: Size of each element in bytes.
- **Returns**: A `Vector` struct containing the pointer to the data and its length.

#### `VECTOR_push`
- **Signature**: `void VECTOR_push(Vector* arr, const void* item)`
- **Description**: Appends the data to the buffer, triggering an allocation if capacity is exceeded.
- **Parameters**:
  - `arr`: Pointer to the `Vector`.
  - `item`: Pointer to the item being copied.

#### `VECTOR_deinit`
- **Signature**: `void VECTOR_deinit(Vector* arr)`
- **Description**: Explicitly returns memory to the originating `Allocator*`.
- **Parameters**:
  - `arr`: Pointer to the `Vector`.

#### `VECTOR_iteratorInit`
- **Signature**: `void VECTOR_iteratorInit(VECTOR_Iterator* iter, Vector* arr)`
- **Description**: Initializes an iterator for the vector.

> [!CAUTION] Caveats
> The `VECTOR_deinit` function must be explicitly called. Failing to do so will permanently leak the array's backing buffer.

## Table

> [!TIP] Rationale
> To provide O(1) key-value lookups without the cache-miss penalty of linked-list chaining.

### Concept
The `Table` is a hash map utilizing open addressing and a metadata control array for fast probing.

### API Reference

#### `TABLE_init`
- **Signature**: `Result TABLE_init(Allocator* alloc, size_t cap)`
- **Description**: Initializes a hash map with a specified capacity.
- **Returns**: A `Result` indicating `OK` or `ERR_OUT_OF_MEMORY`.

#### `TABLE_set`
- **Signature**: `Result TABLE_set(Table* table, String key, void* value)`
- **Description**: Associates a value with a string key.
- **Returns**: `Result` containing `OK` or `ERR_OUT_OF_MEMORY`.

#### `TABLE_get`
- **Signature**: `Result TABLE_get(Table* table, String key)`
- **Description**: Retrieves a value by key.
- **Returns**: `Result` containing `OK` with the `void*` value, or `NIL` if not found.

#### `TABLE_delete`
- **Signature**: `void TABLE_delete(Table* table, String key)`
- **Description**: Removes the association for the given key.

#### `TABLE_deinit`
- **Signature**: `void TABLE_deinit(Table* table)`
- **Description**: Frees the table's internal buffers using its allocator.

> [!WARNING] Caveats
> Tables utilize a 128-bit randomized `hash_key` array seeded during initialization to protect against HashDoS via SipHash-2-4. Requires explicit deallocation via `TABLE_deinit`.

## List

> [!TIP] Rationale
> To support fast O(1) insertions and removals at arbitrary locations without reallocating contiguous arrays.

### Concept
The `List` is a doubly linked list managing nodes dynamically through the provided allocator.

### API Reference

#### `LIST_init`
- **Signature**: `List LIST_init(Allocator* alloc, size_t stride)`
- **Description**: Initializes an empty doubly linked list.
- **Returns**: A `List` struct.

#### `LIST_append`
- **Signature**: `void LIST_append(List* list, const void* item)`
- **Description**: Appends a new node to the end of the list containing the item data.

#### `LIST_deinit`
- **Signature**: `void LIST_deinit(List* list)`
- **Description**: Iterates the list and frees every individual node.

#### `LIST_iteratorInit`
- **Signature**: `void LIST_iteratorInit(LIST_Iterator* iter, List* list)`
- **Description**: Initializes an iterator for sequential traversal.

> [!CAUTION] Caveats
> Data is allocated per-node, which can heavily fragment an allocator if an Arena is not used. DO NOT use `List` with a standard heap allocator for large datasets.
