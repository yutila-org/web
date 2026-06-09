---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Memory Allocator
description: Camelot's Arena memory allocator — design, implementation and usage patterns.
---

Camelot manages memory through the `Allocator` VTable and the `Arena` implementation.

## Allocator

> [!TIP] Rationale
> To eliminate hardcoded `malloc` and `free` calls which prevent memory tracking and testing.

### What it does
The `Allocator` struct defines a generic interface for memory operations, decoupling data structures from absolute memory sources.

### Usage
```c
typedef struct Allocator Allocator;
struct Allocator {
    void* (*allocate)(Allocator* self, size_t size, size_t align);
    void  (*deallocate)(Allocator* self, void* ptr, size_t size);
};
```

> [!NOTE] Outputs
> The `allocate` function outputs an aligned pointer to a memory block. The `deallocate` function returns the block to the allocator.

| Pros | Cons |
|------|------|
| Enables heap, arena, stack or mock allocators interchangeably. | Requires pointer indirection for every allocation. |

> [!CAUTION] Caveats
> Custom allocators must strictly respect the provided byte alignment parameters or risk alignment faults on ARM architectures.

## Arena

> [!TIP] Rationale
> To reduce the CPU overhead of tracking individual allocations via free-lists.

### What it does
The Arena is a contiguous memory block managing object lifetimes within a strictly defined scope by bumping a pointer forward.

### Usage
```c
typedef struct {
    Allocator base;
    u8* buffer;
    size_t capacity;
    size_t offset;
} Arena;

void* ARENA_allocate(Allocator* self, size_t size, size_t align);
void ARENA_reset(Arena* self);
```

> [!NOTE] Outputs
> Returns a memory pointer advanced by the requested size and alignment. If capacity is exceeded, it returns `nullptr`.

| Pros | Cons |
|------|------|
| O(1) monotonic allocation. | Unsuitable for long-lived applications with highly variable object lifetimes unless multiple layered arenas are employed. |
| Zero fragmentation. | |
| O(1) bulk deallocation. | |

> [!CAUTION] Caveats
> Memory cannot be freed individually. The entire arena must be reset at once via `ARENA_reset` which zeros the offset integer.
