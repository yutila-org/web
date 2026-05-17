---
layout: ../../../../layouts/StarioDocsLayout.astro
title: Zero Telemetry Mandate
description: Stario's absolute commitment to zero background tracking and diagnostic reporting.
---

Standard commercial SDKs (Firebase, Crashlytics, Google Analytics) strictly violate the zero-telemetry mandate. Stario contains no background tracking, no usage analytics, and no silent crash reporting mechanisms.

<div class="callout warning">
  <p><strong>Warning:</strong> Any pull requests attempting to introduce third-party analytics or telemetry SDKs will be automatically rejected by the CI pipeline.</p>
</div>
