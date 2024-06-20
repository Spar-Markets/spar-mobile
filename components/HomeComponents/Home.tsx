import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, Dimensions, Animated, FlatList, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import ToggleButton from './ToggleButton';
import DiscoverCard from './DiscoverCard';
import { useDispatch, useSelector } from 'react-redux';
import { setIsInMatchmaking } from '../../GlobalDataManagment/userSlice';
import useUserDetails from '../../hooks/useUserDetails';
import GameCard from './GameCard';
import GameCardSkeleton from './GameCardSkeleton';
import { serverUrl } from '../../constants/global';
import StockCard from '../StockComponents/StockCard';


const { width } = Dimensions.get('window');

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

  // Layout and Style Initialization
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const [balance, setBalance] = useState("0.00");
  const [searchingForMatch, setSearchingForMatch] = useState(false);
  const [activeMatches, setActiveMatches] = useState<string[]>([]);
  const [hasMatches, setHasMatches] = useState(false); // Set this value based on your logic
  const [skillRating, setSkillRating] = useState(0.0);
  const [username, setUsername] = useState("");
  const [matchData, setMatchData] = useState<MatchData[]>([]);
  const [userID, setUserID] = useState("");
  const [watchedStocks, setWatchedStocks] = useState<String[]>([])

  const dispatch = useDispatch();
  const { userData } = useUserDetails();

  const isInMatchmaking = useSelector((state: any) => state.user.isInMatchmaking);

  const fetchMatchIDs = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(serverUrl + '/getUserMatches', { userID });
      console.log('Matches1: ', response.data);
      setActiveMatches(response.data);
      setLoading(false)
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const getMatchData = async () => {
    try {
      console.log("getmatchdata", activeMatches);
      const md: MatchData[] = [];
      for (const id of activeMatches) {
        const matchDataResponse = await axios.post(serverUrl + '/getMatchData', { matchID: id });
        md.push(matchDataResponse.data);
      }
      console.log("hellldsfsf:", md);
      setMatchData(md);
    } catch (error) {
      console.error('in get match data error' + error);
    }
  };

  const cancelMatchmaking = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(serverUrl + '/cancelMatchmaking', { userID });
      console.log(response);
      dispatch(setIsInMatchmaking(false));
      setSearchingForMatch(false);
    } catch (error) {
      console.error('Error in cancelMatchmaking in home.tsx:', error);
    }
  };

  const getIsInMatchMaking = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const response = await axios.post(serverUrl + '/areTheyMatchmaking', { userID });
      console.log(response.data.result);
      if (response.data.result) {
        console.log('User is in matchmaking');
        setSearchingForMatch(true);
      } else {
        console.log('User is not in matchmaking');
        setSearchingForMatch(false);
      }
    } catch (error) {
      console.log("ERROR in: 'is user matchmaking'");
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

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userData) {
      setWatchedStocks(userData.watchedStocks)
    }
  }, [userData])

  useEffect(() => {
    setLoading(true)
    const getUserID = async () => {
      const userID = await AsyncStorage.getItem("userID");
      setUserID(userID!);
    }
    getUserID()
    getIsInMatchMaking();
    fetchMatchIDs();
  }, []);

  useEffect(() => {
    if (activeMatches.length !== 0) {
      getMatchData();
    } else {
      console.log();
    }
  }, [activeMatches]);

  const animation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  const handleToggle = (option: any) => {
    const toValue = option === 'head-to-head' ? 0 : -screenWidth + 40;
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
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 30 });

  const DATA = Array.from({ length: 31 }, (_, i) => ({
    day: i,
    highTmp: 40 + 30 * Math.random(),
  }));

  if (loading) {
    return (
      <View></View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image style={styles.profilePic} source={require("../../assets/images/profilepic.png")} />
            {userData && <Text style={styles.headerText}>Welcome {userData.username} 👋</Text>}
            <View style={{ flex: 1 }} />
            <TouchableOpacity>
              <Icon name="search" style={[styles.icon, { marginRight: 5 }]} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Menu")}>
              <Icon name="bars" style={styles.icon} size={24} />
            </TouchableOpacity>
          </View>
          <ToggleButton onToggle={handleToggle} />
          <Animated.View style={{ flex: 1, flexDirection: 'row', width: screenWidth - 40, transform: [{ translateX: animation }] }}>
            <View>
              <FlatList
                data={searchingForMatch || isInMatchmaking ? [null, ...matchData] : matchData}
                renderItem={({ item, index }) =>
                  item ? (
                    <GameCard match={item} userID={userID}/>
                  ) : (
                    <GameCardSkeleton />
                  )
                }
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={() => (
                  <View style={{width: 10}}></View>
                )}
                horizontal
                pagingEnabled
                snapToInterval={width - 10}
                showsHorizontalScrollIndicator={false}
                ref={flatListRef}
                //onScrollEndDrag={handleScrollEnd}
                //onMomentumScrollEnd={handleScrollEnd}
                snapToAlignment="start"
                decelerationRate={-10} 
                onViewableItemsChanged={onViewRef.current}
                viewabilityConfig={viewConfigRef.current}
              />
              {searchingForMatch || isInMatchmaking ? (
              <View style={styles.hthContainer}>
                <TouchableOpacity style={[styles.enterHTHMatchBtn, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', gap: 10 }]} onPress={() => { cancelAlert() }}>
                  <Text style={[styles.enterHTHMatchBtnText, { color: theme.colors.text }]}>Searching (Cancel)</Text>
                  <ActivityIndicator size={'small'} />
                </TouchableOpacity>
              </View>
              ) : (
              <View style={styles.hthContainer}>
                <TouchableOpacity style={styles.enterHTHMatchBtn} onPress={() => navigation.navigate('EnterMatch')}>
                  <Text style={styles.enterHTHMatchBtnText}>Setup a Match</Text>
                  <View style={{ flex: 1 }}></View>
                  <Icon name="arrow-right" style={{ marginRight: 20, color: theme.colors.background }} size={24} />
                </TouchableOpacity>
              </View>
              )}
              <View style={styles1.paginationContainer}>
                {Array.from({ length: matchData.length + (searchingForMatch || isInMatchmaking ? 1 : 0) }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles1.paginationDot,
                      { backgroundColor: currentIndex === index ? theme.colors.accent : theme.colors.text }
                    ]}
                  />
                ))}
              </View>
            </View>
            <View>
              <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 14, marginBottom: 10, marginLeft: 5 }}>Open Tournaments</Text>
            </View>
          </Animated.View>
          <View style={{ marginTop: 20, gap: 5 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, marginLeft: 5 }}>Discover Spar</Text>
            <DiscoverCard title={"Referral Program"} image={require("../../assets/images/referralIcon.png")} message={"Refer your friend to Spar, and when they sign up and play a match, you get $5"} />
            <DiscoverCard title={"Spar Tutorials"} image={require("../../assets/images/tutorialsIcon.png")} message={"Learn about the functionality of Spar and develop your Spar skills to succeed"} />
          </View>
          <View style={{ marginTop: 20, gap: 7 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, marginLeft: 5 }}>Watchlists</Text>
            {watchedStocks.map((ticker, index) => {
            if (index % 2 === 0) {
              return (
              <View key={index} style={{ flexDirection: 'row' }}>
                <View style={{ width: (width-47)/2 }}>
                  <StockCard ticker={watchedStocks[index]} />
                </View>
                <View style={{ flex: 1 }}></View>
                {watchedStocks[index + 1] && (
                  <View style={{ width: (width-47)/2 }}>
                    <StockCard ticker={watchedStocks[index + 1]} />
                  </View>
                )}
              </View>
              );
            }
            return null; // Return null for odd indices as they are already handled in the even case
            })}
          </View>
        </ScrollView>
      </View>
      

      <View style={styles.depositsContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20 }}>
          <View>
            <Text style={styles.balance}>${userData?.balance.toString()}</Text>
            <Text style={styles.fundText}>Available Funds</Text>
          </View>
          <View style={{ flex: 1 }}></View>
          <TouchableOpacity style={styles.depositBtn}>
            <Text style={styles.depositBtnText}>Deposit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles1 = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default Home;
