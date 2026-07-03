---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: Types and Primitives
description: Camelot fundamental types including fixed-width Primitives, Slice and String.
---

The Types subsystem provides standard integer boundaries, safe memory views and string manipulation.

## Primitives

> [!TIP] Rationale
> Standard C types (`int`, `long`) vary wildly across platforms.

### Concept
Camelot defines standard fixed-width integer sizes and floating-point aliases to guarantee architectural consistency. It also polyfills `nullptr` for pre-C23 compilers.

### API Reference

#### Numeric Typedefs
```c
typedef uint8_t  u8;   typedef int8_t   i8;
typedef uint16_t u16;  typedef int16_t  i16;
typedef uint32_t u32;  typedef int32_t  i32;
typedef uint64_t u64;  typedef int64_t  i64;
typedef float    f32;  typedef double   f64;
```
- **Description**: Defines strict type sizes during compilation. Exact sizing for cross-platform structs and binary protocols.

> [!CAUTION] Caveats
> Compiler enforced via standard headers. Does not support implicit arbitrary precision. 

## Slice and String

> [!TIP] Rationale
> To replace null-terminated strings and unsafe pointer arithmetic.

### Concept
A `Slice` is a fat pointer view of contiguous memory. A `String` is a typedef of a `Slice` explicitly containing character data.

### API Reference

#### `Slice` & `String`
```c
typedef struct {
    u8* ptr;
    size_t len;
} Slice;

typedef Slice String;
```
- **Description**: Structs representing a non-owning fat pointer and a string view, respectively.

#### `SLICE_new`
- **Signature**: `Slice SLICE_new(u8* buffer, size_t len)`
- **Description**: Creates a new slice from a buffer.

#### `SLICE_sub`
- **Signature**: `Slice SLICE_sub(Slice s, size_t offset, size_t len)`
- **Description**: Creates a sub-slice from an existing slice.

#### `STRING_new`
- **Signature**: `String STRING_new(const char* literal, size_t len)`
- **Description**: Creates a new string view from a char pointer.

> [!CAUTION] Caveats
> These are non-owning views. They do not manage memory and will become dangling pointers if their backing array is deallocated.

## OwnedString

> [!TIP] Rationale
> To pair allocated strings directly with their source to prevent double-free errors and allocator mismatch.

### Concept
An `OwnedString` pairs a `String` with the `Allocator` that originated it, ensuring correct memory teardown.

### API Reference

#### `OwnedString`
```c
typedef struct {
    Allocator* alloc;
    String view;
} OwnedString;
```
- **Description**: Struct tracking a string and its allocator.

#### `STRING_format`
- **Signature**: `CAMELOT_NODISCARD Result STRING_format(Allocator* alloc, const char* fmt, ...)`
- **Description**: Formats a string (like `sprintf`) using the provided allocator.
- **Returns**: A `Result` containing the `OwnedString`.

#### `STRING_formatVariadic`
- **Signature**: `CAMELOT_NODISCARD Result STRING_formatVariadic(Allocator* alloc, const char* fmt, va_list args)`
- **Description**: Variadic version of `STRING_format`.

#### `OWNEDSTRING_deinit`
- **Signature**: `void OWNEDSTRING_deinit(OwnedString* str)`
- **Description**: Frees the string's memory using its tracked allocator.

> [!CAUTION] Caveats
> Requires manual cleanup via `OWNEDSTRING_deinit`. Failing to do so causes a memory leak.

## String Splitting

> [!TIP] Rationale
> To avoid allocating duplicate memory for string tokens during parsing operations.

### Concept
Splits a string by a delimiter into a dynamically allocated array of zero-copy string views.

### API Reference

#### `STRING_split`
- **Signature**: `CAMELOT_NODISCARD Result STRING_split(Allocator* alloc, String s, char delim)`
- **Description**: Splits the string `s` by `delim`.
- **Returns**: A `Result` containing a `Vector*` of `String` slices.

> [!CAUTION] Caveats
> The `String` slices inside the vector are zero-copy and point to the original string memory. The user must free the vector's internal buffer via `VECTOR_deinit` and then free the `Vector` pointer itself using the provided allocator.
