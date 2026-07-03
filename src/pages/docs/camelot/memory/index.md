---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Memory Allocator
description: Camelot's Arena memory allocator — design, implementation and usage patterns.
---

Camelot manages memory through the `Allocator` VTable and the `Arena` implementation.

## Allocator

> [!TIP] Rationale
> To eliminate hardcoded `malloc` and `free` calls which prevent memory tracking and testing.

### Concept
The `Allocator` struct defines a generic interface for memory operations, decoupling data structures from absolute memory sources.

### API Reference

#### `struct Allocator`
```c
typedef struct Allocator Allocator;
struct Allocator {
    void* (*allocate)(Allocator* self, size_t size, size_t align);
    void  (*deallocate)(Allocator* self, void* ptr, size_t size);
};
```

#### `allocate`
- **Signature**: `void* (*allocate)(Allocator* self, size_t size, size_t align)`
- **Description**: Allocates a block of memory of the specified size and alignment.
- **Parameters**:
  - `self`: Pointer to the `Allocator` instance.
  - `size`: The amount of memory to allocate in bytes.
  - `align`: The memory alignment boundary.
- **Returns**: An aligned pointer to a memory block.

#### `deallocate`
- **Signature**: `void (*deallocate)(Allocator* self, void* ptr, size_t size)`
- **Description**: Returns the block to the allocator.
- **Parameters**:
  - `self`: Pointer to the `Allocator` instance.
  - `ptr`: Pointer to the memory block.
  - `size`: The size of the memory block being returned.

> [!CAUTION] Caveats
> Custom allocators must strictly respect the provided byte alignment parameters or risk alignment faults on ARM architectures.

## Arena

> [!TIP] Rationale
> To reduce the CPU overhead of tracking individual allocations via free-lists.

### Concept
The Arena is a contiguous memory block managing object lifetimes within a strictly defined scope by bumping a pointer forward.

### API Reference

#### `struct Arena`
```c
typedef struct {
    Allocator base;
    u8* buffer;
    size_t capacity;
    size_t offset;
} Arena;
```

#### `ARENA_allocate`
- **Signature**: `void* ARENA_allocate(Allocator* self, size_t size, size_t align)`
- **Description**: Bumps the internal offset forward, allocating memory from the arena's buffer.
- **Parameters**:
  - `self`: Pointer to the `Allocator` (which is cast internally to an `Arena`).
  - `size`: The size to allocate.
  - `align`: The byte alignment boundary.
- **Returns**: Returns a memory pointer advanced by the requested size and alignment. If capacity is exceeded, it returns `nullptr`.

#### `ARENA_reset`
- **Signature**: `void ARENA_reset(Arena* self)`
- **Description**: Resets the arena's offset to 0, effectively releasing all memory allocated from it simultaneously.
- **Parameters**:
  - `self`: Pointer to the `Arena`.

> [!CAUTION] Caveats
> Memory cannot be freed individually. The entire arena must be reset at once via `ARENA_reset` which zeros the offset integer.
