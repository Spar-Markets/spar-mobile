import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SuccessScreen from './components/SuccessScreen';
import HomeScreen from './components/HomeScreen';
import { PlaidTheme } from './components/style';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Onboardscreen1 from './components/Onboardscreen1';
import Onboardscreen2 from './components/Login';

const Stack = createNativeStackNavigator();

const App = (): React.ReactElement => {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={PlaidTheme}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Stack.Navigator>
        <Stack.Screen
          name="Onboard1"
          component={Onboardscreen1}
          options={{
            // headerShown: false, // Hide header for Onboard1
            title: 'Welcome',
          }}
        />
        <Stack.Screen
          name="Login"
          component={Onboardscreen2}
          options={{
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

// <Stack.Screen
// name="Home"
// component={HomeScreen}
// options={{
//   headerStyle: {
//     backgroundColor: '#000000',
//   },
//   headerTintColor: '#fff',
// }}
// />
// <Stack.Screen
// name="Success"
// component={SuccessScreen}
// options={{
//   headerStyle: {
//     backgroundColor: '#000000',
//   },
//   headerTintColor: '#fff',
// }}
// />


export default App;