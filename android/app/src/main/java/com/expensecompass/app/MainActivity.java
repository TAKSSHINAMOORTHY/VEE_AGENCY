package com.expensecompass.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import com.expensecompass.app.plugins.BiometricAuthPlugin;
import com.expensecompass.app.plugins.OpenFilePlugin;
import com.expensecompass.app.plugins.SaveFilePlugin;
import com.expensecompass.app.plugins.SecureStorePlugin;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		registerPlugin(SecureStorePlugin.class);
		registerPlugin(BiometricAuthPlugin.class);
		registerPlugin(SaveFilePlugin.class);
		registerPlugin(OpenFilePlugin.class);
		super.onCreate(savedInstanceState);
	}
}
