---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: I/O Utilities
description: Camelot's I/O subsystem — file operations, string interop and platform abstraction.
---

The I/O subsystem wraps POSIX and Windows APIs into the `Result` tri-state model and requires an `Allocator` VTable.

## File I/O

File operations route through allocator-aware interfaces.

- **Rationale**: OS APIs return disparate error types and leak file descriptors on panic.
- **Solves**: Unchecked errors, platform-specific code and untracked buffer allocations.
- **Pros**: Consistent error reporting and deterministic memory lifetimes.
- **Cons**: Overhead from mapping OS errors and mandatory buffer allocations.

### Usage

```c
Result IO_read(Allocator* alloc, String path);
Result IO_write(Allocator* alloc, String path, Slice data);
```

- **`IO_read`**: Reads file contents into a dynamically allocated buffer. Returns `OK` with the payload, `NIL` if empty or `ERR` on system failure. (Library-enforced).
- **`IO_write`**: Writes a slice of bytes to a file. Overwrites or creates the file. Returns `OK` or `ERR`.

OS-level errors map to `ERR_FILE_ERROR` (Convention-only).

## String Interop

libc string boundaries expose overflow risks. Camelot replaces raw formatting with allocator-aware mechanisms.

- **Rationale**: `asprintf` and `vasprintf` bypass custom allocators and generate double-free hazards.
- **Solves**: Buffer overflows from `strcpy` and unmanaged pointers from `asprintf`.
- **Pros**: Enforces tracking of string memory via the originating allocator.
- **Cons**: Requires structured teardown via `OWNEDSTRING_deinit`.

### Usage

```c
typedef struct {
    Allocator* alloc;
    String view;
} OwnedString;

[[nodiscard]] Result STRING_format(Allocator* alloc, const char* fmt, ...);
[[nodiscard]] Result STRING_formatVariadic(Allocator* alloc, const char* fmt, va_list args);
void OWNEDSTRING_deinit(OwnedString* str);
```

- **`STRING_format`**: Requires an `Allocator*`. Returns `Result` with an `OwnedString*` payload.
- **`OWNEDSTRING_deinit`**: Returns memory to the `Allocator*` specified in the struct.

### Interop Constraints (Compiler & Convention)

1. `strcpy`, `strcat`, `strncpy` and `strncat` are poisoned.
2. Raw `asprintf()` and `vasprintf()` bypass allocators and violate architecture constraints.
3. Use `snprintf()` for libc boundaries. Use `memccpy()` for bounded copies.

## CI/CD

The I/O module requires Test-enforced validation:
- ASan, UBSan and LSan required during build.
- Vulnerability scanning via Trivy.
- SPDX SBOM generation.
- Automated releases triggered on `v*` tags.
