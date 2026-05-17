---
layout: ../../../../layouts/StarioDocsLayout.astro
title: Sideloading & Deployment
description: Procedural guide to verify, inspect, and deploy compiled Stario binaries safely via ADB and offline channels.
---

Sideloading allows deployment of Stario without relying on centralized commercial store providers, maintaining strict data sovereignty and mitigating supply chain tracking vectors. 

---

## Supply Chain Integrity Verification

Before installing any pre-compiled APK, you must perform cryptographic checks to confirm that the package was not tampered with during distribution or edge cache transfer.

### 1. Checksum Validation
Generate the SHA-256 hash of the downloaded binary and verify that it matches the official build hash published in the Yutila release log:

```bash
# Generate SHA-256 hash
sha256sum stario.apk

# Must yield exact matching string, e.g.:
# 8f94df22a4b870c53d100010c2c34cbf7d8481230cd8b1f2e1aefd59d1c9ef28  stario.apk
```

### 2. Cryptographic Code-Signature Audit
Confirm the authenticity of the signature using Android’s official `apksigner` command-line utility. This verifies that the APK certificate is valid and is signed by the authorized Yutila release keys:

```bash
# Audit package signatures and print certificates
apksigner verify --print-certs stario.apk

# Verify output matches the authorized release certificate fingerprint:
# Signer #1 certificate DN: CN=Yutila Org, O=Yutila, C=US
# Signer #1 certificate SHA-256 digest: 3f7e1b9b...
```

> [!CAUTION]
> If `apksigner` yields signature mismatches or returns warning exceptions regarding key validity, do not install the binary. The package must be deleted immediately.

---

## Deployment Pipelines via ADB

With Android Debug Bridge (`adb`) active, deploy the binary to physical hardware or emulators.

### 1. Developer Options Setup
1. Open the Android settings app, navigate to **About Phone**, and click **Build Number** 7 times to enable developer controls.
2. Under **Developer Options**, toggle **USB Debugging** to `On`.
3. Connect your host compilation station and authenticate the hardware RSA key prompt on the device screen.

### 2. Installation Commands
Select the appropriate compiler flag based on the target system status:

```bash
# 1. Standard install (will fail if package is already present)
adb install stario.apk

# 2. Re-install/Update (preserves local application data and layout configuration)
adb install -r stario.apk

# 3. Re-install with version downgrade permissions
adb install -r -d stario.apk

# 4. Install and grant all declared permissions automatically on load
adb install -g stario.apk
```

---

## Decentralized Local Updates (Offline Delivery)

To preserve privacy and remain independent of tracking clouds, Stario does not contain self-updater services. Users can configure decentralized update agents to track release channels locally.

### Obtainium Configuration
[Obtainium](https://github.com/ImranRayan/Obtainium) is an open-source decentralized agent that downloads APKs directly from their respective source repositories (e.g. GitHub releases) and handles local sideload updates.

1. Install Obtainium on your mobile device.
2. Select **Add App** within Obtainium.
3. Inject the official Stario source link: `https://github.com/yutila-org/stario`
4. Set execution parameters:
   * **Filter APKs by name**: `stario.apk`
   * **Install automatically**: Enabled
5. Click **Add**. Obtainium will monitor the release logs and fetch signed, secure updates directly without telemetry middleware tracking.
