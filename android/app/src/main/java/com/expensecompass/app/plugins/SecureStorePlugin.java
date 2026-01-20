package com.expensecompass.app.plugins;

import android.content.Context;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SecureStore")
public class SecureStorePlugin extends Plugin {

    private android.content.SharedPreferences prefs;

    private android.content.SharedPreferences getPrefs() throws Exception {
        if (prefs != null) return prefs;

        Context context = getContext();

        MasterKey masterKey = new MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build();

        prefs = EncryptedSharedPreferences.create(
                context,
                "secure_store",
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        );

        return prefs;
    }

    @PluginMethod
    public void get(PluginCall call) {
        String key = call.getString("key");
        if (key == null || key.isEmpty()) {
            call.reject("Missing key");
            return;
        }

        try {
            String value = getPrefs().getString(key, null);
            JSObject ret = new JSObject();
            ret.put("value", value);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("SecureStore get failed", e);
        }
    }

    @PluginMethod
    public void set(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");

        if (key == null || key.isEmpty()) {
            call.reject("Missing key");
            return;
        }

        if (value == null) {
            call.reject("Missing value");
            return;
        }

        try {
            getPrefs().edit().putString(key, value).apply();
            call.resolve();
        } catch (Exception e) {
            call.reject("SecureStore set failed", e);
        }
    }

    @PluginMethod
    public void remove(PluginCall call) {
        String key = call.getString("key");
        if (key == null || key.isEmpty()) {
            call.reject("Missing key");
            return;
        }

        try {
            getPrefs().edit().remove(key).apply();
            call.resolve();
        } catch (Exception e) {
            call.reject("SecureStore remove failed", e);
        }
    }
}
