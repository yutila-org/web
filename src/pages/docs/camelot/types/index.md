---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Types and Primitives
description: Camelot fundamental types including fixed-width Primitives, Slice and String.
---

The Types subsystem provides standard integer boundaries and safe memory views.

## Primitives (Compiler)

Camelot defines standard integer sizes to guarantee architectural consistency.

- **Rationale**: Standard C types (`int`, `long`) vary across platforms.
- **Solves**: Integer overflow bugs across 32-bit and 64-bit platforms.
- **Pros**: Exact sizing for cross-platform structs and binary protocols.
- **Cons**: Requires non-standard type names compared to `stdint.h`.

### Usage

```c
typedef uint8_t  u8;   typedef int8_t   i8;
typedef uint16_t u16;  typedef int16_t  i16;
typedef uint32_t u32;  typedef int32_t  i32;
typedef uint64_t u64;  typedef int64_t  i64;
typedef float    f32;
typedef double   f64;
```

## Slice & String (Library)

A `Slice` is a fat pointer view of contiguous memory. A `String` is a typedef of a `Slice` explicitly containing character data.

- **Rationale**: To replace null-terminated strings and unsafe pointer arithmetic.
- **Solves**: O(N) `strlen` operations and out-of-bounds reads.
- **Pros**: O(1) length checks and zero-copy memory views.
- **Cons**: Incompatible with legacy APIs expecting a null terminator without allocation.

### Usage

```c
typedef struct {
    void* ptr;
    size_t len;
} Slice;

typedef Slice String;

String STRING_new(const char* literal, size_t len);
```

Strings are non-owning and do not require deallocation.

## OwnedString (Convention)

An `OwnedString` pairs a `String` with the `Allocator` that originated it.

- **Rationale**: To pair allocated strings directly with their source.
- **Solves**: Double-free errors and allocator mismatch during deallocation.
- **Pros**: Conforms to the Explicit Deinit convention.
- **Cons**: Struct wrapper overhead and manual cleanup requirement.

### Usage

```c
typedef struct {
    Allocator* alloc;
    String view;
} OwnedString;

CAMELOT_NODISCARD Result STRING_format(Allocator* alloc, const char* fmt, ...);
void OWNEDSTRING_deinit(OwnedString* str);
```
