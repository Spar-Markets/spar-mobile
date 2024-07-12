// WebViewScreen.tsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';

type RootStackParamList = {
  WebViewScreen: { url: string };
};

type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebViewScreen'>;

const WebViewScreen: React.FC = () => {
  //const route = useRoute<WebViewScreenRouteProp>();
  //const { url } = route.params;

  return (
    <View style={styles.container}>
      <WebView source={{ uri: "https://www.fool.com/investing/2024/06/19/why-nvidia-stock-will-drop-over-50/" }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebViewScreen;
