package com.expensecompass.app.plugins;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "OpenFile")
public class OpenFilePlugin extends Plugin {

    @PluginMethod
    public void pick(PluginCall call) {
        String mimeType = call.getString("mimeType", "application/json");

        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);

        startActivityForResult(call, intent, "pickResult");
    }

    @ActivityCallback
    private void pickResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() != Activity.RESULT_OK) {
            call.reject("Pick canceled");
            return;
        }

        Intent dataIntent = result.getData();
        if (dataIntent == null || dataIntent.getData() == null) {
            call.reject("No file selected");
            return;
        }

        Uri uri = dataIntent.getData();
        String filename = uri.getLastPathSegment();

        try (InputStream in = getContext().getContentResolver().openInputStream(uri)) {
            if (in == null) {
                call.reject("Unable to open file");
                return;
            }
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] data = new byte[4096];
            int n;
            while ((n = in.read(data)) != -1) {
                buffer.write(data, 0, n);
            }
            String text = buffer.toString(StandardCharsets.UTF_8.name());

            JSObject ret = new JSObject();
            ret.put("name", filename != null ? filename : "backup.json");
            ret.put("data", text);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to read file", e);
        }
    }
}
