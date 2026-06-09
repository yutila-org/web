---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Memory Allocator
description: Camelot's Arena memory allocator — design, implementation and usage patterns.
---

Camelot manages memory through the `Allocator` VTable (Library-enforced) and the `Arena` implementation.

## Allocator VTable

The `Allocator` struct defines a generic interface for memory operations.

- **Why it was designed that way**: To allow polymorphic memory allocation without C++ virtual dispatch.
- **Problems it solves**: Hardcoded `malloc` calls that prevent testing or restricted environment usage.
- **Pros**: Enables heap, arena, stack or mock allocators interchangeably.
- **Cons**: Requires pointer indirection for every allocation.

### Exact Usage Details

```c
typedef struct Allocator Allocator;
struct Allocator {
    void* (*allocate)(Allocator* self, size_t size, size_t align);
    void  (*free)(Allocator* self, void* ptr, size_t size);
};
```

## Arena Allocator

The Arena is a contiguous memory block managing object lifetimes within a scope.

- **Why it was designed that way**: To reduce the overhead of tracking individual allocations.
- **Problems it solves**: Memory fragmentation, CPU overhead from free-lists and memory leaks.
- **Pros**: O(1) monotonic allocation, zero fragmentation and O(1) bulk deallocation.
- **Cons**: Memory cannot be freed individually. The entire arena must be reset at once.

### Allocation Mechanism (Library-enforced)

`ARENA_allocate` bumps a pointer forward with alignment. Bounds checking ensures it returns `nullptr` if capacity is exceeded.

```c
void* ARENA_allocate(Allocator* self, size_t size, size_t align) {
    Arena* arena = (Arena*)self;
    size_t current_ptr = (size_t)(arena->buffer + arena->offset);
    size_t offset = (current_ptr + (align - 1)) & ~(align - 1);
    offset -= (size_t)arena->buffer;

    if (offset + size <= arena->capacity) {
        void* ptr = &arena->buffer[offset];
        arena->offset = offset + size;
        return ptr;
    }
    return nullptr;
}
```

### Bulk Deallocation

Arenas are reset by zeroing the offset integer.

```c
void ARENA_reset(Arena* self) {
    self->offset = 0;
}
```

## Data Structures

Camelot includes memory-aware data structures implementing the `Allocator` VTable.

### Vector
- **Why it was designed that way**: To provide a dynamic array with memory-recyclable growth.
- **Problems it solves**: Static array limits and suboptimal 2.0x capacity reallocation overhead.
- **Pros**: Uses 1.5x bitwise capacity growth (`cap + (cap >> 1)`). Discarded allocations sum to exceed future requests, permitting block recycling by the host allocator.
- **Cons**: Slower growth than 2.0x requires more frequent reallocations.

### Table
- **Why it was designed that way**: To provide a hash map using open addressing.
- **Problems it solves**: Linked-list chaining cache misses.
- **Pros**: SIMD-friendly metadata probing and power-of-2 sizing.
- **Cons**: High memory usage for sparse data sets.

### String and Slice
- **Why it was designed that way**: To replace null-terminated strings.
- **Problems it solves**: O(N) `strlen` operations and out-of-bounds reads.
- **Pros**: O(1) length checks and zero-copy memory views.
- **Cons**: Incompatible with legacy APIs expecting a null terminator without allocation.

### OwnedString
- **Why it was designed that way**: To pair allocated strings with their source.
- **Problems it solves**: Double-free errors and allocator mismatch.
- **Pros**: Conforms to Explicit Deinit rules.
- **Cons**: Struct wrapper overhead.
