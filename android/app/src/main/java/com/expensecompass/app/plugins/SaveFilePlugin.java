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

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "SaveFile")
public class SaveFilePlugin extends Plugin {

    @PluginMethod
    public void save(PluginCall call) {
        String filename = call.getString("filename");
        String data = call.getString("data");
        String mimeType = call.getString("mimeType", "application/octet-stream");

        if (filename == null || filename.isEmpty()) {
            call.reject("Missing filename");
            return;
        }

        if (data == null) {
            call.reject("Missing data");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, filename);

        startActivityForResult(call, intent, "saveResult");
    }

    @ActivityCallback
    private void saveResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() != Activity.RESULT_OK) {
            call.reject("Save canceled");
            return;
        }

        Intent dataIntent = result.getData();
        if (dataIntent == null || dataIntent.getData() == null) {
            call.reject("No file selected");
            return;
        }

        Uri uri = dataIntent.getData();

        String data = call.getString("data", "");

        try (OutputStream out = getContext().getContentResolver().openOutputStream(uri)) {
            if (out == null) {
                call.reject("Unable to open output stream");
                return;
            }
            out.write(data.getBytes(StandardCharsets.UTF_8));
            out.flush();
        } catch (Exception e) {
            call.reject("Failed to write file", e);
            return;
        }

        JSObject ret = new JSObject();
        ret.put("uri", uri.toString());
        call.resolve(ret);
    }
}
