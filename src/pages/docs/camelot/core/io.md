---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: I/O Utilities
description: Camelot's I/O subsystem — file operations, safe string interop and platform abstraction.
---

The I/O subsystem provides a platform-agnostic abstraction layer that wraps POSIX and Windows APIs into Camelot's `Result` tri-state error model. All operations route through the `Allocator` VTable to maintain memory lifetime ownership.

## File Operations

Direct interaction with POSIX or Windows APIs creates platform-specific memory leaks, file descriptor leaks and inconsistent error codes. Camelot's I/O module wraps these behind a clean, `Result`-returning interface:

```c
Result IO_read(Allocator* alloc, String path);
Result IO_write(Allocator* alloc, String path, Slice data);
```

Both functions:

- Accept an `Allocator*` for any internal memory needs (e.g., read buffers)
- Return a `Result` with `OK` (success payload), `NIL` (no data) or `ERR` (system failure with domain-prefixed error code)
- Use the **Explicit Deferral** pattern (`goto defer`) to ensure all resources are freed on every exit path

### Error Mapping

All OS-level errors are translated into Camelot's domain-prefixed error codes:

```c
#define ERR_FILE_ERROR    (DOMAIN_CAMELOT | 0x0002)
```

This ensures client code never needs to inspect raw `errno` values or POSIX/Windows-specific error constants.

## Safe String Interoperability

When Camelot `String` values (non-owning slices) cross into libc boundaries (e.g., file paths for `fopen`), developers typically resort to `strcpy` or `sprintf` and reintroduce overflow risk. Camelot solves this with allocator-aware string construction:

### OwnedString

The `OwnedString` type pairs allocated string data with its originating `Allocator*`, conforming to the Explicit Deinit pattern:

```c
typedef struct {
    Allocator* alloc;    // Originating allocator for teardown
    String view;         // Non-owning slice view of the data
} OwnedString;
```

### Allocator-Aware Formatting

```c
[[nodiscard]] Result STRING_format(Allocator* alloc, const char* fmt, ...);
[[nodiscard]] Result STRING_formatVariadic(Allocator* alloc, const char* fmt, va_list args);
```

These functions replace raw `asprintf()` and `vasprintf()`, which bypass the Allocator VTable entirely and create double-free hazards. The returned `Result` contains an `OwnedString*` on success.

### Teardown

```c
void OWNEDSTRING_deinit(OwnedString* str);
```

This returns memory to the originating allocator, preventing double-frees and lifetime mismatches.

### Interop Rules

| Allowed | Prohibited |
|---|---|
| `snprintf()` for libc boundary crossings | `strcpy`, `strcat`, `strncpy`, `strncat` (poisoned) |
| `memccpy()` for bounded copies | Raw `asprintf()` / `vasprintf()` |
| `STRING_format()` for allocator-aware formatting | Any format function bypassing `Allocator*` |
| All return values checked via `Result` | Unchecked truncation or overrun |

## API Reference

### `IO_read`

```c
Result IO_read(Allocator* alloc, String path);
```

**Summary**: Reads the entire contents of a file into a dynamically allocated buffer. Uses the provided allocator for safe memory tracking.

- **Parameters**:
  - `alloc` (`Allocator*`): The allocator used to provision the read buffer.
  - `path` (`String`): The file system path to read from.
- **Returns**: `Result` containing `OK` with the file data payload, `NIL` if the file is empty, or `ERR` on system failure.
- **Errors**: Returns `ERR_FILE_ERROR` if the file does not exist or permissions are denied.
- **See Also**: [`IO_write`](#io_write)

<details>
<summary><b>Example Usage</b></summary>

```c
Result res = IO_read(arena, STRING("config.txt"));
if (res.status == RESULT_OK) {
    Slice data = res.payload;
    // Process data...
}
```

</details>

### `IO_write`

```c
Result IO_write(Allocator* alloc, String path, Slice data);
```

**Summary**: Safely writes a slice of bytes to a file. Overwrites the file if it exists or creates it if it does not.

- **Parameters**:
  - `alloc` (`Allocator*`): The allocator used for any internal temporary buffers.
  - `path` (`String`): The destination file system path.
  - `data` (`Slice`): The byte payload to write to disk.
- **Returns**: `Result` containing `OK` on success, or `ERR` on failure.
- **Errors**: Returns `ERR_FILE_ERROR` on permission denial or I/O failure.
- **See Also**: [`IO_read`](#io_read)

<details>
<summary><b>Example Usage</b></summary>

```c
String content = STRING("Hello, Camelot!");
Slice data = SLICE_FROM_STRING(content);
Result res = IO_write(arena, STRING("output.txt"), data);
```

</details>

### `STRING_format`

```c
[[nodiscard]] Result STRING_format(Allocator* alloc, const char* fmt, ...);
```

**Summary**: Allocator-aware string formatting utility. Acts as a structural alternative to `asprintf`, preventing double-frees and unmanaged memory.

- **Parameters**:
  - `alloc` (`Allocator*`): The allocator to provision the resulting string.
  - `fmt` (`const char*`): A standard `printf`-style format string.
  - `...`: Variadic arguments matching the format specifiers.
- **Returns**: `Result` containing an `OwnedString*` payload on success.
- **Errors**: Returns `ERR_MEMORY_ERROR` if allocation fails or `ERR_FORMAT_ERROR` on encoding issues.
- **See Also**: [`OWNEDSTRING_deinit`](#ownedstring_deinit), [`STRING_formatVariadic`](#string_formatvariadic)

<details>
<summary><b>Example Usage</b></summary>

```c
Result res = STRING_format(arena, "Failed to open %s (Code: %d)", path.ptr, err_code);
if (res.status == RESULT_OK) {
    OwnedString* str = res.payload;
    printf("%s\n", str->view.ptr);
    OWNEDSTRING_deinit(str);
}
```

</details>

### `STRING_formatVariadic`

```c
[[nodiscard]] Result STRING_formatVariadic(Allocator* alloc, const char* fmt, va_list args);
```

**Summary**: Variadic list variant of `STRING_format`. Useful for building custom logging or formatting wrappers.

- **Parameters**:
  - `alloc` (`Allocator*`): The allocator to provision the resulting string.
  - `fmt` (`const char*`): A standard `printf`-style format string.
  - `args` (`va_list`): An initialized variadic argument list.
- **Returns**: `Result` containing an `OwnedString*` payload on success.
- **See Also**: [`STRING_format`](#string_format)

### `OWNEDSTRING_deinit`

```c
void OWNEDSTRING_deinit(OwnedString* str);
```

**Summary**: Safely deallocates an `OwnedString`, returning its memory to the originating allocator.

- **Parameters**:
  - `str` (`OwnedString*`): A pointer to the owned string to destroy. If `NULL`, the function is a no-op.
- **Side Effects**: The memory underlying `str->view` is freed and the `str` struct itself is destroyed.
- **See Also**: [`STRING_format`](#string_format)


## CI/CD Pipeline

The I/O module is validated through the full CI/CD pipeline defined in `.github/workflows/ci.yml`:

| Job | Purpose |
|---|---|
| `build` | Compile with full sanitizer flags (ASan, UBSan, LSan) |
| `trivy` | Vulnerability scanning on the filesystem |
| `secret-scan` | Gitleaks credential detection |
| `sbom` | SPDX SBOM generation via Syft |
| `scorecard` | OpenSSF Scorecard analysis |
| `deps-dev` | OSV dependency vulnerability scanning |
| `deploy` | Automated GitHub Releases on `v*` tags |

### Release Deployment

When a version tag is pushed (`git tag v1.0.0 && git push origin v1.0.0`), the `deploy` job:

1. Compiles the release binary with `make all RELEASE=1`
2. Packages `bin/camelot` and `include/` into `camelot-linux-amd64.tar.gz`
3. Creates a GitHub Release with auto-generated release notes
