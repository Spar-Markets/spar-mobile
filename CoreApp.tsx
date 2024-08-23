import React, { useState } from 'react';
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
import { Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from './GlobalDataManagment/store';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

const Tab = createBottomTabNavigator()

const CoreApp = (): React.ReactElement => {
  Icon.loadFont();

  const balance = useSelector((state: RootState) => state.user.balance)

  const [onHome, setOnHome] = useState(false)

  const { theme } = useTheme();
  const statusBarHeight = useStatusBarHeight();
  const { width, height } = useDimensions();
  {/*<Auth0Provider
  domain={Auth0Config.domain}
  clientId={Auth0Config.clientId}
  >
</Auth0Provider>*/} //commented out because big issues with it
  // if (balance) {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = "";

            if (route.name === 'Portfolio') {
              iconName = 'home';
            } else if (route.name === 'Discover') {
              iconName = 'search';
            } else if (route.name === 'Bank') {
              iconName = 'bank';
            } else if (route.name === 'Profile') {
              iconName = 'user';
            } else if (route.name === 'Feed') {
              iconName = 'th-large';
            }

            if (route.name == "home" && focused) {
              setOnHome(true)
            }

            // You can return any component that you like here!
            return (
              <>
                <View style={{ flex: 1, alignItems: 'center', gap: 3, marginTop: 20 }}>
                  {route.name != "Portfolio" ? <Icon name={iconName} size={size} color={color} /> : <View style={{ height: size }}><Text style={[focused ? { color: theme.colors.text } : { color: theme.colors.secondaryText }, { fontFamily: 'InterTight-Bold', fontSize: 22 }]}>${balance?.toFixed(2)}</Text></View>}
                  <Text style={[focused ? { color: theme.colors.text } : { color: theme.colors.secondaryText }, { fontSize: 12, fontFamily: 'InterTight-medium' }]}>{route.name}</Text>
                  <View style={[focused ? { backgroundColor: theme.colors.accent } : { backgroundColor: 'transparent' }, { height: 3, width: width / 16, borderRadius: 100 }]}></View>
                </View>
              </>
            )
          },
          tabBarActiveTintColor: theme.colors.text, // Mint green color for active tab
          tabBarInactiveTintColor: theme.colors.secondaryText,
          tabBarStyle: {
            height: 85, borderRadius: 0, paddingHorizontal: 10, backgroundColor: theme.colors.background, marginBottom: 5
          }, // Black background for the tab bar
          tabBarShowLabel: false,
          /*tabBarBackground: () => (
            <View style={{flex: 1}}>
              <BlurView
                style={{flex: 1, borderRadius: 10}}
                blurType="light"
                blurAmount={20}
              >

              <LinearGradient
                colors={['rgba(50, 50, 50, 0.3)', 'rgba(0, 0, 0, 0.5)']} start={{x:0, y: 1}} end={{x:1, y: 0}}
                style={{flex: 1}}
              />
              </BlurView>
            </View>
          )*/
        })}>

        <Tab.Screen name="Discover" component={StockSearch} options={{ headerShown: false, lazy: false }} />
        {/*<Tab.Screen name="Feed" component={Feed} options={{headerShown:false}}/>*/}
        <Tab.Screen name="Portfolio" component={Home} options={{ headerShown: false, lazy: false }} />
        <Tab.Screen name="Bank" component={Bank} options={{ headerShown: false }} />
        <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false, lazy: false }} />
      </Tab.Navigator>
    </View>
  );



};



export default CoreApp;