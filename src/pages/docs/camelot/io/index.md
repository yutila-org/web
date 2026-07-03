---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: I/O Utilities
description: Camelot's I/O subsystem — file operations, string interop and platform abstraction.
---

The I/O subsystem wraps POSIX and Windows APIs into the `Result` tri-state model and requires an `Allocator` VTable.

## File I/O

> [!TIP] Rationale
> OS APIs return disparate error types and leak file descriptors on panic.

### Concept
File operations execute system calls to read, write, or append data to the filesystem, routing all buffer allocations through the provided allocator.

### API Reference

#### `IO_read`
- **Signature**: `CAMELOT_NODISCARD Result IO_read(Allocator* alloc, String path)`
- **Description**: Reads file contents into a dynamically allocated buffer.
- **Returns**: `OK` with the payload pointer, `NIL` if the file is empty, or `ERR` on system failure.

#### `IO_write`
- **Signature**: `CAMELOT_NODISCARD Result IO_write(Allocator* alloc, String path, Slice data)`
- **Description**: Writes a slice of bytes to a file, overwriting existing content or creating the file.
- **Returns**: `OK` or `ERR`.

#### `IO_append`
- **Signature**: `CAMELOT_NODISCARD Result IO_append(Allocator* alloc, String path, Slice data)`
- **Description**: Appends a slice of bytes to the end of an existing file.
- **Returns**: `OK` or `ERR`.

> [!CAUTION] Caveats
> OS-level failures map to `ERR_FILE_ERROR`. Any buffers returned by `IO_read` must be freed manually using the originating allocator.

## String Interop

> [!TIP] Rationale
> `asprintf` bypasses custom allocators and generates double-free hazards. `strcpy` creates severe buffer overflow vulnerabilities.

### Concept
Camelot replaces raw libc string formatting (`asprintf`) with allocator-aware mechanisms to prevent buffer overflows.

### Usage
```c
#ifndef ALLOW_UNSAFE
  #if defined(__GNUC__) || defined(__clang__)
    #pragma GCC poison strcpy strcat strncpy strncat
    #pragma GCC poison gets sprintf vsprintf
    #pragma GCC poison atoi atol atoll atof
    #pragma GCC poison scanf fscanf sscanf
    #pragma GCC poison malloc free calloc realloc
  #endif
#endif
```
- **Description**: Halts compilation immediately if banned functions are referenced.

> [!CAUTION] Caveats
> Fails on legacy codebases attempting to integrate Camelot without defining `ALLOW_UNSAFE`.

## CI/CD

> [!TIP] Rationale
> To catch memory leaks in filesystem edge cases.

### Concept
The I/O module requires strict validation in continuous integration pipelines.

### Usage
Run the Merlin test suite on all commits.

> [!CAUTION] Caveats
> ASan, UBSan and LSan must return a zero exit code.
