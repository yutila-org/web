---
layout: ../../../../layouts/StarioDocsLayout.astro
title: Theming & Material You
description: High-fidelity details of Stario's dynamic color engine, attribute resolution guidelines, and styling tokens.
---

Stario features a strict dynamic theming system rooted in Android’s system-level dynamic color architecture (**Material You / Monet**). Interface coloring adapt dynamically to the user's wallpaper without relying on external styling databases or telemetry-based profiling.

---

## Dynamic Color Architecture

The dynamic colors are fetched directly from the Android framework via `DynamicColors` API wrappers. When a wallpaper is updated, the Android system generates a set of color palettes consisting of primary, secondary, tertiary, and neutral tones.

Stario injects these palettes into its activity lifecycle on execution:

```kotlin
package org.yutila.stario.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.color.DynamicColors

abstract class BaseActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Enforce Material You dynamic palette before layout inflation
        DynamicColors.applyToActivityIfAvailable(this)
        super.onCreate(savedInstanceState)
    }
}
```

---

## Catppuccin Theme Integration (Mocha Palette)

When dynamic colors are disabled or unavailable, Stario defaults to a customized Catppuccin Mocha theme. The baseline colors are resolved in `colors.xml` and loaded as attribute mappings in the root `themes.xml` file.

### 1. Palette Declarations (`res/values/colors.xml`)

```xml
<resources>
    <!-- Catppuccin Mocha Baseline -->
    <color name="mocha_crust">#11111b</color>
    <color name="mocha_mantle">#181825</color>
    <color name="mocha_base">#1e1e2e</color>
    <color name="mocha_surface0">#313244</color>
    <color name="mocha_surface1">#45475a</color>
    
    <color name="mocha_text">#cdd6f4</color>
    <color name="mocha_subtext0">#a6adc8</color>
    
    <color name="mocha_blue">#89b4fa</color>
    <color name="mocha_lavender">#b4befe</color>
    <color name="mocha_red">#f38ba8</color>
    <color name="mocha_yellow">#f9e2af</color>
</resources>
```

### 2. Style & Theme Tokens (`res/values/themes.xml`)

```xml
<resources xmlns:tools="http://schemas.android.com/tools">
    <!-- Main Application Theme -->
    <style name="Theme.Stario" parent="Theme.Material3.DayNight.NoActionBar">
        <!-- Palette overrides matching system standards -->
        <item name="colorPrimary">@color/mocha_blue</item>
        <item name="colorOnPrimary">@color/mocha_crust</item>
        <item name="colorContainer">@color/mocha_base</item>
        
        <item name="android:windowBackground">@color/mocha_crust</item>
        <item name="android:statusBarColor">@color/mocha_mantle</item>
        <item name="android:navigationBarColor">@color/mocha_mantle</item>
        
        <!-- Component Specific Attributes -->
        <item name="colorSurface">@color/mocha_mantle</item>
        <item name="colorOnSurface">@color/mocha_text</item>
        <item name="colorOnSurfaceVariant">@color/mocha_subtext0</item>
    </style>
</resources>
```

---

## Style Resolution Rules

To maintain absolute accessibility and dynamic scaling, **hardcoded hex colors are strictly prohibited** in the user interface files (both XML layouts and Kotlin views). 

### 1. XML Layout Compliance

Always use dynamic attribute references `?attr/*` in XML layouts. This ensures the view instantly adjusts its appearance when transitioning between dark mode, light mode, or custom system dynamic palettes.

```xml
<!-- CORRECT: Attributes resolve dynamically -->
<TextView
    android:id="@+id/app_title"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:textColor="?attr/colorOnSurface"
    android:background="?attr/colorSurface" />

<!-- INCORRECT: HARDCODED HEX VALUES ARE PROHIBITED -->
<TextView
    android:textColor="#cdd6f4"
    android:background="#181825" />
```

### 2. Programmatic Resolution (Kotlin)

When custom canvas drawing or programmatic view building requires a raw integer color value, you must resolve the color attribute from the active theme instance dynamically.

```kotlin
package org.yutila.stario.utils

import android.content.Context
import android.util.TypedValue
import androidx.annotation.AttrRes
import androidx.annotation.ColorInt

object ThemeUtils {
    @ColorInt
    fun resolveThemeColor(context: Context, @AttrRes attrRes: Int): Int {
        val typedValue = TypedValue()
        val theme = context.theme
        if (theme.resolveAttribute(attrRes, typedValue, true)) {
            return typedValue.data
        }
        throw IllegalArgumentException("Attribute ${context.resources.getResourceName(attrRes)} not defined in theme")
    }
}

// Usage in custom canvas/views:
val surfaceColor = ThemeUtils.resolveThemeColor(context, com.google.android.material.R.attr.colorSurface)
paint.color = surfaceColor
```

> [!WARNING]
> Bypassing theme resolution or embedding static color arrays in layout code causes immediate rendering failures during night mode swaps or high-contrast accessibility tests. Always compile layouts utilizing dynamic system resource tokens.
