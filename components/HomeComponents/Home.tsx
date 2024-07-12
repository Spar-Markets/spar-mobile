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
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import ToggleButton from './ToggleButton';
import DiscoverCard from './DiscoverCard';
import {useDispatch, useSelector} from 'react-redux';
import {setIsInMatchmaking} from '../../GlobalDataManagment/userSlice';
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
import { FAB, Portal, PaperProvider } from 'react-native-paper';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Svg, Circle as SvgCircle } from 'react-native-svg';
const {width} = Dimensions.get('window');

Icon.loadFont()
EntypoIcons.loadFont()
MaterialIcons.loadFont()

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
  const [activeMatches, setActiveMatches] = useState<string[]>([]);
  const [hasMatches, setHasMatches] = useState(false); // Set this value based on your logic
  const [skillRating, setSkillRating] = useState(0.0);
  const [username, setUsername] = useState('');
  const [matchData, setMatchData] = useState<MatchData[]>([]);
  const [userID, setUserID] = useState('');
  const [watchLists, setWatchLists] = useState<Object[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const dispatch = useDispatch();
  const {userData} = useUserDetails();
  

  const [noMatches, setNoMatches] = useState(false)

  const [wagerSelected, setWagerSelected] = useState<number | null>(10)
  const [timeframeSelected, setTimeFrameSelected] = useState(900)
  const [modeSelected, setModeSelected] = useState("Stock")

  const isInMatchmaking = useSelector(
    (state: any) => state.user.isInMatchmaking,
  );

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
          await AsyncStorage.setItem('profileImgPath', url);
          dispatch(setProfileImageUri(url));
        }
      } catch (error) {
        console.log("No profile set")
        //implement default image logic
      }
    }
  };

  useEffect(() => {
    const getProfilePicture = async () => {
      await requestPermissions();
      if (userData?.userID) {
        try {
          const profileImagePath = await AsyncStorage.getItem('profileImgPath');
          if (profileImagePath) {
            console.log(
              'Profile image path from AsyncStorage:',
              profileImagePath,
            );
            //setProfileImage(profileImagePath)
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
  }, [userData?.userID]);

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

  const getMatchData = async () => {
    try {
      console.log(`Server Url: ${process.env.SERVER_URL}`);
      console.log('getmatchdata', activeMatches);
      const md: MatchData[] = [];
      for (const id of activeMatches!) {
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

  useEffect(() => {
    if (userData) {
      setWatchLists(userData.watchLists);
    }
  }, [userData]);

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
    if (activeMatches){
      if (activeMatches.length !== 0) {
        getMatchData();
      } else {
        setNoMatches(true)
        setLoading(false)
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
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 30});

  const [selectedWatchList, setSelectedWatchList] = useState(0);

  const profileImageUri = useSelector(
    (state: any) => state.image.profileImageUri,
  );

  const bottomSheetRef = useRef<BottomSheet>(null);
  const infoSheetRef = useRef<BottomSheet>(null)

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

	const renderBackdrop = useCallback(
		(props:any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
        opacity={0.8}        
			/>
		),
		[]
	);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleInfoChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleEnterMatchmaking = async (wager: number, matchLength: number, matchType: String) => {
    //retrieve user's skill rating

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
      matchType: matchType
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
  const ws = useRef<WebSocket | null>(null);
  
  function uint8ArrayToString(array:any) {
    return array.reduce((data:any, byte:any) => data + String.fromCharCode(byte), '');
  }

  const [retries, setRetries] = useState(0);

  const MAX_RETRIES = 5;  // Maximum number of retry attempts
  const RETRY_DELAY = 2000; // Delay between retries in milliseconds
  
  //searchingForMatch || isInMatchmaking -----> these conditions == true, open websocket to look for match being created
  const setupSocket = async () => {    
    console.log("Opening socket with url:", websocketUrl);  
    const socket = new WebSocket(websocketUrl);

    ws.current = socket;
    
    ws.current.onopen = () => {
        console.log(`Connected to Matchmaking Websocket, but not ready for messages...`);
        if (ws.current!) {
          console.log(`Connection for Matchmaking Websocket is open and ready for messages`);
          // first send match ID
          ws.current!.send(JSON.stringify({ userID: userID }))
        } else {
          console.log('WebSocket is not open');
        }
    };


      // WebSocket message handling
      ws.current.onmessage = (event) => {
        const buffer = new Uint8Array(event.data);

        if (event.data == "Websocket connected successfully") {
          return;
        }

        const message = uint8ArrayToString(buffer); 

        try {
          const JSONMessage = JSON.parse(message);
          // Change stream handling for new matches
          if (message.type == "matchCreated") {
            const newMatch = message.newMatch;
            console.log("NEW MATCH HAS BEEN CREATED FROM MATCHMAKING. Here it is:", newMatch);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

    ws.current.onerror = (error) => {
        console.log('WebSocket error:', error || JSON.stringify(error));
        if (retries < MAX_RETRIES) {
          console.log(`Retrying connection (${retries + 1}/${MAX_RETRIES})...`);
          setRetries(retries + 1);
          setTimeout(() => {
              setupSocket();
          }, RETRY_DELAY);
        } else {
          console.error('Maximum retry attempts reached. Unable to connect to WebSocket.');
        }
    };

    ws.current.onclose = () => {
        console.log(`Connection to GameCard Asset Websocket closed`);
    };
  };

  const hexToRGBA = (hex:any, alpha = 1) => {
    let r = 0, g = 0, b = 0;
  
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

  const ruleMessage = (title:string, message:string) => (
    <View>
        <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18 }}>{title}</Text>
        <Text style={{ color: theme.colors.secondaryText, fontFamily: 'InterTight-Bold' }}>{message}</Text>
    </View>
  );


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
    <LinearGradient
      colors={[theme.colors.background, theme.colors.background]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={{flex: 1}}>
      <View style={styles.container}>
          <View style={styles.header}>
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10}}>
            <Image
              style={{width: 13, height: 22}}
              source={require('../../assets/images/logo.png')}
            />
            <Text style={{fontFamily: 'InterTight-Black', color: theme.colors.text, fontSize: 25}}>Spar</Text>
            </View>
            <View style={{flex: 1}} />
            <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
              <Icon name="bars" style={styles.icon} size={24} />
            </TouchableOpacity>
            
          </View>
          <View style={{flex: 1}}>
          <View style={{ 
            width: width-40, 
            marginHorizontal: 20, 
            marginTop: 10, 
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center'}}>
              <View>
                <Text style={styles.portfolio}>${userData?.balance.toFixed(2)}</Text>
                <View style={{flexDirection: 'row', marginTop: 5}}>
                  <View style={{
                      backgroundColor: hexToRGBA(theme.colors.accent, 0.3), 
                      paddingHorizontal: 10, 
                      paddingVertical: 3, 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      borderRadius: 5, 
                      flexDirection: 'row', 
                      gap: 5}}>
                      <Icon name={"arrow-circle-up"} color={theme.colors.accent}/>
                      <Text style={[styles.stockCardDiff, {color: theme.colors.accent}]}>{5.44} (10.32%) Today</Text>
                      <View style={{flex: 1}}></View>
                    </View>
                </View>
              </View>
              <View style={{flex: 1}}></View>
              <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity style={{alignItems: 'center', gap: 5}}>
                <View style={{width: 45, height: 45, backgroundColor: theme.colors.primary, borderColor: theme.colors.tertiary, borderWidth: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 100}}>
                    <MaterialIcons name="leaderboard" size={20} color={theme.colors.opposite}/>
                </View>
                <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 12}}>Rankings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{alignItems: 'center', gap: 5}}>
                <View style={{width: 45, height: 45, backgroundColor: theme.colors.primary, borderColor: theme.colors.tertiary, borderWidth: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 100}}>
                    <EntypoIcons name="plus" size={20} color={theme.colors.opposite}/>
                </View>
                <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 12}}>Add Funds</Text>
              </TouchableOpacity>
              </View>

            </View>
          <ToggleButton onToggle={handleToggle} animation={barAnimation}/>
          <Animated.View
            style={{
              flex: 1,
              width: screenWidth*2,
              flexDirection: 'row',
              transform: [{translateX: animation}],
            }}>
            <View style={{flex: 1}}>
              {noMatches && !searchingForMatch && !isInMatchmaking &&
                <View style={{width: (Dimensions.get('window').width), flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10}}>
                  {/*<Image source={require("../../assets/images/empty.png")} style={{width: 200, height: 200}}></Image>*/}
                  <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>It looks empty in here, Start a Match...</Text>
                </View>}
              {!noMatches && 
              <FlatList
                data={
                  searchingForMatch || isInMatchmaking
                    ? [...matchData, null]
                    : matchData
                }
                renderItem={({item, index}) =>
                 
                  item ? (
                    <>
                        <GameCard userID={userID} matchID={item} activeMatches={activeMatches} setActiveMatches={setActiveMatches}/>
                        <View style={{height: 6, width: width, backgroundColor: theme.colors.secondary, marginVertical: 10}}></View>
                    </> 
                  ) : (
                    <>
                      <GameCardSkeleton/>
                      <View style={{height: 6, width: width, backgroundColor: theme.colors.secondary, marginVertical: 10}}></View>
                    </> 
               
                  )
                }
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={() => <View style={{width: 0}}></View>}
      
                //pagingEnabled
                //snapToInterval={width}

                ref={flatListRef}
         
                //snapToAlignment="start"
                //decelerationRate={-10}
                onViewableItemsChanged={onViewRef.current}
                viewabilityConfig={viewConfigRef.current}
              />}

            </View>
            <View style={{flex: 1}}>
              <View>
                <Text>Tournaments</Text>
              </View>
            </View>
          </Animated.View>

              
        </View>

            <View style={{position: 'absolute', right: 0, bottom: 0}}>
              {searchingForMatch || isInMatchmaking ? <TouchableOpacity style={[styles.addButton]} onPress={cancelAlert}>
                <Text style={{color: theme.colors.background, fontFamily: 'InterTight-Bold', fontSize: 20}}>Cancel Matchmaking</Text>
                <SmallActivityIndicator />
              </TouchableOpacity>: <TouchableOpacity style={[styles.addButton, {backgroundColor: theme.colors.purpleAccent}]} onPress={expandBottomSheet}>
                <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Black'}}>Start a Match</Text>
                <Icon name="plus" size={20} color={theme.colors.text} />
              </TouchableOpacity>}
            </View>
            <BottomSheet
              ref={bottomSheetRef}
              snapPoints={[600]}
              index={-1}
              enablePanDownToClose
              onChange={handleSheetChanges}  
              backgroundStyle={{backgroundColor: theme.colors.background}}
              handleIndicatorStyle={{backgroundColor: theme.colors.tertiary}}
              backdropComponent={renderBackdrop}
            >
              <BottomSheetView style={{flex: 1}}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 20}}>
                  <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 24}}>Head-to-Head Matchmaking</Text>
                  <View style={{flex: 1}}></View>
                  <TouchableOpacity style={{paddingLeft: 10}} onPress={closeBottomSheet}>
                    <Icon name="close" color={theme.colors.text} size={30}></Icon>
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                  <View style={{flexDirection: 'row', marginVertical: 10, marginTop: 10}}>
                    <View style={styles.matchmakingCategory}>
                      <Text style={styles.matchmakingCategoryText}>Select Wager</Text>
                      <Icon name="money" size={20} color={theme.colors.background}></Icon>
                    </View>
                  </View>
                    <ScrollView horizontal style={{paddingHorizontal: 20}} showsHorizontalScrollIndicator={false}>
                    {[
                      {amount: 0, label: 'Free'},
                      {amount: 5, label: '$5'},
                      {amount: 10, label: '$10'},
                      {amount: 25, label: '$25'},
                      {amount: 100, label: '$100'},
                      {amount: 250, label: '$250'}
                    ].map((wager, index) => (
                      <TouchableOpacity
                        key={wager.amount}
                        style={[
                          styles.matchmakingWagerBtn,
                          wagerSelected == wager.amount && {borderColor: theme.colors.text, borderWidth: 2},
                          index === 5 && {marginRight: 40}
                        ]}
                        onPress={() => setWagerSelected(wager.amount)}
                      >
                        <Text style={styles.matchmakingWagerTxt}>{wager.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View>
                  <View style={{flexDirection: 'row', marginVertical: 10}}>
                    <View style={styles.matchmakingCategory}>
                      <Text style={styles.matchmakingCategoryText}>Select Timeframe</Text>
                      <EntypoIcons name="time-slot" size={20} color={theme.colors.background}></EntypoIcons>
                    </View>
                  </View>
                  <ScrollView horizontal style={{paddingHorizontal: 20}} showsHorizontalScrollIndicator={false}>
                    {[
                      {amount: 900, label: '15m'},
                      {amount: 3600, label: '1hr'},
                      {amount: 84600, label: '1d'},
                      {amount: 592200, label: '1w'},
                    ].map((timeframe, index) => (
                      <TouchableOpacity
                        key={timeframe.amount}
                        style={[
                          styles.matchmakingWagerBtn,
                          timeframeSelected == timeframe.amount && {borderColor: theme.colors.text, borderWidth: 2},
                          index === 4 && {marginRight: 40}
                        ]}
                        onPress={() => setTimeFrameSelected(timeframe.amount)}
                      >
                        <Text style={styles.matchmakingWagerTxt}>{timeframe.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View>
                  <View style={{flexDirection: 'row', marginVertical: 10}}>
                    <View style={styles.matchmakingCategory}>
                      <Text style={styles.matchmakingCategoryText}>Select Mode</Text>
                      <EntypoIcons name="area-graph" size={20} color={theme.colors.background}></EntypoIcons>
                    </View>
                  </View>
                  <ScrollView horizontal style={{paddingHorizontal: 20}} showsHorizontalScrollIndicator={false}>
                    {[
                      {label: 'Stock'},
                      {label: 'Crypto'},
                      {label: 'Options'},
                    ].map((mode, index) => (
                      <TouchableOpacity
                        key={mode.label}
                        style={[
                          styles.matchmakingWagerBtn,
                          modeSelected == mode.label && {borderColor: theme.colors.text, borderWidth: 2},
                          index === 4 && {marginRight: 40}
                        ]}
                        onPress={() => setModeSelected(mode.label)}
                      >
                        <Text style={styles.matchmakingWagerTxt}>{mode.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                </ScrollView>
                <View style={{width: width,backgroundColor: theme.colors.background, justifyContent: 'center', marginVertical: 10}}>
                    {(wagerSelected != null && timeframeSelected != 0 && modeSelected != "") ? 
                    <>
                    <View style={{flexDirection: 'row', marginHorizontal: 20, gap: 10}}>
                      <View style={{marginVertical: 5, flexDirection: 'row', 
                      backgroundColor: theme.colors.primary, padding: 10, borderRadius: 10, alignItems: 'center', gap: 10, flex: 1}}>
                        <Icon name={"dollar"} size={24} color={theme.colors.opposite}></Icon>
                        <View>
                          {wagerSelected != 0 ? <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 20}}>Cost: ${(1.1* wagerSelected).toFixed(2)}</Text> :
                          <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 20}}>Cost: Free</Text>}
                          <Text style={{color: theme.colors.secondaryText, fontSize: 14}}>(${wagerSelected.toFixed(2)} + ${(0.1*wagerSelected).toFixed(2)} Entry Fee)</Text>
                        </View>
                        <View style={{flex: 1}}></View>
                      </View>
                      <View style={{backgroundColor: theme.colors.primary, borderRadius: 10, justifyContent: 'center', padding: 10, marginVertical: 5,}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                          <View style={{flex: 1}}></View>
                          <Text style={{color: theme.colors.accent, fontSize: 20, textAlign: 'right', fontFamily: 'InterTight-Bold', }}>29</Text>
                        </View>
                        <Text style={{color: theme.colors.accent, fontSize: 14, textAlign: 'right'}}>Players Matchmaking</Text>
                      </View>
                    </View>
                    <LinearGradient colors={["#FFD700", "#FFA500"]} start={{x: 0, y: 0.5}} end={{x:1, y: 0.5}} style={{marginHorizontal: 20, marginTop: 5, marginBottom: 10, flexDirection: 'row', 
                    backgroundColor: theme.colors.primary, padding: 10, borderRadius: 10, alignItems: 'center', gap: 10}}>
                      <Icon name={"trophy"} size={24} color={theme.colors.background}></Icon>
                      <View>
                        <Text style={{color: theme.colors.background, fontFamily: 'InterTight-Bold', fontSize: 20}}>Prize: ${(wagerSelected*2).toFixed(2)}</Text>
                      </View>
                      <View style={{flex: 1}}></View>
                      <TouchableOpacity onPress={expandInfoSheet}>
                        <Icon name={"info-circle"} size={24} color={theme.colors.background}></Icon>
                      </TouchableOpacity>
                    </LinearGradient>
                    <TouchableOpacity onPress={() => handleEnterMatchmaking(wagerSelected, timeframeSelected, modeSelected)} style={{marginHorizontal: 20, height: 50, backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
                      <Text style={{color: theme.colors.background, fontFamily: "InterTight-Bold", fontSize: 18}}>Enter Matchmaking</Text>
                    </TouchableOpacity>
                    </>: 
                    <View style={{marginHorizontal: 20, height: 50, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
                      <Text style={{color: theme.colors.tertiary, fontFamily: "InterTight-Bold", fontSize: 18}}>Enter Matchmaking</Text>
                    </View>}
                </View>
              </BottomSheetView>
            </BottomSheet>
            <BottomSheet
              ref={infoSheetRef}
              snapPoints={[400]}
              index={-1}
              enablePanDownToClose
              onChange={handleInfoChanges}  
              backgroundStyle={{backgroundColor: theme.colors.background}}
              handleIndicatorStyle={{backgroundColor: theme.colors.tertiary}}
              backdropComponent={renderBackdrop}
            >
              <BottomSheetView style={{flex: 1}}>
                <View style={{ marginTop: 20, gap: 10, marginHorizontal: 20 }}>
                    <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Black', fontSize: 24}}>Match Details</Text>
                    {ruleMessage("Match Rules", "With $100,000 in simulated buying power, trade stocks and achieve a greater return than your opponent to win.")}
                    {ruleMessage("Prize", "The prize pool is the sum of the entry fees minus 10% that goes to us so we can improve our platform and offer free-to-play tournaments.")}
                    {ruleMessage("Matchmaking", `If you aren’t matched up or you cancel matchmaking before a match begins, your $${wagerSelected} will be credited back to your account.`)}
                </View>
              </BottomSheetView>
            </BottomSheet>
          </View>
    </LinearGradient>
  );
};


export default Home;
