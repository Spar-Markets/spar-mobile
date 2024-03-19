import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SuccessScreen from './components/SuccessScreen';
import Plaid from './components/Plaid';
import { PlaidTheme } from './Style/style';
import Home from './components/Home';
import { Auth0Provider } from 'react-native-auth0';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const Auth0Config = {
  domain: "dev-wol45o5xjg0gma8k.us.auth0.com",
  clientId: "o8K4SMbnC2Y059k4PZ1gkpCaj3Hb8dgP"
};

const CoreApp = (): React.ReactElement => {
  return (
    <Auth0Provider
      domain={Auth0Config.domain}
      clientId={Auth0Config.clientId}
    >
    <SafeAreaProvider>
        {/* <StatusBar barStyle="light-content" backgroundColor="#000000" /> */}
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Home} options={{headerShown: false}}/>
            <Tab.Screen name="Plaid" component={Plaid}/>
        </Tab.Navigator>
    </SafeAreaProvider>
    </Auth0Provider>
  );
};



export default CoreApp;