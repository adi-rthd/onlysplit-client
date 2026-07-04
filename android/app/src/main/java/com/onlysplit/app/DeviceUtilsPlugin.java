package com.onlysplit.app;

import android.content.Intent;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DeviceUtils")
public class DeviceUtilsPlugin extends Plugin {

    @PluginMethod
    public void getDeviceInfo(PluginCall call) {
        String manufacturer = Build.MANUFACTURER;
        boolean isSamsung = "samsung".equalsIgnoreCase(manufacturer);
        boolean isOneUi = isSamsung && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P;

        JSObject result = new JSObject();
        result.put("manufacturer", manufacturer);
        result.put("isSamsung", isSamsung);
        result.put("isOneUi", isOneUi);
        call.resolve(result);
    }

    @PluginMethod
    public void openSecuritySettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_SECURITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            if (intent.resolveActivity(getContext().getPackageManager()) != null) {
                getContext().startActivity(intent);
            } else {
                Intent fallback = new Intent(Settings.ACTION_SETTINGS);
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(fallback);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open settings: " + e.getMessage());
        }
    }
}
