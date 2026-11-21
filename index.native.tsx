import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { registerRootComponent } from 'expo';

function NativeApp() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Compute dev server URL
  const detectedUrl = useMemo(() => {
    // 1. Try hostUri from expoConfig (e.g., 192.168.1.5:8081 or 192.168.1.5:8088)
    const rawHost =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
      '';

    if (rawHost) {
      // If rawHost already specifies a port, preserve it; otherwise default to :8081
      const target = rawHost.includes(':') ? rawHost : `${rawHost}:8081`;
      return `http://${target}`;
    }
    // Fallback for Android emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8081';
    }
    return 'http://localhost:8081';
  }, []);

  const [currentUrl, setCurrentUrl] = useState(detectedUrl);

  const getAlternativeUrl = (targetPort: number) => {
    try {
      const parsed = new URL(currentUrl);
      parsed.port = String(targetPort);
      return parsed.toString().replace(/\/$/, '');
    } catch {
      return `http://localhost:${targetPort}`;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#09090c" />
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          originWhitelist={['*']}
          mixedContentMode="always"
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures={true}
          startInLoadingState={true}
          onLoadStart={() => {
            setLoading(true);
            setLoadError(null);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setLoading(false);
            setLoadError(nativeEvent.description || 'Gagal memuat Pitbull Fit Web server');
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#931b26" />
              <Text style={styles.loadingText}>Memuat PITBULL FIT Liquid Glass...</Text>
            </View>
          )}
        />

        {loadError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>PITBULL FIT</Text>
            <Text style={styles.errorDesc}>
              Tidak dapat terhubung ke server web:
            </Text>
            <Text style={styles.errorUrl}>{currentUrl}</Text>
            <Text style={styles.errorHint}>
              Pastikan Anda menjalankan "npx expo start" atau "npm run dev", dan smartphone berada dalam satu jaringan Wi-Fi yang sama.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setLoadError(null);
                  webViewRef.current?.reload();
                }}
              >
                <Text style={styles.retryText}>Coba Lagi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.altBtn}
                onPress={() => {
                  const alt = getAlternativeUrl(3000);
                  setLoadError(null);
                  setCurrentUrl(alt);
                }}
              >
                <Text style={styles.altText}>Coba Vite (:3000)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.altBtn}
                onPress={() => {
                  const alt = getAlternativeUrl(8081);
                  setLoadError(null);
                  setCurrentUrl(alt);
                }}
              >
                <Text style={styles.altText}>Coba Metro (:8081)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090c'
  },
  container: {
    flex: 1,
    backgroundColor: '#09090c'
  },
  webView: {
    flex: 1,
    backgroundColor: '#09090c'
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#09090c',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  loadingText: {
    color: '#fafafa',
    fontSize: 13,
    fontWeight: '700'
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#09090c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10
  },
  errorTitle: {
    color: '#931b26',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1
  },
  errorDesc: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  errorUrl: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  errorHint: {
    color: '#a1a1aa',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12
  },
  retryBtn: {
    backgroundColor: '#931b26',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  altBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },
  altText: {
    color: '#d4d4d8',
    fontSize: 12,
    fontWeight: '700'
  }
});

registerRootComponent(NativeApp);

export default NativeApp;
