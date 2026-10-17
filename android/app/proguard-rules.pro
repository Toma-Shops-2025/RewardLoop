# Capacitor (reflection-based plugin loading)
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod <methods>;
}
-keep class com.getcapacitor.** { *; }
-keep class app.rewardloop.** { *; }

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Unity Ads SDK
-keep class com.unity3d.ads.** { *; }
-dontwarn com.unity3d.**

# Billing
-keep class com.android.billingclient.** { *; }

# Preserve line numbers for crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
