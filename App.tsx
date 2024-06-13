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
import StockDetails from './components/StockDetails';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import GameScreen from './components/InGameComponents/GameScreen';
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
        </Stack.Navigator>
      </NavigationContainer>
    )
  } else {
    return (
      <NavigationContainer theme={theme}>
        <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'}/>
        <Stack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}>
          <Stack.Screen
            name="SignupScreen"
            component={SignupScreen}
            options={{
              gestureDirection: 'horizontal',
              animation: 'slide_from_left',
            }}
          />
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
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
