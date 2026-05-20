---
layout: ../../../../layouts/CamelotDocsLayout.astro
title: I/O Utilities
description: Camelot's I/O subsystem — file operations, safe string interop, and platform abstraction.
---

The I/O subsystem provides a platform-agnostic abstraction layer that wraps POSIX and Windows APIs into Camelot's `Result` tri-state error model. All operations route through the `Allocator` VTable to maintain memory lifetime ownership.

## File Operations

Direct interaction with POSIX or Windows APIs creates platform-specific memory leaks, file descriptor leaks, and inconsistent error codes. Camelot's I/O module wraps these behind a clean, `Result`-returning interface:

```c
Result IO_read(Allocator* alloc, String path);
Result IO_write(Allocator* alloc, String path, Slice data);
```

Both functions:

- Accept an `Allocator*` for any internal memory needs (e.g., read buffers)
- Return a `Result` with `OK` (success payload), `NIL` (no data), or `ERR` (system failure with domain-prefixed error code)
- Use the **Explicit Deferral** pattern (`goto defer`) to ensure all resources are freed on every exit path

### Error Mapping

All OS-level errors are translated into Camelot's domain-prefixed error codes:

```c
#define ERR_FILE_ERROR    (DOMAIN_CAMELOT | 0x0002)
```

This ensures client code never needs to inspect raw `errno` values or POSIX/Windows-specific error constants.

## Safe String Interoperability

When Camelot `String` values (non-owning slices) cross into libc boundaries (e.g., file paths for `fopen`), developers typically resort to `strcpy` or `sprintf`, reintroducing overflow risk. Camelot solves this with allocator-aware string construction:

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
