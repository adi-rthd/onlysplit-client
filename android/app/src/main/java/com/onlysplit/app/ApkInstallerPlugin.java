package com.onlysplit.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "ApkInstaller")
public class ApkInstallerPlugin extends Plugin {

    @PluginMethod
    public void install(PluginCall call) {
        String apkPath = call.getString("apkPath");
        if (apkPath == null || apkPath.isEmpty()) {
            call.reject("apkPath is required");
            return;
        }

        // On Android 8+ (API 26+), we need to request permission to install unknown apps
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!getContext().getPackageManager().canRequestPackageInstalls()) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                startActivityForResult(call, intent, "installPermissionResult");
                return;
            }
        }

        performInstall(call, apkPath);
    }

    @ActivityCallback
    private void installPermissionResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (getContext().getPackageManager().canRequestPackageInstalls()) {
                String apkPath = call.getString("apkPath");
                performInstall(call, apkPath);
            } else {
                call.reject("Permission to install unknown apps was denied");
            }
        } else {
            String apkPath = call.getString("apkPath");
            performInstall(call, apkPath);
        }
    }

    private void performInstall(PluginCall call, String apkPath) {
        try {
            String cleanPath = apkPath;
            if (cleanPath.startsWith("file://")) {
                cleanPath = cleanPath.substring(7);
            }

            File file = new File(cleanPath);
            if (!file.exists()) {
                call.reject("APK file does not exist at path: " + cleanPath);
                return;
            }

            Uri apkUri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                file
            );

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to launch package installer: " + e.getMessage(), e);
        }
    }
}
