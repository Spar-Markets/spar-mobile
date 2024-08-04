import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Animated, Easing, StatusBar, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  createStackNavigator,
  CardStyleInterpolators,
  StackCardStyleInterpolator,
} from '@react-navigation/stack';
import SuccessScreen from './components/SuccessScreen';
import Profile from './components/ProfileComponents/Profile';
import {PlaidTheme} from './styles/style';
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
import {
  ThemeProvider,
  useTheme,
} from './components/ContextComponents/ThemeContext';
import {StatusBarHeightProvider} from './components/ContextComponents/StatusBarHeightContext';
import {DimensionsProvider} from './components/ContextComponents/DimensionsContext';
import editProfilePage from './components/ProfileComponents/editProfilePage';
import EnterMatch from './components/HeadToHeadComponents/EnterMatch';
import CommentPage from './components/FeedComponents/CommentPage';
import Feed from './components/FeedComponents/Feed';

import {Provider, useDispatch} from 'react-redux';
import {store} from './GlobalDataManagment/store';
import CreatePost from './components/FeedComponents/CreatePost';

// import useAuth from './hooks/useAuth';

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
import ProfileSearch from './components/ProfileComponents/ProfileSearch';
import OtherProfile from './components/ProfileComponents/OtherProfile';
import ProfileActivity from './components/ProfileComponents/ProfileActivity';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {RootState} from './GlobalDataManagment/store';
import FollowersFollowing from './components/ProfileComponents/FollowersFollowing';
import PastMatches from './components/HeadToHeadComponents/PastMatches';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Settings from './components/ProfileComponents/Settings';
import { setBalance, setDefaultProfileImage, setFriendCount, setFriends, setHasDefaultProfileImage, setInvitations, setSkillRating, setUserBio, setUserID, setUsername } from './GlobalDataManagment/userSlice';
import { Text } from 'react-native';
import Invitations from './components/HomeComponents/Invitations';
import axios from 'axios';

import auth from '@react-native-firebase/auth';
import { serverUrl } from './constants/global';

const Stack = createNativeStackNavigator();

const AppContent = (): React.ReactElement => {
  const {theme} = useTheme();
  // const {user, loading} = useAuth();
  // firebase
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  const dispatch = useDispatch()


  // Handle user state changes
  async function setUserState(user: any) {
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch(setUserID((user as any).uid))
      setUser(user);
    } else {
      await AsyncStorage.removeItem('user');
      setUser(undefined);
    }
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUserState);
    return subscriber; // unsubscribe on unmount
  }, []);
  
  const userID = useSelector((state:RootState) => state.user.userID); 

  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
      if (userID) {
        const fetchUserData = async () => {
          try {
            //console.log("server url FROM env:", `${process.env.SERVER_URL}`);
            //console.log("Server url endpoint:", `${serverUrl}/getUser`);
            //console.log("USEUSER, UserID:", userID);
            console.log("PASSING USER ID IN TO GET USER ENDPOINT:", userID)
            console.log("SERVER URL", serverUrl)
            const userResponse = await axios.post(`${serverUrl}/getUser`, { userID });
            const friendResponse = await axios.post(`${serverUrl}/getFriends`, { userID })
            //console.log('Fetched User Data:', response.data);
            dispatch(setUsername(userResponse.data.username))
            dispatch(setUserBio(userResponse.data.bio))
            dispatch(setSkillRating(userResponse.data.skillRating))
            dispatch(setBalance(userResponse.data.balance))
            // dispatch(setFollowers(response.data.followers))
            // dispatch(setFollowing(response.data.following))

            dispatch(setHasDefaultProfileImage(userResponse.data.hasDefaultProfileImage))
            dispatch(setDefaultProfileImage(userResponse.data.defaultProfileImage))
            dispatch(setInvitations(userResponse.data.invitations))
            dispatch(setFriendCount(userResponse.data.friendCount))

            dispatch(setFriends(friendResponse.data))

            setUserData(userResponse.data);
         
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
        fetchUserData();
      }
  }, [userID]);


  const [showSplash, setShowSplash] = useState(true);

  const [fadeOut, setFadeOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fadeOut) {
        Animated.timing(fadeOutAnim, {
          toValue: 0,
          duration: 2000, // duration of the fade
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
        setShowSplash(false); setFadeIn(true)
        });
    }
  }, [fadeOut]);

  useEffect(() => {
    if (fadeIn) {
        Animated.timing(fadeInAnim, {
          toValue: 1,
          duration: 300, // duration of the fade
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
    }
  }, [fadeIn]);

  useEffect(() => {
    if (user && /*userIsMade &&*/ userData) {
      setFadeIn(true)
    }
  }, [user, /*userIsMade,*/ userData])

  if (initializing) return <SplashScreen/>;
  //onboard or main stack depending on user status
  if (user && /*userIsMade == true &&*/ userData) {
    return (
      <Animated.View style={{flex: 1}}>
      <NavigationContainer theme={theme}>
        <StatusBar
          backgroundColor={theme.colors.background}
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
        />
        <Stack.Navigator
          initialRouteName="CoreApp"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}>
          <Stack.Screen name="CoreApp" component={CoreApp} />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{headerShown: false}}
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
            name="Settings"
            component={Settings}
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
            options={{headerShown: false, animation: 'slide_from_bottom'}}
          />
          <Stack.Screen
            name="StockOrder"
            component={StockOrder}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="EnterMatch"
            component={EnterMatch}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Feed"
            component={Feed}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="CommentPage"
            component={CommentPage}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="CreatePost"
            component={CreatePost}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Menu"
            component={Menu}
            options={{
              headerShown: false,
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
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="CreateList"
            component={CreateList}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="ProfileSearch"
            component={ProfileSearch}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="OtherProfile"
            component={OtherProfile}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="ProfileActivity"
            component={ProfileActivity}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="FollowersFollowing"
            component={FollowersFollowing}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="editProfilePage"
            component={editProfilePage}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="PastMatches"
            component={PastMatches}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="Invitations"
            component={Invitations}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </Animated.View>
    );
  } 
  if (!user) {
    return (
      <NavigationContainer theme={theme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}>
          <Stack.Screen
            name="Onboard1"
            component={Onboard1}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="EmailScreen"
            component={EmailScreen}
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="PasswordScreen"
            component={PasswordScreen}
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="UsernameScreen"
            component={UsernameScreen}
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="SignInScreen"
            component={SignInScreen}
            options={{
              animation: 'fade',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return <SplashScreen/>
  
};

const App = (): React.ReactElement => {
  return (
    <ThemeProvider>
      <DimensionsProvider>
        <StatusBarHeightProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <Provider store={store}>
              <AppContent />
            </Provider>
          </GestureHandlerRootView>
        </StatusBarHeightProvider>
      </DimensionsProvider>
    </ThemeProvider>
  );
};

export default App;
