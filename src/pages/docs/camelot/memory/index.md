---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Memory Allocator
description: Camelot's Arena memory allocator — design, implementation and usage patterns.
---

Camelot manages memory through the `Allocator` VTable (Library-enforced) and the `Arena` implementation.

## Allocator VTable

The `Allocator` struct defines a generic interface for memory operations.

- **Rationale**: To allow polymorphic memory allocation without C++ virtual dispatch.
- **Solves**: Hardcoded `malloc` calls that prevent testing or restricted environment usage.
- **Pros**: Enables heap, arena, stack or mock allocators interchangeably.
- **Cons**: Requires pointer indirection for every allocation.

### Usage

```c
typedef struct Allocator Allocator;
struct Allocator {
    void* (*allocate)(Allocator* self, size_t size, size_t align);
    void  (*free)(Allocator* self, void* ptr, size_t size);
};
```

## Arena Allocator

The Arena is a contiguous memory block managing object lifetimes within a scope.

- **Rationale**: To reduce the overhead of tracking individual allocations.
- **Solves**: Memory fragmentation, CPU overhead from free-lists and memory leaks.
- **Pros**: O(1) monotonic allocation, zero fragmentation and O(1) bulk deallocation.
- **Cons**: Memory cannot be freed individually. The entire arena must be reset at once.

### Allocation (Library)

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

### Bulk Free

Arenas are reset by zeroing the offset integer.

```c
void ARENA_reset(Arena* self) {
    self->offset = 0;
}
```


