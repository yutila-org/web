---
layout: ../../../../layouts/StarioDocsLayout.astro
title: Core Features
description: Stario's native Android feature implementations.
---

Stario is engineered to eliminate overhead and prevent data exfiltration. Its architecture relies on native Android APIs rather than third-party SDKs.

## Material You Engine
Integrates directly with Android's system-level dynamic color APIs (`DynamicColors`). Interface elements adapt dynamically to match wallpaper palettes without requiring external theme engines.

## Localized Data Processing
The Briefing Module houses a built-in, local RSS/Atom feed parser and a localized weather widget. All data retrieval is initiated strictly by the client and parsed locally to deliver user-controlled data without proprietary external tracking services.

## Global Search Utility
Features a native application query module with optional integration for privacy-respecting search engines (e.g., Kagi). This bypasses commercial ad-tech search models and prevents query logging by the launcher.

## Adaptive Media Session Controls
Employs native Android `MediaSession` APIs for real-time, low-latency playback control directly from within the core launcher interface.
