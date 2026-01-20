package com.expensecompass.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import com.expensecompass.app.plugins.BiometricAuthPlugin;
import com.expensecompass.app.plugins.SecureStorePlugin;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		registerPlugin(SecureStorePlugin.class);
		registerPlugin(BiometricAuthPlugin.class);
	}
}
