---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Architecture
description: Architectural design of Camelot — VTable dispatch, error types and data flow.
---

Camelot is a utility library built in C23, orchestrated by Merlin.

## Allocator

> [!TIP] Rationale
> Global heap contention, memory fragmentation and the inability to swap allocation strategies for testing required a polymorphic solution.

### What it does
Camelot utilizes an `Allocator` VTable to decouple data structures from memory sources.

### Usage
All core functions require passing an `Allocator*` parameter to manage their internal memory.

> [!NOTE] Outputs
> Guaranteed tracking of all memory allocation without relying on system globals.

| Pros | Cons |
|------|------|
| Enables custom allocation environments (arenas, stack buffers). | Requires passing an `Allocator*` to every function. |
| Provides exact memory tracking and isolated teardown. | Incurs a function pointer dereference overhead. |

> [!CAUTION] Caveats
> This is a library-enforced convention. Bypassing it by calling `malloc` directly completely breaks the architecture and nullifies memory tracking.

## Deferral

> [!TIP] Rationale
> To centralize resource deallocation and prevent memory and file handle leaks across complex branching logic.

### What it does
Functions with multiple return paths must return through a single cleanup block via `goto`.

### Usage
```c
Result IO_file(Allocator* alloc, String path) {
    Result res = { .state = ERR, .payload.err_code = ERR_FILE_ERROR };
    void* buffer = alloc->allocate(alloc, 1024, 8);

    if (buffer == nullptr) {
        res.payload.err_code = ERR_OUT_OF_MEMORY;
        goto defer;
    }

    res.state = OK;
    res.payload.val = buffer;

defer:
    if (res.state == ERR && buffer != nullptr) {
        alloc->deallocate(alloc, buffer, 1024);
    }
    return res;
}
```

> [!NOTE] Outputs
> Guarantees execution of cleanup logic regardless of the exit path.

| Pros | Cons |
|------|------|
| Reduces duplicated cleanup code. | Relies on the controversial `goto` statement. |
| Ensures deterministic release. | |

> [!CAUTION] Caveats
> Convention-only. Requires strict developer discipline to never use raw `return` statements midway through a function.

## Deinit

> [!TIP] Rationale
> To map object destruction precisely to its creation mechanism.

### What it does
Owning types require a standardized destruction function delegating to the origin `Allocator`.

### Usage
```c
void VECTOR_deinit(Vector* arr) {
    if (arr->data != nullptr) {
        arr->alloc->deallocate(arr->alloc, arr->data, arr->cap * arr->stride);
    }
    arr->len = 0;
    arr->cap = 0;
}
```

> [!NOTE] Outputs
> Safely returns the memory directly to the struct's defined allocator.

| Pros | Cons |
|------|------|
| Uniform teardown semantics across all data structures. | Requires explicit function calls per object. |

> [!CAUTION] Caveats
> Convention-only. If a developer forgets to call `_deinit`, the memory will leak.
