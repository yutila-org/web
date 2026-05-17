---
layout: ../../../../layouts/StarioDocsLayout.astro
title: Compiling from Source
description: Comprehensive workspace setup, toolchain requirements, and execution commands to compile Stario from source.
---

Compiling Stario locally ensures complete control over supply chain integrity and permits developers to audit reproducible binaries before deploying them onto target hardware. 

---

## Toolchain & Environment Provisioning

Stario utilizes modern Android build systems requiring standard tools. A full graphic suite like Android Studio is not mandatory; standard CLI command-line utilities are fully supported.

### 1. JDK 17 Installation
Gradle configurations require JDK 17. Newer Java versions (e.g. OpenJDK 21+) will trigger daemon compile exceptions due to deprecated Groovy compiler classes.

Verify your environment variables:
```bash
# Verify Java Compiler version
java -version
# Must yield: openjdk version "17.0.x"
```

### 2. Android SDK Command-line Tools
The build engine operates with **Android API Level 34 (Upside Down Cake)** tools. You can install all platform prerequisites directly via the standard Android SDK manager CLI:

```bash
# Navigate to your local Android SDK Tools binary folder
cd $ANDROID_HOME/cmdline-tools/latest/bin

# Install compiler platform tools, build tools, and NDK
./sdkmanager --install "platforms;android-34" "build-tools;34.0.0" "ndk;26.1.10909125"
```

---

## Build Execution

Stario includes a hardened Gradle wrapper (`gradlew`) to manage dependencies.

### 1. Memory and Daemon Configurations (`gradle.properties`)
To guarantee build speed and avoid compiler out-of-memory errors on restricted machines, confirm the compilation parameters in `gradle.properties`:

```properties
# Allocate memory bounds for Gradle daemon processes
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+UseParallelGC

# Enable compiling optimizations
org.gradle.caching=true
org.gradle.parallel=true
android.useAndroidX=true
```

### 2. Execution Pipelines

To run compilation tasks, navigate to the project directory and invoke the wrapper:

```bash
# 1. Clean previous compiler outputs
./gradlew clean

# 2. Compile debug binary with dynamic test outputs
./gradlew assembleDebug

# 3. Compile optimized production release APK
./gradlew assembleRelease
```

Once the tasks complete, binaries are output to their respective workspace targets:
*   **Debug target**: `app/build/outputs/apk/debug/app-debug.apk`
*   **Release target**: `app/build/outputs/apk/release/app-release-unsigned.apk`

---

## Cryptographic Signature & Hardening

Android requires all APKs to be cryptographically signed with a certificate before they can be loaded by a device. For local compilation, you must generate a secure signing key and reference it securely.

### 1. Key Generation
Generate a self-signed Keystore certificate via your terminal:

```bash
keytool -genkey -v -keystore release.keystore -alias stario-signing \
  -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Secure Local Credentials Injection
To comply with Git hygiene standards, **never commit raw keystore files or key passwords to version control**. Instead, store them in the untracked local parameters file:

#### `local.properties` (Enforce ignoring in `.gitignore`)
```properties
# Path to your local signature asset
signing.keystore.path=/path/to/release.keystore
signing.keystore.password=your_keystore_password
signing.key.alias=stario-signing
signing.key.password=your_alias_password
```

#### `app/build.gradle` (Decoupled signing lookup)
```groovy
android {
    ...
    signingConfigs {
        release {
            def localProps = new Properties()
            def localPropsFile = rootProject.file('local.properties')
            if (localPropsFile.exists()) {
                localProps.load(new FileInputStream(localPropsFile))
                
                storeFile = file(localProps.getProperty('signing.keystore.path'))
                storePassword = localProps.getProperty('signing.keystore.password')
                keyAlias = localProps.getProperty('signing.key.alias')
                keyPassword = localProps.getProperty('signing.key.password')
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## Troubleshooting Build Failures

| Exception | Root Cause | Solution |
| :--- | :--- | :--- |
| `Unsupported class file major version 65.0` | active JDK is running on Java 21+ which Gradle doesn't support yet. | Enforce system environment: `export JAVA_HOME=/path/to/jdk-17` and re-run. |
| `SDK location not found` | The compiler lacks access to system Android SDK paths. | Create `local.properties` in the root folder and define: `sdk.dir=/your/path/to/android-sdk` |
| `GC overhead limit exceeded` | Compile process has starved system JVM memory bounds. | Adjust `org.gradle.jvmargs` in `gradle.properties` to increase heap bounds (e.g. `-Xmx4g`). |
