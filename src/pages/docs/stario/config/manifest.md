---
layout: ../../../../layouts/StarioDocsLayout.astro
title: Manifest Configuration
description: Technical breakdown of Stario's AndroidManifest.xml structure, permissions boundary, and security controls.
---

The `AndroidManifest.xml` acts as the definitive security boundary for Stario. Under the **zero-telemetry, privacy-first mandate**, the manifest is strictly audited to enforce permission minimization and completely restrict background network operations at the operating system level.

---

## Permission Architecture

Stario requests only the absolute minimum set of permissions necessary to execute launcher operations. By design, the manifest **deliberately omits** network socket access.

| Permission | Protection Level | Purpose | Architecture Constraint |
| :--- | :--- | :--- | :--- |
| `android.permission.QUERY_ALL_PACKAGES` | Normal (Restricted) | Application Populating | Required on Android 11 (API 30+) to inspect and launch packages on the system. |
| `android.permission.BIND_APPWIDGET` | Signature\|System | Desktop Widget Hosting | Required to bind app widgets to the home screen grid. Approved programmatically via system Binder transaction. |
| `android.permission.EXPAND_STATUS_BAR` | Normal | Notification Drawer Pull | Allows pulling down the Android notification drawer from a swipe gesture on the wallpaper. |
| `android.permission.SET_WALLPAPER` | Normal | System Customization | Allows launching the dynamic system wallpaper picker and reading active dynamic system assets. |

### Manifest Declarations

The permissions are defined in the manifest file as follows:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="org.yutila.stario">

    <!-- Query installed applications on API 30+ -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
    
    <!-- Widget Binder Permission -->
    <uses-permission android:name="android.permission.BIND_APPWIDGET" />
    
    <!-- Gesture status bar expansion -->
    <uses-permission android:name="android.permission.EXPAND_STATUS_BAR" />
    
    <!-- Dynamic wallpaper binding -->
    <uses-permission android:name="android.permission.SET_WALLPAPER" />

    <!-- Additional properties omitted for brevity -->
</manifest>
```

---

## Manifest Merging & Network Denials

To guarantee absolute compliance with the zero-telemetry mandate, the build pipeline enforces that **no upstream library or dependency can inject network-related permissions** during compiler merging. 

If an upstream dependency requests network access, the build compiler is configured to explicitly drop the permission through merger directives.

```xml
<!-- Enforced in manifest merging to remove potential rogue permissions -->
<uses-permission 
    android:name="android.permission.INTERNET" 
    tools:node="remove" />
<uses-permission 
    android:name="android.permission.ACCESS_NETWORK_STATE" 
    tools:node="remove" />
```

> [!IMPORTANT]
> The omission of `INTERNET` and `ACCESS_NETWORK_STATE` makes it mathematically impossible for Stario to make socket connections, bypass offline boundaries, or exfiltrate dynamic launcher configurations. The OS sandbox will instantly terminate any system call trying to open network connections.

---

## Component Architecture

Stario defines a single entry point for its interface, serving as the system's home screen. The home activity must be declared with appropriate filters to register with the Android `ActivityManager` as a qualified desktop handler:

```xml
<application
    android:allowBackup="false"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/Theme.Stario.NoActionBar">

    <activity
        android:name=".ui.MainActivity"
        android:exported="true"
        android:launchMode="singleTask"
        android:clearTaskOnLaunch="true"
        android:stateNotNeeded="true"
        android:windowSoftInputMode="adjustPan|stateUnchanged">
        
        <!-- Standard Launcher filters -->
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.HOME" />
            <category android:name="android.intent.category.DEFAULT" />
        </intent-filter>
        
        <!-- Application list entrypoint -->
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>

</application>
```

### Activity Configuration Parameters

To ensure perfect home screen mechanics, the `MainActivity` relies on specific OS parameters defined in the manifest:

1. **`android:launchMode="singleTask"`**: Guarantees that only a single instance of the launcher activity exists in the system task stack. Any subsequent home button clicks route directly back to the active home task instead of instantiating new tasks.
2. **`android:clearTaskOnLaunch="true"`**: Clears any child tasks/nested fragments whenever the user navigates away and clicks home, returning the viewport to a predictable, clean state.
3. **`android:stateNotNeeded="true"`**: Prevents the OS from serializing dynamic state to disk in memory pressure situations, reducing security surface areas and disk overhead.
