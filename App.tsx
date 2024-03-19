import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SuccessScreen from './components/SuccessScreen';
import Plaid from './components/Plaid';
import { PlaidTheme } from './Style/style';
import Onboardscreen1 from './components/OnboardScreen';
import Home from './components/Home';
import { Auth0Provider } from 'react-native-auth0';
import CoreApp from './CoreApp';

const Stack = createNativeStackNavigator();

const Auth0Config = {
  domain: "dev-wol45o5xjg0gma8k.us.auth0.com",
  clientId: "o8K4SMbnC2Y059k4PZ1gkpCaj3Hb8dgP"
};

const App = (): React.ReactElement => {
  return (
    <Auth0Provider
      domain={Auth0Config.domain}
      clientId={Auth0Config.clientId}
    >
    <SafeAreaProvider>
      <NavigationContainer theme={PlaidTheme}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Stack.Navigator>
        <Stack.Screen
          name="Onboardscreen1"
          component={Onboardscreen1}
          options={{
            // headerShown: false, // Hide header for Onboard
            title: 'Welcome',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="CoreApp"
          component={CoreApp}
          options={{ headerShown: false}} 
        />
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </Auth0Provider>
  );
};

export default App;