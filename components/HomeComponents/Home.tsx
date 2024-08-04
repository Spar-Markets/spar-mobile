import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  FlatList,
  StyleSheet,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import ToggleButton from './ToggleButton';
import DiscoverCard from './DiscoverCard';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsInMatchmaking,
  setUserBio,
  setUsername,
} from '../../GlobalDataManagment/userSlice';
import useUserDetails from '../../hooks/useUserDetails';
import GameCard from './GameCard';
import GameCardSkeleton from './GameCardSkeleton';
import { serverUrl, websocketUrl } from '../../constants/global';
import StockCard from '../StockComponents/StockCard';
import {
  Blur,
  BlurMask,
  Canvas,
  Circle,
  Group,
  RadialGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import LinearGradient from 'react-native-linear-gradient';
import {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import HapticFeedback from 'react-native-haptic-feedback';
import CustomActivityIndicator from '../GlobalComponents/CustomActivityIndicator';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase/firebase';
import RNFS from 'react-native-fs';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { setProfileImageUri } from '../../GlobalDataManagment/imageSlice';
import SmallActivityIndicator from '../GlobalComponents/SmallActivityIndicator';
import CreateWatchlistButton from './CreateWatchlistButton';
import WatchlistButton from './WatchlistButton';
import { FAB, Portal, PaperProvider } from 'react-native-paper';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Svg, Circle as SvgCircle } from 'react-native-svg';
import AnimatedRing from '../GlobalComponents/AnimatedRing';
import { setGlobalTickers } from '../../GlobalDataManagment/stockDataSlice';
import { RootState } from '../../GlobalDataManagment/store';
import {
  addMatch,
  setActiveMatches,
} from '../../GlobalDataManagment/activeMatchesSlice';

import { setBalance } from '../../GlobalDataManagment/userSlice';
import { resetChallengedFriend, setChallengedFriend } from '../../GlobalDataManagment/matchmakingSlice';
// import storage from '@react-native-firebase/storage';

const { width } = Dimensions.get('window');

Icon.loadFont();
EntypoIcons.loadFont();
MaterialIcons.loadFont();
MaterialCommunityIcons.loadFont();
FeatherIcon.loadFont();

const Home: React.FC = () => {
  interface MatchData {
    wagerAmt: number;
    user1: {
      userID: string;
      assets: string[];
    };
    user2: {
      userID: string;
      assets: string[];
    };
    createdAt: Date;
    timeframe: number;
    endAt: Date;
    matchType: string;
  }

  interface DrawerState {
    open: boolean;
  }

  // Layout and Style Initialization
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const [searchingForMatch, setSearchingForMatch] = useState(false);
  //const [activeMatches, setActiveMatches] = useState<any>(null);
  const [hasMatches, setHasMatches] = useState(false); // Set this value based on your logic
  const [skillRating, setSkillRating] = useState(0.0);
  //const [username, setUsername] = useState('');
  const [userID, setUserID] = useState('');
  const [watchLists, setWatchLists] = useState<Object[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [gameModeSelected, setGameModeSelected] = useState('Head-to-Head');

  const dispatch = useDispatch();

  const activeMatches = useSelector(
    (state: RootState) => state.activeMatches.activeMatches,
  );

  const user = useSelector((state: any) => state.user);

  const [noMatches, setNoMatches] = useState(false);

  const [wagerSelected, setWagerSelected] = useState<number | null>(10);
  const [timeframeSelected, setTimeFrameSelected] = useState(900);
  const [modeSelected, setModeSelected] = useState('Stock');

  const [activeMatchSummaryMatchID, setActiveMatchSummaryMatchID] =
    useState('');

  const [enteredMatchmakingCheck, setEnteredMatchmakingCheck] = useState(false);

  const isInMatchmaking = useSelector(
    (state: any) => state.user.isInMatchmaking,
  );

  const hasDefaultProfileImage = useSelector(
    (state: RootState) => state.user.hasDefaultProfileImage,
  );

  const challengedFriend = useSelector(
    (state: RootState) => state.matchmaking.challengedFriend
  )

  const balance = useSelector((state: RootState) => state.user.balance);

  useEffect(() => {
    const getGlobalTickers = async () => {
      try {
        const response = await axios.get(serverUrl + '/getTickerList');
        dispatch(setGlobalTickers(response.data));
      } catch (error) {
        console.error('global tickers error', error);
      }
    };
    if (user) {
      console.log('Hello', user);
      getGlobalTickers();
    }
  }, [user]);

  const requestPermissions = async () => {
    if (Platform.OS === 'ios') {
      const photoLibraryPermission = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (photoLibraryPermission !== RESULTS.GRANTED) {
        await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      }

      const cameraPermission = await check(PERMISSIONS.IOS.CAMERA);
      if (cameraPermission !== RESULTS.GRANTED) {
        await request(PERMISSIONS.IOS.CAMERA);
      }
    } else if (Platform.OS === 'android') {
      const readPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );

      const writePermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );

      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      if (
        readPermission !== PermissionsAndroid.RESULTS.GRANTED ||
        writePermission !== PermissionsAndroid.RESULTS.GRANTED ||
        cameraPermission !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.warn('Permissions not granted');
      }
    }
  };

  const fetchProfileImageFromFirebase = async () => {
    if (user.userID) {
      try {
        const imageRef = ref(storage, `profileImages/${user.userID}`);
        const url = await getDownloadURL(imageRef);
        if (url) {
          console.log('Fetched URL from Firebase:', url);
          await AsyncStorage.setItem('profileImgPath', url);
          dispatch(setProfileImageUri(url));
        }
      } catch (error) {
        console.log('No profile set');
        //implement default image logic
      }
    }
  };

  useEffect(() => {
    const getProfilePicture = async () => {
      await requestPermissions();
      if (user.userID) {
        try {
          const profileImagePath = await AsyncStorage.getItem('profileImgPath');
          if (profileImagePath) {
            console.log(
              'Profile image path from AsyncStorage:',
              profileImagePath,
            );
            dispatch(setProfileImageUri(profileImagePath));
          } else {
            await fetchProfileImageFromFirebase();
          }
        } catch (error) {
          console.error('Failed to load profile image path:', error);
        } finally {
          setImageLoading(false);
        }
      }
    };
    getProfilePicture();
  }, [user.userID]);

  const fetchMatchIDs = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      console.log('grant', userID);
      const response = await axios.post(serverUrl + '/getUserMatches', {
        userID,
      });

      console.log('Matches2: ', response);
      console.log('DISPATCHING');
      dispatch(setActiveMatches(response.data));
      console.log('RAHHHH', response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };



  const cancelMatchmaking = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(serverUrl + '/cancelMatchmaking', {
        userID,
      });
      console.log(response);
      dispatch(setIsInMatchmaking(false));
      setSearchingForMatch(false);
      //ws.current!.close();
      //ws.current = null;
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.log(error.response.message);
      }
      console.error('Error in cancelMatchmaking in home.tsx:', error);
    }
  };

  const getIsInMatchMaking = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(serverUrl + '/areTheyMatchmaking', {
        userID,
      });
      console.log(response.data.result);
      if (response.data.result) {
        console.log('User is in matchmaking');
        setSearchingForMatch(true);
        if (!ws.current) {
          setupSocket();
        }
      } else {
        console.log('User is not in matchmaking');
        setSearchingForMatch(false);
      }
    } catch (error) {
      console.error("ERROR in: 'is user matchmaking'");
      console.log(error);
    }
  };

  const cancelAlert = () => {
    Alert.alert('Cancel Matchmaking?', '', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'Yes', onPress: () => cancelMatchmaking() },
    ]);
  };

  const handleDeposit = async () => {
    navigation.push('Feed');
  };

  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    setLoading(true);
    const getUserID = async () => {
      console.log('Getting userID');
      const userID = await AsyncStorage.getItem('userID');
      console.log('In HOME, UserID:', userID);
      setUserID(userID!);
    };
    getUserID();
    getIsInMatchMaking();
    fetchMatchIDs();
  }, []);

  useEffect(() => {
    if (activeMatches) {
      if (activeMatches.length !== 0) {
        console.log('GETTING MATCH DATA!!!!!');
        setNoMatches(false);
        setLoading(false);
      } else {
        setNoMatches(true);
        setLoading(false);
      }
    }
  }, [activeMatches]);

  const animation = useRef(new Animated.Value(0)).current;
  const barAnimation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  const handleToggle = (option: any) => {
    const toValue = option === 'head-to-head' ? 0 : -screenWidth;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const flatListRef = useRef<FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: any }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 30 });

  const profileImageUri = useSelector(
    (state: any) => state.image.profileImageUri,
  );

  const bottomSheetRef = useRef<BottomSheet>(null);
  const infoSheetRef = useRef<BottomSheet>(null);
  const matchSummaryRef = useRef<BottomSheet>(null);
  const matchmakingSheetRef = useRef<BottomSheet>(null);

  const expandBottomSheet = async () => {
    try {
      bottomSheetRef.current?.expand(); // Expand the Bottom Sheet when star is clicked
    } catch {
      console.log('error watching stock');
    }
  };

  const closeBottomSheet = async () => {
    try {
      bottomSheetRef.current?.close(); // Expand the Bottom Sheet when star is clicked
    } catch {
      console.log('error watching stock');
    }
  };

  const expandInfoSheet = async () => {
    try {
      infoSheetRef.current?.expand(); // Expand the Bottom Sheet when star is clicked
    } catch {
      console.log('error watching stock');
    }
  };

  const closeInfoSheet = async () => {
    try {
      infoSheetRef.current?.close(); // Expand the Bottom Sheet when star is clicked
    } catch {
      console.log('error watching stock');
    }
  };

  const expandMatchSummarySheet = async () => {
    try {
      matchSummaryRef.current?.expand(); // Expand the Bottom Sheet when star is clicked
    } catch {
      console.log('error watching stock');
    }
  };

  const closeMatchSummarySheet = async () => {
    try {
      matchSummaryRef.current?.close(); // Expand the Bottom Sheet when star is clicked
    } catch {
      console.log('error watching stock');
    }
  };

  const expandMatchmakingSheet = async () => {
    try {
      matchmakingSheetRef.current?.expand(); // Expand the Bottom Sheet when star is clicked
      setEnteredMatchmakingCheck(false);
    } catch {
      console.log('error watching stock');
    }
  };

  const closeMatchmakingSheet = async () => {
    try {
      matchmakingSheetRef.current?.close(); // Expand the Bottom Sheet when star is clicked
    } catch {
      console.log('error watching stock');
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}>
        <View style={{ backgroundColor: theme.colors.opposite, flex: 1, zIndex: 0 }}></View>
      </BottomSheetBackdrop>
    ),
    [],
  );



  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleInfoChanges = useCallback((index: number) => {
    console.log('handleInfoSheetChanges', index);
  }, []);

  const handleMatchSummaryChanges = useCallback((index: number) => {
    console.log('handleMatchSummarySheetChanges', index);
  }, []);

  const handleMatchmakingChanges = useCallback((index: number) => {
    console.log('handleMatchmakingSheetChanges', index);
  }, []);

  const handleEnterMatchmaking = async (
    wager: number,
    matchLength: number,
    matchType: String,
  ) => {
    console.log('HIT ENTER MATCHMAKING');
    console.log('Balance:', balance);
    console.log('Wager:', wager);

    // balance check
    if (balance == null || wager * 1.1 > balance) {
      Alert.alert('You are broke. Insufficient funds.');
      return;
    }


    //retrieve user's skill rating
    setEnteredMatchmakingCheck(true);
    if (!ws.current) {
      console.log('SETTING UP THE SERVER FOR MATCHMAKING');
      await setupSocket();
      console.log('AFTER SOCKET SETUP', ws.current!.readyState);
    }

    if (!ws.current || ws.current.readyState == 0) {
      console.error('ERROR ON HOME: Websocket not open.');
    }

    console.log(wager);
    console.log(matchLength);
    console.log(matchType);

    const userID = await AsyncStorage.getItem('userID');
    console.log('userID:', userID);

    //Asign current user's values to a player object
    const player = {
      username: user.username,
      userID: userID,
      skillRating: user.skillRating,
      entryFee: wager,
      matchLength: matchLength,
      matchType: matchType,
    };
    //Pass the players object to the database
    console.log('Log' + player);
    try {
      const response = await axios.post(
        serverUrl + '/userToMatchmaking',
        player,
      );
      console.log(response);
    } catch (error) {
      console.log('EnterMatch.tsx error in handleEnterMatchmaking:', error);
    }
    dispatch(setIsInMatchmaking(true));
    closeBottomSheet();
  };

  //websocket stuff

  function uint8ArrayToString(array: any) {
    return array.reduce(
      (data: any, byte: any) => data + String.fromCharCode(byte),
      '',
    );
  }

  const [retries, setRetries] = useState(0);

  const MAX_RETRIES = 5; // Maximum number of retry attempts
  const RETRY_DELAY = 2000; // Delay between retries in milliseconds

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeat = () => {
    if (ws.current) {
      //console.log("SENDING WS HEARTBEAT FROM GAMECARD")
      //console.log("FROM GAME CARD", ws.current)
      const heartbeat = { type: 'heartbeat' };
      ws.current.send(JSON.stringify(heartbeat));
    }
  };

  useEffect(() => {
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // 30 seconds interval

    // Clear the interval when the component unmounts
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  const [responsiveActiveMatches, setResponsiveActiveMatches] = useState<any>();

  useEffect(() => {
    if (activeMatches) {
      console.log('ACTIVE MATCHES INITIAL OR CHANGE:', activeMatches);
    }
  }, [activeMatches]);

  useEffect(() => {
    if (userID) {
      if (!ws.current) {
        setupSocket()
        console.log("SETTING UP THE HOME WEBSOCKET")
      }
    }
  }, [userID])

  //searchingForMatch || isInMatchmaking -----> these conditions == true, open websocket to look for match being created
  const setupSocket = async () => {
    return new Promise((resolve, reject) => {
      console.log('Opening socket with url:', websocketUrl);
      const socket = new WebSocket(websocketUrl);

      ws.current = socket;

      ws.current.onopen = () => {
        console.log(
          `Connected to Matchmaking Websocket, but not ready for messages...`,
        );
        if (ws.current!) {
          console.log(
            `Connection for Matchmaking Websocket is open and ready for messages`,
          );
          // first send match ID
          ws.current!.send(
            JSON.stringify({ type: 'matchmaking', userID: userID }),
          );
        } else {
          console.log('WebSocket is not open');
        }
        resolve(ws.current);
      };

      // WebSocket message handling
      ws.current.onmessage = event => {
        if (event.data == 'Websocket connected successfully') {
          return;
        }

        const message = event.data;

        console.log('Home websocket message received:', message);

        try {
          const JSONMessage = JSON.parse(message);
          // Change stream handling for new matches
          if (JSONMessage.type == 'matchCreated') {
            console.log('JACKSON MATCH WS MESSAGE RECEIVED');
            const newMatch = JSONMessage.newMatch;
            // do logic to display new match
            dispatch(
              addMatch({ matchID: newMatch.matchID, endAt: newMatch.endAt }),
            );
            setNoMatches(false);
            dispatch(setIsInMatchmaking(false));
            setSearchingForMatch(false);
            //ws.current!.close();
            //ws.current = null;
            console.log('MATCH ADDED:', newMatch.matchID);
            if (balance) {
              dispatch(setBalance(balance - newMatch.wagerAmt));
            }
          } else if (
            JSONMessage.type == 'updateWinnings' &&
            JSONMessage[userID]
          ) {
            dispatch(setBalance(balance + JSONMessage[userID]));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.current.onerror = error => {
        console.log('WebSocket error:', error || JSON.stringify(error));
        if (retries < MAX_RETRIES) {
          console.log(`Retrying connection (${retries + 1}/${MAX_RETRIES})...`);
          setRetries(retries + 1);
          setTimeout(() => {
            setupSocket();
          }, RETRY_DELAY);
        } else {
          console.error(
            'Maximum retry attempts reached. Unable to connect to WebSocket.',
          );
          reject(new Error('Websocket error. Maximum retry attempts reached.'));
        }
      };

      ws.current.onclose = () => {
        console.log(`Connection to GameCard Asset Websocket closed`);
        reject(new Error('Websocket closed before being opened.'));
      };
    });
  };

  const hexToRGBA = (hex: any, alpha = 1) => {
    let r = 0,
      g = 0,
      b = 0;

    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');

    // Parse r, g, b values
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex[0] + hex[1], 16);
      g = parseInt(hex[2] + hex[3], 16);
      b = parseInt(hex[4] + hex[5], 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const ruleMessage = (title: string, message: string) => (
    <View>
      <Text
        style={{
          color: theme.colors.text,
          fontFamily: 'InterTight-Bold',
          fontSize: 15,
        }}>
        {title}
      </Text>
      <Text
        style={{
          color: theme.colors.secondaryText,
          fontFamily: 'InterTight-Semibold',
        }}
        adjustsFontSizeToFit
        numberOfLines={3}>
        {message}
      </Text>
    </View>
  );

  const [showAdditionalButtons, setShowAdditionalButtons] = useState(false);

  const translateY = useRef(new Animated.Value(50)).current; // Start slightly below the button
  const opacity = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const toggleAdditionalButtons = () => {
    if (showAdditionalButtons) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 50,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => setShowAdditionalButtons(false));
    } else {
      setShowAdditionalButtons(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const interpolatedOpacity = opacityAnim.interpolate({
    inputRange: [0, 0.8],
    outputRange: [0, 0.8],
  });

  const [activeGameModeColor, setActiveGameModeColor] = useState(
    theme.colors.accent2,
  );

  const GameModeButton = (props: any) => {
    const handlePress = () => {
      if (props.text == 'Head-to-Head') {
        setActiveGameModeColor(theme.colors.accent2);
      } else if (props.text == 'Tournaments') {
        setActiveGameModeColor(theme.colors.accent3);
      }
      setGameModeSelected(props.text);
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[
          gameModeSelected == props.text ? {
            backgroundColor: activeGameModeColor,
          } : { backgroundColor: theme.colors.secondary },
          {
            paddingHorizontal: 15,
            borderRadius: 50,
            alignItems: 'center',
            flexDirection: 'row',
            gap: 5,
            marginRight: 10
          },
        ]}>
        <Text
          style={{
            color: gameModeSelected == props.text ? '#fff' : theme.colors.text,
            fontFamily: 'InterTight-Black',
          }}>
          {props.text}
        </Text>
      </TouchableOpacity>
    );
  };


  const [selectedStart, setSelectedStart] = useState("")

  const handleInviteFriend = async (challengerUserID: string, invitedUserID: string, wager: number, timeframe: number, mode: string) => {
    try {
      const invitation = {
        challengerUserID,
        invitedUserID,
        wager,
        timeframe,
        mode,
        type: "HTH",
      }
      const response = await axios.post(serverUrl + "/challengeFriend", invitation)
      if (response.status == 200) {
        //implment showing little alert to say inviitation sent
        console.log("Invitation sent to", challengedFriend.userID)
        closeBottomSheet()
      } else {
        console.error("Error sending invitation to friend:", response)
      }
    } catch (error) {
      console.error("Error sending invitation to friend");
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity>
            <Icon
              name="search"
              style={[styles.icon, { marginRight: 5 }]}
              size={24}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
            <Icon name="bars" style={styles.icon} size={24} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <CustomActivityIndicator size={60} color={theme.colors.text} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Menu')}
            style={{ justifyContent: 'center', alignItems: 'center' }}>
            {/*<Image
                    style={{width: 16, height: 30}}
                    source={require('../../assets/images/logo.png')}
                  />*/}
            <Text
              style={{
                color: theme.colors.text,
                fontFamily: 'InterTight-Bold',
                fontSize: 25,
              }}>
              Portfolio
            </Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}></View>

          <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <View
              style={{
                backgroundColor: hexToRGBA(theme.colors.secondary, 0.3),
                height: 35,
                borderRadius: 50,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.secondary,
              }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'InterTight-Black',
                  paddingRight: 10,
                  paddingLeft: 15,
                }}>
                ${user.balance.toFixed(2)}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: activeGameModeColor,
                  borderRadius: 50,
                  padding: 4,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 3,
                }}>
                <MaterialIcons name="add" color={"#fff"} size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/*<View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {hasDefaultProfileImage && Image && (
                  <Image
                    style={[
                      styles.profilePic,
                      {borderWidth: 2, borderColor: theme.colors.text},
                    ]}
                    source={profileImageUri as any}
                  />
                )}
                {!hasDefaultProfileImage && Image && (
                  <Image
                    style={[
                      styles.profilePic,
                      {borderWidth: 2, borderColor: theme.colors.text},
                    ]}
                    source={{uri: profileImageUri} as any}
                  />
                )}
              </View>*/}
        </View>

        <View style={{ height: 35, marginTop: 10 }}>
          <ScrollView
            horizontal
            style={{ width: width }}
            showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
              <GameModeButton text={'Head-to-Head'} />
              <GameModeButton text={'Tournaments'} />
            </View>
          </ScrollView>
        </View>
        {gameModeSelected === 'Head-to-Head' && (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                {noMatches && !searchingForMatch && !isInMatchmaking && (
                  <View
                    style={{
                      width: width,
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    {/*<Image source={require("../../assets/images/empty.png")} style={{width: 200, height: 200}}></Image>*/}
                    <MaterialCommunityIcons
                      name="square-off-outline"
                      color={theme.colors.text}
                      size={40}
                    />
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontFamily: 'InterTight-Black',
                        fontSize: 16,
                      }}>
                      NO ACTIVE MATCHES
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.secondaryText,
                        fontFamily: 'InterTight-Black',
                        fontSize: 13,
                        textAlign: 'center',
                        marginHorizontal: 50,
                      }}>
                      There are no active matches, start a match or view your
                      match history.
                    </Text>
                  </View>
                )}

                {!noMatches && (
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={activeMatches} // Directly use activeMatches array
                    renderItem={({ item, index }) => {
                      return (
                        item && (
                          <View style={{ width, height: '100%' }}>
                            <GameCard
                              userID={userID}
                              matchID={item.matchID} // Access id directly from the item
                              expandMatchSummarySheet={expandMatchSummarySheet}
                              setActiveMatchSummaryMatchID={
                                setActiveMatchSummaryMatchID
                              }
                              profileImageUri={profileImageUri}
                            />
                          </View>
                        )
                      );
                    }}
                    keyExtractor={(item, index) => `${item.matchID}-${index}`} // Ensure unique key
                    initialNumToRender={5}
                    pagingEnabled
                    snapToInterval={width}
                    ref={flatListRef}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    onViewableItemsChanged={onViewRef.current}
                    viewabilityConfig={viewConfigRef.current}
                  />
                )}
              </View>
              {activeMatches.length > 1 && (
                <View style={styles.indicatorContainer}>
                  {activeMatches.map((match, index) => {
                    return (
                      <View
                        key={match.matchID} // Use id as the key
                        style={[
                          styles.indicator,
                          currentIndex === index
                            ? styles.activeIndicator
                            : styles.inactiveIndicator,
                        ]}
                      />
                    );
                  })}
                </View>
              )}
            </View>

            {
              <>
                {showAdditionalButtons && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      right: 0,
                      left: 0,
                      backgroundColor: theme.colors.background,

                      opacity: interpolatedOpacity,
                    }}>
                    <TouchableOpacity
                      onPress={() => toggleAdditionalButtons()}
                      style={{ flex: 1 }}
                    />
                  </Animated.View>
                )}
                <View>
                  {searchingForMatch || isInMatchmaking ? (
                    <View
                      style={{
                        backgroundColor: theme.colors.secondary,
                        width: width - 40,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 20,
                        borderRadius: 20,
                        marginHorizontal: 20,
                        paddingHorizontal: 20,
                      }}>
                      <SmallActivityIndicator color={theme.colors.text} />
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontFamily: 'InterTight-Black',
                          fontSize: 15,
                          marginLeft: 10,
                        }}>
                        Searching for Match
                      </Text>
                      <View style={{ flex: 1 }} />
                      <TouchableOpacity
                        onPress={cancelAlert}
                        style={{
                          backgroundColor: theme.colors.stockDownAccent,
                          borderRadius: 5,
                          padding: 10,
                        }}>
                        <MaterialIcons
                          name="close"
                          size={24}
                          color={theme.colors.secondary}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      {showAdditionalButtons && (
                        <Animated.View
                          style={[
                            {
                              position: 'absolute',
                              right: 0,
                              bottom: 60,
                              zIndex: 0,
                            },
                            { transform: [{ translateY }], opacity },
                          ]}>
                          {/* Add your additional buttons here */}
                          <TouchableOpacity
                            onPress={() => {
                              expandBottomSheet();
                              toggleAdditionalButtons();
                            }}
                            style={[
                              styles.addButton,
                              {
                                backgroundColor: theme.colors.stockUpAccent,
                                flexDirection: 'row',
                              },
                            ]}>
                            <Text
                              style={{
                                color: theme.colors.background,
                                fontFamily: 'InterTight-Black',
                              }}>
                              Stock
                            </Text>
                          </TouchableOpacity>
                          <View
                            style={[
                              styles.addButton,
                              {
                                gap: 2,
                                backgroundColor: theme.colors.primary,
                                flexDirection: 'row',
                              },
                            ]}>
                            <MaterialIcons
                              name="construction"
                              size={24}
                              color={theme.colors.tertiary}
                            />
                            <Text
                              style={{
                                color: theme.colors.tertiary,
                                fontFamily: 'InterTight-Black',
                              }}>
                              Crypto
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.addButton,
                              {
                                gap: 2,
                                backgroundColor: theme.colors.primary,
                                flexDirection: 'row',
                              },
                            ]}>
                            <MaterialIcons
                              name="construction"
                              size={24}
                              color={theme.colors.tertiary}
                            />
                            <Text
                              style={{
                                color: theme.colors.tertiary,
                                fontFamily: 'InterTight-Black',
                              }}>
                              Options
                            </Text>
                          </View>
                          {/* Add more buttons as needed */}
                        </Animated.View>
                      )}
                      {
                        <View
                          style={{
                            flexDirection: 'row',
                            backgroundColor: 'transparent',
                            alignItems: 'center',
                            marginHorizontal: 20,
                            gap: 5,
                          }}>
                          {/*<TouchableOpacity onPress={() => navigation.navigate("PastMatches")} style={{height: 40, borderRadius: 5, backgroundColor: theme.colors.opposite, width: (width-45)*0.12, justifyContent: 'center', alignItems:'center', marginRight: 10}}>
                    <EntypoIcons name="back-in-time" size={24} color={theme.colors.background}/>
                </TouchableOpacity>*/}
                          <TouchableOpacity onPress={() => navigation.navigate("Invitations")} style={{ backgroundColor: theme.colors.accent2, height: 50, width: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 50 }}>
                            <FeatherIcon name="inbox" color={"#fff"} size={24} />
                            {/*<View style={{backgroundColor: theme.colors.stockDownAccent, width: 20, height: 20, borderRadius: 50, position: 'absolute', right: -2, top: -2, justifyContent: 'center', alignItems: 'center',borderWidth: 2, borderColor: theme.colors.background}}>
                                <Text style={{color: theme.colors.text, fontFamily: "InterTight-Bold", fontSize: 12}}>1</Text>
                              </View>*/}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.addButton,
                              {
                                backgroundColor: theme.colors.accent2,
                                zIndex: 1,
                                borderColor: theme.colors.accent2,
                                borderWidth: 2,
                              },
                            ]}
                            onPress={
                              expandMatchmakingSheet /*() => {toggleAdditionalButtons()}*/
                            }>
                            <Text
                              style={{
                                color: '#fff',
                                fontFamily: 'InterTight-Black',
                                fontSize: 18,
                              }}>
                              Start a Match
                            </Text>
                          </TouchableOpacity>
                        </View>
                      }
                    </View>
                  )}
                </View>
              </>
            }
          </View>
        )}

        {gameModeSelected === 'Tournaments' && (
          <View style={{ flex: 1 }}>
            <View
              style={{
                width: width,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
              }}>
              {/*<Image source={require("../../assets/images/empty.png")} style={{width: 200, height: 200}}></Image>*/}
              <MaterialIcons
                name="construction"
                color={theme.colors.text}
                size={40}
              />
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'InterTight-Black',
                  fontSize: 16,
                }}>
                WE ARE CURRENTLY BUILDING
              </Text>
              <Text
                style={{
                  color: theme.colors.secondaryText,
                  fontFamily: 'InterTight-Black',
                  fontSize: 13,
                  textAlign: 'center',
                  marginHorizontal: 50,
                }}>
                Tournaments aren't ready yet, but we'll let you know when they
                are.
              </Text>
            </View>
          </View>
        )}




        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={selectedStart == "Stock" ? [470] : challengedFriend.userID == null ? [520] : [520]}
          index={-1}
          enablePanDownToClose
          onChange={handleSheetChanges}
          backgroundStyle={{ backgroundColor: theme.colors.background }}
          handleIndicatorStyle={{ backgroundColor: theme.colors.tertiary }}
          backdropComponent={renderBackdrop}
          onClose={() => {
            if (challengedFriend.userID) {
              dispatch(setChallengedFriend({ userID: null, username: null }))
            }
          }}
        >
          <BottomSheetView style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 20 }}>
                {selectedStart == "Stock" && "Stock"}
                {selectedStart == "Friend" && "Challenge Friend"}
              </Text>
              <View style={{ flex: 1 }}></View>

            </View>
            <View>
              {selectedStart == "Friend" &&
                <>
                  {challengedFriend.userID == null ?
                    <View style={{ marginHorizontal: 20, marginTop: 10 }}>
                      <TouchableOpacity onPress={() => navigation.navigate('FollowersFollowing', { userID: user.userID, username: user.username })} style={{ height: 70, gap: 5, paddingHorizontal: 20, paddingVertical: 20, flexDirection: 'row', borderRadius: 10, backgroundColor: theme.colors.accent2, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18 }}>Select a Friend</Text>
                      </TouchableOpacity>
                    </View>
                    :
                    <View style={{ marginHorizontal: 20, marginTop: 10 }}>
                      <TouchableOpacity style={{ gap: 5, paddingHorizontal: 20, paddingVertical: 20, height: 70, flexDirection: 'row', borderRadius: 10, backgroundColor: theme.colors.secondary, alignItems: 'center' }}>
                        {challengedFriend.hasDefaultProfileImage != null && <Image style={{ height: 35, width: 35, borderRadius: 100 }} source={challengedFriend.hasDefaultProfileImage == true ? challengedFriend.profileImageUri as any : { uri: challengedFriend.profileImageUri }} />}
                        <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 24, marginLeft: 10 }}>{challengedFriend.username}</Text>
                        <View style={{ flex: 1 }}></View>
                        <TouchableOpacity onPress={() => dispatch(resetChallengedFriend())}>
                          <Icon name="close" color={theme.colors.stockDownAccent} size={24} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>
                  }
                </>
              }


              <View
                style={{
                  backgroundColor: theme.colors.background,
                  marginHorizontal: 10,
                  marginTop: 10,
                  borderRadius: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    marginVertical: 10,
                    marginTop: 10,
                  }}>
                  <Text style={styles.matchmakingCategoryText}>
                    Select Wager
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 10,
                    marginBottom: 10,
                    flexDirection: 'row',
                    gap: 5,
                  }}>
                  {[
                    { amount: 0, label: 'Free' },
                    { amount: 5, label: '$5' },
                    { amount: 10, label: '$10' },
                    { amount: 25, label: '$25' },
                  ].map((wager, index) => (
                    <TouchableOpacity
                      key={wager.amount}
                      style={[
                        styles.matchmakingWagerBtn,
                        {
                          backgroundColor: theme.colors.secondary,
                          borderColor: theme.colors.secondary,
                        },
                        wagerSelected == wager.amount && {
                          borderColor: theme.colors.text,
                          borderWidth: 2,
                        },
                        index === 5 && { marginRight: 40 },
                      ]}
                      onPress={() => setWagerSelected(wager.amount)}>
                      <Text style={styles.matchmakingWagerTxt}>
                        {wager.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.background,
                marginHorizontal: 10,
                marginTop: 10,
                borderRadius: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  marginVertical: 10,
                  marginTop: 10,
                }}>
                <Text style={styles.matchmakingCategoryText}>
                  Select Timeframe
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  marginBottom: 10,
                  flexDirection: 'row',
                  gap: 5,
                }}>
                {[
                  { amount: 900, label: '15m' },
                  { amount: 86400, label: '1d' },
                  { amount: 604800, label: '1w' },
                ].map((timeframe, index) => (
                  <TouchableOpacity
                    key={timeframe.amount}
                    style={[
                      styles.matchmakingWagerBtn,
                      {
                        backgroundColor: theme.colors.secondary,
                        borderColor: theme.colors.secondary,
                      },
                      timeframeSelected == timeframe.amount && {
                        borderColor: theme.colors.text,
                        borderWidth: 2,
                      },
                      index === 5 && { marginRight: 40 },
                    ]}
                    onPress={() => setTimeFrameSelected(timeframe.amount)}>
                    <Text style={styles.matchmakingWagerTxt}>
                      {timeframe.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: theme.colors.tertiary,
                marginHorizontal: 20,
                marginTop: 20,
              }}
            />
            <View
              style={{
                marginTop: 20,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={expandInfoSheet}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontFamily: 'InterTight-Bold',
                      fontSize: 20,
                    }}>
                    Cost
                  </Text>
                  <MaterialIcons
                    name={'info'}
                    size={24}
                    color={theme.colors.secondaryText}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontFamily: 'InterTight-Black',
                    fontSize: 28,
                  }}>
                  ${(1.1 * wagerSelected!).toFixed(2)}
                </Text>
              </View>
              <View style={{ marginHorizontal: 20 }}>
                <Icon name="arrow-right" size={24} color={theme.colors.text} />
              </View>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Text
                    style={{

                      color: theme.colors.text,
                      fontFamily: 'InterTight-Black',
                      fontSize: 20,

                    }}>
                    Payout
                  </Text>
                </View>
                <Text
                  style={{
                    color: theme.colors.accent,
                    fontFamily: 'InterTight-Black',
                    fontSize: 28,
                  }}>
                  {' '}
                  ${(2 * wagerSelected!).toFixed(2)}
                </Text>
              </View>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: theme.colors.tertiary,
                marginHorizontal: 20,
                marginTop: 20,
              }}
            />

            <View
              style={{
                width: width,
                justifyContent: 'center',
                marginVertical: 20,
              }}>
              {wagerSelected != null &&
                timeframeSelected != 0 &&
                modeSelected != '' &&
                !enteredMatchmakingCheck ? (
                <>
                  {selectedStart != "Friend" ?
                    <TouchableOpacity
                      onPress={() =>
                        handleEnterMatchmaking(
                          wagerSelected,
                          timeframeSelected,
                          modeSelected,
                        )
                      }
                      style={{
                        marginHorizontal: 20,
                        height: 50,
                        backgroundColor: theme.colors.accent2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,
                      }}>
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontFamily: 'InterTight-Bold',
                          fontSize: 18,
                        }}>
                        Enter Matchmaking
                      </Text>
                    </TouchableOpacity> :
                    <>
                      {challengedFriend.userID ?
                        <TouchableOpacity
                          onPress={async () =>
                            /*handleEnterMatchmaking(
                              wagerSelected,
                              timeframeSelected,
                              modeSelected,
                            )*/
                            await handleInviteFriend(user.userID, challengedFriend.userID!, wagerSelected, timeframeSelected, modeSelected)
                          }
                          style={{
                            marginHorizontal: 20,
                            height: 50,
                            backgroundColor: theme.colors.accent2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                          }}>
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontFamily: 'InterTight-Bold',
                              fontSize: 18,
                            }}>
                            Invite {challengedFriend.username}
                          </Text>
                        </TouchableOpacity> :
                        <View

                          style={{
                            marginHorizontal: 20,
                            height: 50,
                            backgroundColor: theme.colors.tertiary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                          }}>
                          <Text
                            style={{
                              color: theme.colors.primary,
                              fontFamily: 'InterTight-Bold',
                              fontSize: 18,
                            }}>
                            Select a Friend
                          </Text>
                        </View>}
                    </>
                  }
                </>
              ) : (
                <View
                  style={{
                    marginHorizontal: 20,
                    height: 50,
                    backgroundColor: theme.colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                  }}>
                  <Text
                    style={{
                      color: theme.colors.tertiary,
                      fontFamily: 'InterTight-Bold',
                      fontSize: 18,
                    }}>
                    Enter Matchmaking
                  </Text>
                </View>
              )}
            </View>
          </BottomSheetView>
        </BottomSheet>
        <BottomSheet
          ref={infoSheetRef}
          snapPoints={[325]}
          index={-1}
          enablePanDownToClose
          onChange={handleInfoChanges}
          backgroundStyle={{ backgroundColor: theme.colors.background }}
          handleIndicatorStyle={{ backgroundColor: theme.colors.tertiary }}
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={{ flex: 1 }}>
            <View style={{ gap: 10, marginHorizontal: 20 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'InterTight-Bold',
                  fontSize: 20,
                }}>
                Match Rules
              </Text>
              {ruleMessage(
                'Details',
                'With $100,000 in simulated buying power, trade stocks and achieve a greater return than your opponent to win.',
              )}
              {ruleMessage(
                'Entry Fee',
                'The prize pool is twice the wager collected. We charge a 10% entry fee on the wager selected.',
              )}
              {ruleMessage(
                'Matchmaking',
                `If you aren’t matched up or you cancel matchmaking before a match begins, your $${wagerSelected} will be credited back to your account.`,
              )}
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: theme.colors.tertiary,
                marginHorizontal: 20,
                marginTop: 20,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                marginHorizontal: 20,
                marginTop: 20,
              }}>
              <Icon name="dollar" size={15} color={theme.colors.text} />
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'InterTight-Bold',
                  fontSize: 15,
                }}>
                Payout if Win
              </Text>
              <View style={{ flex: 1 }}></View>
              <Text
                style={{
                  color: theme.colors.accent,
                  fontFamily: 'InterTight-Bold',
                  fontSize: 15,
                }}>
                ${(2 * wagerSelected!).toFixed(2)}
              </Text>
            </View>
          </BottomSheetView>
        </BottomSheet>
        {/*END OF MATCH RESULTS*/}
        <BottomSheet
          ref={matchSummaryRef}
          snapPoints={['90%']}
          index={-1}
          enablePanDownToClose
          onChange={handleMatchSummaryChanges}
          backgroundStyle={{ backgroundColor: theme.colors.background }}
          handleIndicatorStyle={{ backgroundColor: theme.colors.tertiary }}
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={{ flex: 1 }}>
            <View
              style={{
                gap: 10,
                marginHorizontal: 20,
                alignItems: 'center',
                flex: 1,
              }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'Intertight-Bold',
                  fontSize: 20,
                }}>
                Match Summary
              </Text>
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'Intertight-Bold',
                  fontSize: 12,
                }}>
                {activeMatchSummaryMatchID}
              </Text>
            </View>
          </BottomSheetView>
        </BottomSheet>

        <BottomSheet
          ref={matchmakingSheetRef}
          snapPoints={[360]}
          index={-1}
          enablePanDownToClose
          onChange={handleMatchmakingChanges}
          backgroundStyle={{ backgroundColor: theme.colors.background }}
          handleIndicatorStyle={{ backgroundColor: theme.colors.tertiary }}
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={{ flex: 1 }}>
            {!(isInMatchmaking || searchingForMatch) ? (
              <View style={{ gap: 10, flex: 1 }}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontFamily: 'Intertight-Bold',
                    fontSize: 20,
                    paddingHorizontal: 20,
                  }}>
                  Select a Mode
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    expandBottomSheet();
                    closeMatchmakingSheet();
                    setSelectedStart('Stock');
                  }}
                  style={{
                    alignItems: 'center',
                    gap: 10,
                    width: width,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    height: 60,
                  }}>
                  <View
                    style={{
                      backgroundColor: theme.colors.primary,
                      height: '100%',
                      aspectRatio: 1,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: theme.colors.tertiary,
                    }}>
                    <EntypoIcons
                      name="line-graph"
                      size={24}
                      color={theme.colors.text}
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        color: theme.colors.stockUpAccent,
                        fontFamily: 'InterTight-Black',
                        fontSize: 20,
                      }}>
                      Stock
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.secondaryText,
                        fontFamily: 'InterTight-Black',
                        fontSize: 11,
                      }}>
                      Skill-based matchmaking. Trade stocks only
                    </Text>
                  </View>
                </TouchableOpacity>
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.primary,
                    width: width - 40,
                    marginHorizontal: 20,
                  }}></View>
                <TouchableOpacity
                  onPress={() => {
                    expandBottomSheet();
                    closeMatchmakingSheet();
                    setSelectedStart('Friend');
                  }}
                  style={{
                    alignItems: 'center',
                    gap: 10,
                    width: width,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    height: 60,
                  }}>
                  <View
                    style={{
                      backgroundColor: theme.colors.primary,
                      height: '100%',
                      aspectRatio: 1,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: theme.colors.tertiary,
                    }}>
                    <FeatherIcon
                      name="user"
                      size={24}
                      color={theme.colors.text}
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        color: theme.colors.stockUpAccent,
                        fontFamily: 'InterTight-Black',
                        fontSize: 20,
                      }}>
                      Challenge a Friend
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.secondaryText,
                        fontFamily: 'InterTight-Black',
                        fontSize: 11,
                      }}>
                      Play with a Friend. Trade stocks only
                    </Text>
                  </View>
                </TouchableOpacity>
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.primary,
                    width: width - 40,
                    marginHorizontal: 20,
                  }}></View>
                <View
                  style={{
                    alignItems: 'center',
                    gap: 10,
                    width: width,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    height: 60,
                  }}>
                  <MaterialIcons
                    name="construction"
                    size={40}
                    color={theme.colors.tertiary}
                  />
                  <View>
                    <Text
                      style={{
                        color: theme.colors.tertiary,
                        fontFamily: 'InterTight-Black',
                        fontSize: 20,
                      }}>
                      Crypto
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.tertiary,
                        fontFamily: 'InterTight-Black',
                        fontSize: 11,
                      }}>
                      Trade cryptocurrencies only
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.primary,
                    width: width - 40,
                    marginHorizontal: 20,
                  }}></View>
                <View
                  style={{
                    alignItems: 'center',
                    gap: 10,
                    width: width,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    height: 60,
                  }}>
                  <MaterialIcons
                    name="construction"
                    size={40}
                    color={theme.colors.tertiary}
                  />
                  <View>
                    <Text
                      style={{
                        color: theme.colors.tertiary,
                        fontFamily: 'InterTight-Black',
                        fontSize: 20,
                      }}>
                      Options
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.tertiary,
                        fontFamily: 'InterTight-Black',
                        fontSize: 11,
                      }}>
                      Trade option contracts only
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View></View>
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </View>
  );
};

export default Home;
