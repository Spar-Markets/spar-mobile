import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Animated, StatusBar, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { createStackNavigator, CardStyleInterpolators, StackCardStyleInterpolator } from '@react-navigation/stack'
import SuccessScreen from './components/SuccessScreen';
import Profile from './components/ProfileComponents/Profile';
import {PlaidTheme} from './styles/style';
import Onboardscreen1 from './components/OnboardScreen';
import Home from './components/HomeComponents/Home';
import CoreApp from './CoreApp';
import Deposit from './components/Deposit';
import Transfers from './components/Transfers';
import Withdraw from './components/Withdraw';
import StockDetails from './components/StockComponents/StockDetails';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import GameScreen from './components/HeadToHeadComponents/GameScreen';
import InGameStockSearch from './components/InGameComponents/InGameStockSearch';
import StockOrder from './components/InGameComponents/StockOrder';
import { ThemeProvider, useTheme } from './components/ContextComponents/ThemeContext';
import { StatusBarHeightProvider } from './components/ContextComponents/StatusBarHeightContext';
import { DimensionsProvider } from './components/ContextComponents/DimensionsContext';
import EnterMatch from './components/HeadToHeadComponents/EnterMatch';
import CommentPage from './components/FeedComponents/CommentPage';
import Feed from './components/FeedComponents/Feed';

import { Provider } from 'react-redux';
import { store } from './GlobalDataManagment/store';
import CreatePost from './components/FeedComponents/CreatePost';
import SignupScreen from './components/OnboardComponents/SignupScreen';
import useAuth from './hooks/useAuth';
import LoginScreen from './components/OnboardComponents/LoginScreen';
import Menu from './components/GlobalComponents/Menu';
import SplashScreen from './components/OnboardComponents/SplashScreen';
import WebViewScreen from './components/GlobalComponents/WebViewScreen';
import Onboard1 from './components/OnboardComponents/Onboard1';
import EmailScreen from './components/OnboardComponents/EmailScreen';
import PasswordScreen from './components/OnboardComponents/PasswordScreen';
import UsernameScreen from './components/OnboardComponents/UsernameScreen';
import SignInScreen from './components/OnboardComponents/SignInScreen';
import OrderSummary from './components/InGameComponents/OrderSummary';
import CreateList from './components/HomeComponents/CreateList';






const Stack = createNativeStackNavigator();

const AppContent = (): React.ReactElement => {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  //onboard or main stack depending on user status
  if (user) {
    return (
      <NavigationContainer theme={theme}>
        <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'}/>
        <Stack.Navigator initialRouteName="CoreApp" screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}>
          <Stack.Screen
            name="CoreApp"
            component={CoreApp}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
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
            name="StockDetails"
            component={StockDetails}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="GameScreen"
            component={GameScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="InGameStockSearch"
            component={InGameStockSearch}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="StockOrder"
            component={StockOrder}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="EnterMatch"
            component={EnterMatch}
            options={{headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Feed"
            component={Feed}
            options={{headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="CommentPage"
            component={CommentPage}
            options={{headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="CreatePost"
            component={CreatePost}
            options={{headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Menu"
            component={Menu}
            options={{headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="WebViewScreen"
            component={WebViewScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="OrderSummary"
            component={OrderSummary}
            options={{
              animation: 'fade'
            }}
          />
          <Stack.Screen
            name="CreateList"
            component={CreateList}
            options={{headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_bottom'
              
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    )
  } else {
    return (
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}>
          <Stack.Screen
            name="Onboard1"
            component={Onboard1}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SignupScreen"
            component={SignupScreen}
          />
          <Stack.Screen
            name="EmailScreen"
            component={EmailScreen}
            options={{
              animation: 'fade'
            }}
          />
          <Stack.Screen
            name="PasswordScreen"
            component={PasswordScreen}
            options={{
              animation: 'fade'
            }}
          />
          <Stack.Screen
            name="UsernameScreen"
            component={UsernameScreen}
            options={{
              animation: 'fade'
            }}
          />
          <Stack.Screen
            name="SignInScreen"
            component={SignInScreen}
            options={{
              animation: 'fade'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}

const App = (): React.ReactElement => {
  return (
      <ThemeProvider>
        <DimensionsProvider>
          <StatusBarHeightProvider>
            <GestureHandlerRootView style={{flex: 1}}>
              <Provider store={store}>
                <AppContent/>
              </Provider>
            </GestureHandlerRootView>
          </StatusBarHeightProvider>
        </DimensionsProvider>
      </ThemeProvider>
  );
};

export default App;
