---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Types and Primitives
description: Camelot fundamental types including fixed-width Primitives, Slice and String.
---

The Types subsystem provides standard integer boundaries, safe memory views, and string manipulation.

## Primitives

### What it does
Camelot defines standard fixed-width integer sizes and floating-point aliases to guarantee architectural consistency. It also polyfills `nullptr` for pre-C23 compilers.

### Usage
```c
typedef uint8_t  u8;   typedef int8_t   i8;
typedef uint16_t u16;  typedef int16_t  i16;
typedef uint32_t u32;  typedef int32_t  i32;
typedef uint64_t u64;  typedef int64_t  i64;
typedef float    f32;  typedef double   f64;
```

### Outputs
Defines strict type sizes during compilation.

### Caveats
Compiler enforced via standard headers. Does not support implicit arbitrary precision.

### Rationale
Standard C types (`int`, `long`) vary wildly across platforms.

### Pros
- Exact sizing for cross-platform structs and binary protocols.

### Cons
- Requires non-standard type names compared to standard `stdint.h`.

## Slice and String

### What it does
A `Slice` is a fat pointer view of contiguous memory. A `String` is a typedef of a `Slice` explicitly containing character data.

### Usage
```c
typedef struct {
    u8* ptr;
    size_t len;
} Slice;

typedef Slice String;

Slice SLICE_new(u8* buffer, size_t len);
Slice SLICE_sub(Slice s, size_t offset, size_t len);

String STRING_new(const char* literal, size_t len);
```

### Outputs
Returns a non-owning struct containing the exact memory boundaries.

### Caveats
These are non-owning views. They do not manage memory and will become dangling pointers if their backing array is deallocated.

### Rationale
To replace null-terminated strings and unsafe pointer arithmetic.

### Pros
- O(1) length checks.
- Zero-copy memory views.

### Cons
- Incompatible with legacy APIs expecting a null terminator without performing an allocation first.

## OwnedString

### What it does
An `OwnedString` pairs a `String` with the `Allocator` that originated it, ensuring correct memory teardown.

### Usage
```c
typedef struct {
    Allocator* alloc;
    String view;
} OwnedString;

CAMELOT_NODISCARD Result STRING_format(Allocator* alloc, const char* fmt, ...);
CAMELOT_NODISCARD Result STRING_formatVariadic(Allocator* alloc, const char* fmt, va_list args);
void OWNEDSTRING_deinit(OwnedString* str);
```

### Outputs
`STRING_format` allocates memory and returns a `Result` containing the `OwnedString`.

### Caveats
Requires manual cleanup via `OWNEDSTRING_deinit`.

### Rationale
To pair allocated strings directly with their source to prevent double-free errors and allocator mismatch.

### Pros
- Conforms to explicit teardown conventions.

### Cons
- Struct wrapper overhead.

## String Splitting

### What it does
Splits a string by a delimiter into a dynamically allocated array of zero-copy string views.

### Usage
```c
CAMELOT_NODISCARD Result STRING_split(Allocator* alloc, String s, char delim);
```

### Outputs
Returns a `Result` containing a `Vector*` of `String` slices. 

### Caveats
The `String` slices inside the vector are zero-copy and point to the original string memory. The user must free the vector's internal buffer via `VECTOR_deinit`, and then free the `Vector` pointer itself using the provided allocator.

### Rationale
To avoid allocating duplicate memory for string tokens during parsing operations.

### Pros
- Extremely fast parsing with minimal memory allocations.

### Cons
- The original string must outlive the vector of slices.
