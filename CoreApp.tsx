import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SuccessScreen from './components/SuccessScreen';
import Profile from './components/Profile';
import { PlaidTheme } from './Style/style';
import Home from './components/Home';
import { Auth0Provider } from 'react-native-auth0';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StockSearch from './components/StockSearch';
import Icon from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

const Auth0Config = {
  domain: "dev-wol45o5xjg0gma8k.us.auth0.com",
  clientId: "o8K4SMbnC2Y059k4PZ1gkpCaj3Hb8dgP"
};

const CoreApp = (): React.ReactElement => {
  Icon.loadFont();

  const colorScheme = useColorScheme();
  return (
    <Auth0Provider
      domain={Auth0Config.domain}
      clientId={Auth0Config.clientId}
    >
    <SafeAreaProvider>
        {/* <StatusBar barStyle="light-content" backgroundColor="#000000" /> */}
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: [{
              height: 90,
              paddingHorizontal: 5,
              paddingTop: 5,
              position: 'absolute',
              borderTopWidth: 0,
            }, colorScheme == "dark" ? {backgroundColor: '#161d29'} : {backgroundColor: '#E6E6E6'}],
            tabBarIcon: ({ focused, color, size }) => {
              let iconName= "";

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'user' : 'user';
              } else if (route.name === 'Stocks') {
                iconName = focused ? 'line-chart' : 'line-chart';
              }

              // You can return any component here, not just an icon
              return <Icon name={iconName} size={size} color={color} />;
            },
            
            })}>
            <Tab.Screen name="Home" component={Home} options={{headerShown: false}}/>
            <Tab.Screen name="Stocks" component={StockSearch} options={{headerShown: false}}/>
            <Tab.Screen name="Profile" component={Profile}/>
        </Tab.Navigator>
    </SafeAreaProvider>
    </Auth0Provider>
  );
};



export default CoreApp;