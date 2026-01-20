package com.expensecompass.app.plugins;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.Executor;

@CapacitorPlugin(name = "BiometricAuth")
public class BiometricAuthPlugin extends Plugin {

    @PluginMethod
    public void isAvailable(PluginCall call) {
        BiometricManager manager = BiometricManager.from(getContext());
        int result = manager.canAuthenticate(
                BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.BIOMETRIC_WEAK
        );

        JSObject ret = new JSObject();
        ret.put("available", result == BiometricManager.BIOMETRIC_SUCCESS);
        call.resolve(ret);
    }

    @PluginMethod
    public void verify(PluginCall call) {
        String title = call.getString("title", "Verify");
        String subtitle = call.getString("subtitle", "");

        FragmentActivity activity;
        try {
            activity = (FragmentActivity) getActivity();
        } catch (Exception e) {
            call.reject("Activity is not a FragmentActivity");
            return;
        }

        Executor executor = ContextCompat.getMainExecutor(getContext());

        BiometricPrompt.AuthenticationCallback callback = new BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            }

            @Override
            public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                call.reject(errString.toString());
            }

            @Override
            public void onAuthenticationFailed() {
                // Keep prompt open; no-op.
            }
        };

        BiometricPrompt prompt = new BiometricPrompt(activity, executor, callback);

        BiometricPrompt.PromptInfo.Builder builder = new BiometricPrompt.PromptInfo.Builder()
                .setTitle(title);

        if (subtitle != null && !subtitle.isEmpty()) {
            builder.setSubtitle(subtitle);
        }

        builder.setAllowedAuthenticators(
                BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.BIOMETRIC_WEAK
        );

        builder.setNegativeButtonText("Cancel");

        prompt.authenticate(builder.build());
    }
}
