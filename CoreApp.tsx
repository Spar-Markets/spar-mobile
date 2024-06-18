import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SuccessScreen from './components/SuccessScreen';
import Profile from './components/ProfileComponents/Profile';
import { PlaidTheme } from './styles/style';
import Home from './components/HomeComponents/Home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StockSearch from './components/StockComponents/StockSearch';
import Icon from 'react-native-vector-icons/FontAwesome';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import Bank from './components/Bank'
import Feed from './components/FeedComponents/Feed';
import { useTheme } from './components/ContextComponents/ThemeContext';
import { useStatusBarHeight } from './components/ContextComponents/StatusBarHeightContext';
import { useDimensions } from './components/ContextComponents/DimensionsContext';

const Tab = createBottomTabNavigator();

const CoreApp = (): React.ReactElement => {
  Icon.loadFont();

  const { theme } = useTheme();
  const statusBarHeight = useStatusBarHeight();
  const { width, height } = useDimensions();
  {/*<Auth0Provider
  domain={Auth0Config.domain}
  clientId={Auth0Config.clientId}
  >
</Auth0Provider>*/} //commented out because big issues with it
  return (

        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = "";
  
              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Stocks') {
                iconName = 'search';
              } else if (route.name === 'Bank') {
                iconName = 'bank';
              } else if (route.name === 'Profile') {
                iconName = 'user';
              } else if (route.name === 'Feed') {
                iconName = 'th-large';
              }
  
              // You can return any component that you like here!
              return ( 
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Icon name={iconName} size={size} color={color} />
              </View>
              )
            },
            tabBarActiveTintColor: theme.colors.opposite, // Mint green color for active tab
            tabBarInactiveTintColor: theme.colors.tertiary,
            tabBarStyle: { backgroundColor: theme.colors.background, 
              height: 80, borderTopWidth: 0}, // Black background for the tab bar
            tabBarLabel: () => null
            })}>
            
            <Tab.Screen name="Home" component={Home} options={{headerShown: false, title: 'Home'}}/>
            <Tab.Screen name="Stocks" component={StockSearch} options={{headerShown: false}}/>
            <Tab.Screen name="Feed" component={Feed} options={{headerShown:false}}/>
            <Tab.Screen name="Bank" component={Bank} options={{headerShown: false}}/>
            <Tab.Screen name="Profile" component={Profile}/>
        </Tab.Navigator>
  );
};



export default CoreApp;