import React, {useState, useEffect, useRef, useCallback} from 'react';
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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import ToggleButton from './ToggleButton';
import DiscoverCard from './DiscoverCard';
import {useDispatch, useSelector} from 'react-redux';
import {
  setIsInMatchmaking,
  setUserBio,
  setUsername,
} from '../../GlobalDataManagment/userSlice';
import useUserDetails from '../../hooks/useUserDetails';
import GameCard from './GameCard';
import GameCardSkeleton from './GameCardSkeleton';
import {serverUrl, websocketUrl} from '../../constants/global';
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
import {getDownloadURL, ref} from 'firebase/storage';
import {storage} from '../../firebase/firebase';
import RNFS from 'react-native-fs';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import {setProfileImageUri} from '../../GlobalDataManagment/imageSlice';
import SmallActivityIndicator from '../GlobalComponents/SmallActivityIndicator';
import CreateWatchlistButton from './CreateWatchlistButton';
import WatchlistButton from './WatchlistButton';
import {FAB, Portal, PaperProvider} from 'react-native-paper';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {Svg, Circle as SvgCircle} from 'react-native-svg';
import AnimatedRing from '../GlobalComponents/AnimatedRing';
import {setGlobalTickers} from '../../GlobalDataManagment/stockDataSlice';
import {RootState} from '../../GlobalDataManagment/store';
const {width} = Dimensions.get('window');

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
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createHomeStyles(theme, width);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const [balance, setBalance] = useState('0.00');
  const [searchingForMatch, setSearchingForMatch] = useState(false);
  const [activeMatches, setActiveMatches] = useState<any>(null);
  const [hasMatches, setHasMatches] = useState(false); // Set this value based on your logic
  const [skillRating, setSkillRating] = useState(0.0);
  //const [username, setUsername] = useState('');
  const [userID, setUserID] = useState('');
  const [watchLists, setWatchLists] = useState<Object[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [gameModeSelected, setGameModeSelected] = useState('Head-to-Head');

  const dispatch = useDispatch();
  const {userData} = useUserDetails();

  const [noMatches, setNoMatches] = useState(false);

  const [wagerSelected, setWagerSelected] = useState<number | null>(10);
  const [timeframeSelected, setTimeFrameSelected] = useState(900);
  const [modeSelected, setModeSelected] = useState('Stock');

  const [activeMatchSummaryMatchID, setActiveMatchSummaryMatchID] =
    useState('');

  const isInMatchmaking = useSelector(
    (state: any) => state.user.isInMatchmaking,
  );

  const hasDefaultProfileImage = useSelector(
    (state: RootState) => state.user.hasDefaultProfileImage,
  );

  useEffect(() => {
    const getGlobalTickers = async () => {
      try {
        const response = await axios.get(serverUrl + '/getTickerList');
        dispatch(setGlobalTickers(response.data));
      } catch (error) {
        console.error('global tickers error', error);
      }
    };
    if (userData) {
      dispatch(setUsername(userData.username));
      dispatch(setUserBio(userData.bio));
      getGlobalTickers();
    }
  }, [userData]);

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
    if (userData?.userID) {
      try {
        const imageRef = ref(storage, `profileImages/${userData?.userID}`);
        const url = await getDownloadURL(imageRef);
        if (url) {
          console.log('Fetched URL from Firebase:', url);
          await AsyncStorage.setItem('customProfileImgPath', url);
          dispatch(setProfileImageUri(url));
        }
      } catch (error) {
        console.log('No profile set');
        //implement default image logic
      }
    }
  };

  // useEffect(() => {
  //   const getProfilePicture = async () => {
  //     await requestPermissions();
  //     if (userData?.userID) {
  //       try {
  //         const profileImagePath = await AsyncStorage.getItem(
  //           'customProfileImgPath',
  //         );
  //         if (profileImagePath) {
  //           console.log(
  //             'Profile image path from AsyncStorage:',
  //             profileImagePath,
  //           );
  //           dispatch(setProfileImageUri(profileImagePath));
  //         } else {
  //           await fetchProfileImageFromFirebase();
  //         }
  //       } catch (error) {
  //         console.error('Failed to load profile image path:', error);
  //       } finally {
  //         setImageLoading(false);
  //       }
  //     }
  //   };
  //   getProfilePicture();
  // }, [userData?.userID]);

  const fetchMatchIDs = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(serverUrl + '/getUserMatches', {
        userID,
      });
      console.log('Matches1: ', response.data);
      setActiveMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  /*const getMatchData = async () => {
    try {
      console.log(`Server Url: ${process.env.SERVER_URL}`);
      console.log('getmatchdata', activeMatches);
      const md: MatchData[] = [];
      for (const id of activeMatches) {
        const matchDataResponse = await axios.post(
          serverUrl + '/getMatchData',
          {matchID: id},
        );
        md.push(matchDataResponse.data);
      }
      setMatchData(md);
      setLoading(false);
      console.log('SET MATCH DATA PAGE SHOULD NOW LOAD');
    } catch (error) {
      console.error('in get match data error' + error);
    }
  };*/

  const cancelMatchmaking = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(serverUrl + '/cancelMatchmaking', {
        userID,
      });
      console.log(response);
      dispatch(setIsInMatchmaking(false));
      setSearchingForMatch(false);
      ws.current!.close();
      ws.current = null;
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
      {text: 'Yes', onPress: () => cancelMatchmaking()},
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

  const onViewRef = useRef(({viewableItems}: {viewableItems: any}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  });

  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 30});

  const profileImageUri = useSelector(
    (state: any) => state.image.profileImageUri,
  );

  const bottomSheetRef = useRef<BottomSheet>(null);
  const infoSheetRef = useRef<BottomSheet>(null);
  const matchSummaryRef = useRef<BottomSheet>(null);

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

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.8}
      />
    ),
    [],
  );

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleInfoChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleMatchSummaryChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleEnterMatchmaking = async (
    wager: number,
    matchLength: number,
    matchType: String,
  ) => {
    //retrieve user's skill rating
    if (!ws.current) {
      console.log('SETTING UP THE SERVER FOR MATCHMAKING');
      setupSocket();
    }

    console.log(wager);
    console.log(matchLength);
    console.log(matchType);

    const userID = await AsyncStorage.getItem('userID');
    console.log('userID:', userID);

    //Asign current user's values to a player object
    const player = {
      username: userData?.username,
      userID: userID,
      skillRating: userData?.skillRating,
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

  //searchingForMatch || isInMatchmaking -----> these conditions == true, open websocket to look for match being created
  const setupSocket = async () => {
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
        ws.current!.send(JSON.stringify({type: 'matchmaking', userID: userID}));
      } else {
        console.log('WebSocket is not open');
      }
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
          const newMatch = JSONMessage.newMatch;
          // do logic to display new match
          activeMatches.push(newMatch.matchID);
          setNoMatches(false);
          dispatch(setIsInMatchmaking(false));
          setSearchingForMatch(false);
          ws.current!.close();
          ws.current = null;
          console.log('MATCH ADDED:', newMatch.matchID);
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
      }
    };

    ws.current.onclose = () => {
      console.log(`Connection to GameCard Asset Websocket closed`);
    };
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

  const GameModeButton = (props: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setGameModeSelected(props.text);
        }}
        style={[
          gameModeSelected == props.text && {
            backgroundColor: theme.colors.accent2,
          },
          {
            paddingHorizontal: 20,
            borderRadius: 5,
            alignItems: 'center',
            flexDirection: 'row',
            gap: 5,
          },
        ]}>
        <MaterialCommunityIcons
          name={props.icon}
          color={gameModeSelected == props.text ? '#fff' : theme.colors.text}
          size={20}
        />
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flex: 1}} />
          <TouchableOpacity>
            <Icon
              name="search"
              style={[styles.icon, {marginRight: 5}]}
              size={24}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
            <Icon name="bars" style={styles.icon} size={24} />
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <CustomActivityIndicator size={60} color={theme.colors.text} />
        </View>
      </View>
    );
  }

  return (
    <View style={{backgroundColor: theme.colors.background, flex: 1}}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Menu')}
            style={{justifyContent: 'center', alignItems: 'center'}}>
            <Image
              style={{width: 16, height: 30}}
              source={require('../../assets/images/logo.png')}
            />
          </TouchableOpacity>

          <View style={{flex: 1}}></View>

          <View style={{justifyContent: 'center', flexDirection: 'row'}}>
            <View
              style={{
                backgroundColor: theme.colors.primary,
                height: 35,
                borderWidth: 1,
                borderColor: theme.colors.secondary,
                borderRadius: 5,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'InterTight-Black',
                  paddingHorizontal: 10,
                }}>
                ${userData?.balance.toFixed(2)}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.accent2,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: theme.colors.accent2,
                  height: 35,
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: '#fff', fontFamily: 'InterTight-Black'}}>
                  Deposit
                </Text>
                {/*<MaterialCommunityIcons name="wallet" color={theme.colors.background} size={20}/>*/}
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.tertiary,
              borderRadius: 5,
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
          </View>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.primary,
            marginHorizontal: 20,
            marginVertical: 10,
          }}></View>

        <View style={{height: 40}}>
          <ScrollView
            horizontal
            style={{width: width}}
            showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection: 'row', paddingHorizontal: 20}}>
              <GameModeButton text={'Head-to-Head'} icon={'sword-cross'} />
              <GameModeButton text={'Tournaments'} icon={'tournament'} />
              <GameModeButton text={'Predictions'} icon={'brain'} />
            </View>
          </ScrollView>
        </View>
        {gameModeSelected === 'Head-to-Head' && (
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              <View style={{flex: 1}}>
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
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontFamily: 'InterTight-Black',
                        fontSize: 16,
                      }}>
                      It looks empty in here, Start a Match!
                    </Text>
                  </View>
                )}

                {!noMatches && (
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={
                      searchingForMatch || isInMatchmaking
                        ? [...activeMatches, null]
                        : activeMatches
                    }
                    renderItem={({item, index}) => {
                      return item ? (
                        <View style={{width, height: '100%'}}>
                          <GameCard
                            userID={userID}
                            matchID={item}
                            setActiveMatches={setActiveMatches}
                            expandMatchSummarySheet={expandMatchSummarySheet}
                            setActiveMatchSummaryMatchID={
                              setActiveMatchSummaryMatchID
                            }
                            profileImageUri={profileImageUri}
                            activeMatches={activeMatches}
                          />
                        </View>
                      ) : (
                        <GameCardSkeleton />
                      );
                    }}
                    keyExtractor={(item, index) => index.toString()}
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
                  {activeMatches.map((_: any, index: number) => {
                    return (
                      <View
                        key={index}
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
                      style={{flex: 1}}
                    />
                  </Animated.View>
                )}
                <View>
                  {searchingForMatch || isInMatchmaking ? (
                    <View
                      style={[
                        styles.addButton,
                        {backgroundColor: theme.colors.primary},
                      ]}>
                      <SmallActivityIndicator color={theme.colors.text} />
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontFamily: 'InterTight-Black',
                          fontSize: 15,
                        }}>
                        Searching for Match
                      </Text>
                      <View style={{flex: 1}} />
                      <TouchableOpacity
                        onPress={cancelAlert}
                        style={{
                          backgroundColor: theme.colors.stockDownAccent,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 5,
                        }}>
                        <Text style={{fontFamily: 'InterTight-Bold'}}>
                          Cancel
                        </Text>
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
                            {transform: [{translateY}], opacity},
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
                            backgroundColor: theme.colors.background,
                          }}>
                          {/*<TouchableOpacity onPress={() => navigation.navigate("PastMatches")} style={{height: 40, borderRadius: 5, backgroundColor: theme.colors.opposite, width: (width-45)*0.12, justifyContent: 'center', alignItems:'center', marginRight: 10}}>
                    <EntypoIcons name="back-in-time" size={24} color={theme.colors.background}/>
                </TouchableOpacity>*/}
                          <TouchableOpacity
                            style={[
                              styles.addButton,
                              {
                                backgroundColor: showAdditionalButtons
                                  ? theme.colors.background
                                  : theme.colors.accent2,
                                zIndex: 1,
                                borderColor: showAdditionalButtons
                                  ? theme.colors.opposite
                                  : 'transparent',
                                borderWidth: 2,
                              },
                            ]}
                            onPress={() => {
                              toggleAdditionalButtons();
                            }}>
                            {showAdditionalButtons ? (
                              <Text
                                style={{
                                  color: theme.colors.opposite,
                                  fontFamily: 'InterTight-Black',
                                }}>
                                X
                              </Text>
                            ) : (
                              <Text
                                style={{
                                  color: '#fff',
                                  fontFamily: 'InterTight-Black',
                                  fontSize: 18,
                                }}>
                                Start a Match
                              </Text>
                            )}
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

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={[470]}
          index={-1}
          enablePanDownToClose
          onChange={handleSheetChanges}
          backgroundStyle={{backgroundColor: theme.colors.background}}
          handleIndicatorStyle={{backgroundColor: theme.colors.tertiary}}
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={{flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 20,
              }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'InterTight-Bold',
                  fontSize: 20,
                }}>
                Stock PVP
              </Text>
              <View style={{flex: 1}}></View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 5,
                }}>
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 50,
                    backgroundColor: theme.colors.accent,
                  }}
                />
                <Text
                  style={{
                    fontFamily: 'InterTight-Regular',
                    color: theme.colors.accent,
                  }}>
                  156 Playing
                </Text>
              </View>
            </View>
            <View>
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  marginHorizontal: 20,
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
                    {amount: 0, label: 'Free'},
                    {amount: 5, label: '$5'},
                    {amount: 10, label: '$10'},
                    {amount: 25, label: '$25'},
                  ].map((wager, index) => (
                    <TouchableOpacity
                      key={wager.amount}
                      style={[
                        styles.matchmakingWagerBtn,
                        wagerSelected == wager.amount && {
                          borderColor: theme.colors.text,
                          borderWidth: 2,
                        },
                        index === 5 && {marginRight: 40},
                      ]}
                      onPress={() => setWagerSelected(wager.amount)}>
                      <Text style={styles.matchmakingWagerTxt}>
                        {wager.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  marginHorizontal: 20,
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
                    {amount: 900, label: '15m'},
                    {amount: 86400, label: '1d'},
                    {amount: 604800, label: '1w'},
                  ].map((timeframe, index) => (
                    <TouchableOpacity
                      key={timeframe.amount}
                      style={[
                        styles.matchmakingWagerBtn,
                        timeframeSelected == timeframe.amount && {
                          borderColor: theme.colors.text,
                          borderWidth: 2,
                        },
                        index === 5 && {marginRight: 40},
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
                  backgroundColor: theme.colors.primary,
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
                <View style={{alignItems: 'center'}}>
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
                <View style={{marginHorizontal: 20}}>
                  <Icon
                    name="arrow-right"
                    size={24}
                    color={theme.colors.text}
                  />
                </View>
                <View style={{alignItems: 'center'}}>
                  <View
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
                  backgroundColor: theme.colors.primary,
                  marginHorizontal: 20,
                  marginTop: 20,
                }}
              />
            </View>
            <View
              style={{
                width: width,
                backgroundColor: theme.colors.background,
                justifyContent: 'center',
                marginVertical: 20,
              }}>
              {wagerSelected != null &&
              timeframeSelected != 0 &&
              modeSelected != '' ? (
                <>
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
                      backgroundColor: theme.colors.accent,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                    }}>
                    <Text
                      style={{
                        color: theme.colors.background,
                        fontFamily: 'InterTight-Bold',
                        fontSize: 18,
                      }}>
                      Enter Matchmaking
                    </Text>
                  </TouchableOpacity>
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
          backgroundStyle={{backgroundColor: theme.colors.background}}
          handleIndicatorStyle={{backgroundColor: theme.colors.tertiary}}
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={{flex: 1}}>
            <View style={{gap: 10, marginHorizontal: 20}}>
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
                backgroundColor: theme.colors.primary,
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
              <View style={{flex: 1}}></View>
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
          backgroundStyle={{backgroundColor: theme.colors.background}}
          handleIndicatorStyle={{backgroundColor: theme.colors.tertiary}}
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={{flex: 1}}>
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
      </View>
    </View>
  );
};

export default Home;
