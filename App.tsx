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
import Profile1 from './components/Profile';
import Deposit from './components/Deposit';
import Transfers from './components/Transfers';
import Withdraw from './components/Withdraw';
import TestGraph from './components/TestGraph';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Stack = createNativeStackNavigator();

const Auth0Config = {
  domain: "dev-wol45o5xjg0gma8k.us.auth0.com",
  clientId: "o8K4SMbnC2Y059k4PZ1gkpCaj3Hb8dgP"
};

const App = (): React.ReactElement => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <Auth0Provider
      domain={Auth0Config.domain}
      clientId={Auth0Config.clientId}
    >
    <SafeAreaProvider>
      <NavigationContainer theme={PlaidTheme}>
        <StatusBar backgroundColor="#000000" />
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
        <Stack.Screen
          name="Profile"
          component={Profile1}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Deposit"
          component={Deposit}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Transfers"
          component={Transfers}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Withdraw"
          component={Withdraw}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TestGraph"
          component={TestGraph}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </Auth0Provider>
    </GestureHandlerRootView>
  );
};

export default App;