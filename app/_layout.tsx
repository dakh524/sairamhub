import { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomSplashScreen from '../components/CustomSplashScreen';

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        {isSplashVisible && (
          <CustomSplashScreen onFinish={() => setIsSplashVisible(false)} />
        )}
      </View>
    </SafeAreaProvider>
  );
}
