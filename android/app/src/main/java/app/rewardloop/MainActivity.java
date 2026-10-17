package app.rewardloop;

import android.app.PictureInPictureParams;
import android.os.Build;
import android.os.Bundle;
import android.util.Rational;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
import app.rewardloop.unity.UnityAdsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        registerPlugin(UnityAdsPlugin.class);
        super.onCreate(savedInstanceState);
        WindowCompat.enableEdgeToEdge(getWindow());
    }

    @Override
    public void onUserLeaveHint() {
        if (UnityAdsPlugin.isFullscreenAdShowing() && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            PictureInPictureParams params =
                    new PictureInPictureParams.Builder().setAspectRatio(new Rational(16, 9)).build();
            enterPictureInPictureMode(params);
        }
        super.onUserLeaveHint();
    }
}
