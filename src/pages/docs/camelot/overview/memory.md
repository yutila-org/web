---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Memory Allocator
description: Camelot's Arena memory allocator — design, implementation and usage patterns.
---

Camelot's memory subsystem is built around two core abstractions: the **Allocator VTable** (a generic dispatch interface) and the **Arena** (a concrete, high-performance implementation of that interface).

## The Problem

Tracking and freeing thousands of individual object allocations leads to memory fragmentation, high CPU overhead and inevitable memory leaks when a single `free()` is forgotten. Additionally, hardcoding `malloc` prevents swapping memory strategies for testing or restricted environments.

## Allocator VTable

The `Allocator` struct defines a generic interface for memory operations via function pointers:

```c
typedef struct Allocator Allocator;
struct Allocator {
    void* (*allocate)(Allocator* self, size_t size, size_t align);
    void  (*free)(Allocator* self, void* ptr, size_t size);
};
```

Every Camelot data structure accepts an `Allocator*` parameter, making it completely agnostic to the underlying memory source. This enables:

- **Heap allocator** for general-purpose use
- **Arena allocator** for scoped, high-performance allocation
- **Stack/fixed-buffer allocator** for embedded or constrained environments
- **Mock allocator** for testing allocation failure paths

## Arena Allocator

The Arena is a contiguous block of pre-allocated memory that manages the lifetime of all objects allocated within a specific scope. It eliminates individual deallocations entirely.

### Structure

```c
typedef struct {
    Allocator base;    // VTable base (inherits allocate/free)
    u8* buffer;        // Pre-allocated contiguous memory block
    size_t capacity;   // Total size of the buffer
    size_t offset;     // Current bump pointer position
} Arena;
```

### Allocation: Monotonic Pointer Bumping

The `ARENA_allocate` function performs O(1) allocation by bumping a pointer forward with alignment:

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

**Key properties:**

1. **Alignment handling**: The pointer is rounded up to the requested alignment boundary using a bitwise mask (`(ptr + (align - 1)) & ~(align - 1)`).
2. **Bounds checking**: If the aligned offset plus the requested size exceeds capacity, `nullptr` is returned.
3. **Zero fragmentation**: Allocations are packed contiguously with no metadata overhead between objects.
4. **Deterministic performance**: Every allocation completes in constant time — no free lists, no coalescing, no system calls.

### Reset: Instant Bulk Deallocation

Instead of freeing individual objects, the entire arena is reset by zeroing the offset:

```c
void ARENA_reset(Arena* self) {
    self->offset = 0;
}
```

This single operation invalidates all prior allocations instantaneously, making arenas ideal for per-frame, per-request or per-transaction memory patterns.

### Memory Layout Visualization

```text
Arena buffer (capacity = 1024 bytes):
┌──────────┬──────────┬──────────┬─────────────────────────┐
│ Object A │ padding  │ Object B │       unused space      │
│  32 bytes│  align   │  64 bytes│                         │
└──────────┴──────────┴──────────┴─────────────────────────┘
^                                ^                         ^
buffer                        offset                   capacity
```

After `ARENA_reset()`:

```text
┌─────────────────────────────────────────────────────────┐
│                    entire buffer reusable                │
└─────────────────────────────────────────────────────────┘
^                                                         ^
buffer + offset (0)                                   capacity
```

## Planned Data Structures

The following data structures are specified in the Software Design Document and will all operate through the Allocator VTable:

| Structure | Type | Growth Strategy | Key Property |
|---|---|---|---|
| `Vector` | Dynamic array | 1.5x bitwise (`cap + (cap >> 1)`) | Memory-recyclable growth |
| `LIST` | Doubly linked list | Per-node | Pointer-stable O(1) insertion |
| `Table` | Hash map (open addressing) | Power-of-2 | SIMD-friendly metadata probing |
| `Slice` | Fat pointer view | N/A (non-owning) | Zero-copy memory access |
| `String` | Text slice (`typedef Slice`) | N/A (non-owning) | O(1) length, no null terminator |
| `OwnedString` | Allocator-paired string | Allocator-aware | Explicit Deinit compliant |

### Vector Growth: Why 1.5x

The Vector uses a **1.5x capacity growth multiplier** (`cap = cap + (cap >> 1)`). By growing at exactly 1.5x instead of the industry standard 2.0x, the sum of all previously discarded block allocations will eventually exceed the next requested capacity. Once this threshold is crossed, it permits block recycling by the host allocator.
