package com.onlysplit.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.View;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(ApkInstallerPlugin.class);
        registerPlugin(DeviceUtilsPlugin.class);
        super.onCreate(savedInstanceState);

        // ─── Edge-to-edge: draw content behind system bars ────────────────
        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // Make both bars fully transparent so the app merges with them
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // Light (white) icons on the transparent bars
        View decorView = window.getDecorView();
        WindowInsetsControllerCompat insetsController =
                WindowCompat.getInsetsController(window, decorView);
        insetsController.setAppearanceLightStatusBars(false);
        insetsController.setAppearanceLightNavigationBars(false);
    }
}
