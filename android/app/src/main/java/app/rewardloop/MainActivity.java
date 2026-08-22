package app.rewardloop;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import io.capawesome.capacitorjs.plugins.androidedgetoedgesupport.EdgeToEdgePlugin;
import app.rewardloop.unity.UnityAdsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        registerPlugin(EdgeToEdgePlugin.class);
        registerPlugin(UnityAdsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
