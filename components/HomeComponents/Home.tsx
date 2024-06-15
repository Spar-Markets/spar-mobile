import React, {useState, useEffect, useCallback, useReducer, useRef} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, NativeModules, ScrollView, Alert, Platform, ActivityIndicator, Dimensions, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import ActiveGames from '../ActiveGames';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useStatusBarHeight } from '../ContextComponents/StatusBarHeightContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import ToggleButton from './ToggleButton';
import Gap from './Gap';
import DiscoverCard from './DiscoverCard';
import useUserDetails from '../../hooks/useUserDetails';
import { useDispatch } from 'react-redux';
import { setUser, setUserData, setLoading, setError } from '../../GlobalDataManagment/userSlice'

const Home = () => {

  // Layout and Style Initilization
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width)


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const [balance, setBalance] = useState("0.00");
  const [searchingForMatch, setSearchForMatch] = useState(false)
  const [activeMatches, setActiveMatches] = useState([]);
  const [hasMatches, setHasMatches] = useState(false); // Set this value based on your logic
  const [skillRating, setSkillRating] = useState(0.0)
  //const [user, setUser] = useState("")
  const [username, setUsername] = useState("")

  //const { user, userData, loading, error } = useUserDetails();

  /*const { user } = useAuth()

  const [userID, setuserID] = useState<string | undefined>(undefined);
  const { userData, error } = useUserData(userID);

  useEffect(() => {
    if (user) {
      setuserID((user as any).userID)
    }
  }, [user]);*/
  
  const dispatch = useDispatch();
  const { user, userData, loading, error} = useUserDetails();

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
    if (userData) {
      dispatch(setUserData(userData));
    }
    if (loading !== undefined) {
      dispatch(setLoading(loading));
    }
    if (error) {
      dispatch(setError(error));
    }
  }, [user, userData, loading, error, dispatch]);

  
  
  /*const cancelMatchmaking = async () => {
    //MongoLogic
    const emailToSend = {
      email: user
    }
    const response = await axios.post(serverUrl + "/cancelMatchmaking", emailToSend)
    console.log(response)
    //ON success of mongodb
    setSearchForMatch(false)
  }*/

  /*const cancelAlert = () => {
    Alert.alert('Cancel Matchmaking?', '', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: () => cancelMatchmaking()},
    ]);
  }*/
  
  /**
   * Checks if the user is currently in matchmaking
   */
  const getIsInMatchMaking = async () => {    
    try {
      const emailToSend = {
        email: user
      }
      // Make a request to the server to check if the user is in matchmaking
      const response = await axios.post(serverUrl + "/areTheyMatchmaking", emailToSend);
      console.log(response.data.result)
      // Check the value of the 'result' field
      if (response.data.result) {

        console.log('User is in matchmaking');
        setSearchForMatch(true)

        // Handle the case when the user is in matchmaking
      } else {
        console.log('User is not in matchmaking');
        setSearchForMatch(false)

        // Handle the case when the user is not in matchmaking
      }
    } catch (error) {
      console.log("ERROR in: 'is user matchmaking'");
      console.log(error);
      // Handle the error
    }
  };


  /**
   * Get's user balance from mongoDB
   */
  const getBalance = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail")
      const data = {
        email: email
      }
      const balance = await axios.post(serverUrl+"/getMongoAccount", data)
      //console.log(balance.data.$numberDecimal)
      
      if (balance.data.$numberDecimal >= 0.00) {
        console.log("Bal from Mongo: " + balance.data.$numberDecimal)
        setBalance(balance.data.$numberDecimal)
      }
    } catch (error) {
      console.error(error)
    }
  }

  /*const handleDeposit = async () => {
    navigation.push("Deposit");
  }*/

  //Matchmaking Function with server connection
  /*const handleEnterMatchmaking = async (entryFee: String, matchLength: String) => {
    //Ensure valid game params before starting search
    if (entryFee == 'Entry Fee' || matchLength == 'Match Length') {
        Alert.alert("Not Valid Match Params")
        return
    }
    //Changes appearance of the button
    setSearchForMatch(true)
    
    //retrieve user's skill rating
    
    console.log(entryFee)
    console.log(matchLength)
    

    //Asign current user's values to a player object
    const player = {
        username: username,
        email: user,
        skillRating: skillRating,
        entryFee: entryFee,
        matchLength: matchLength
    }
    //Pass the players object to the database
    console.log("Log" + player)

    try { const response = await axios.post(serverUrl + "/userToMatchmaking", player)
    console.log(response)
    }     
    catch (error) {
        console.log(error)
    }
  }*/

  const getActiveUserEmail = async () => {
    if (user) {
      console.log((user as any).userID)
    }
  }

    
    
    /*if (email !== null) {
      setUser(email); // Assuming setUser updates some state with the email
      const emailToSend = {
        email: email
      }
      try {
        await axios.post(serverUrl + "/getActiveUser", emailToSend).then(user => {
            setSkillRating(user.data.skillRating.$numberDecimal)
            setUsername(user.data.username)
            setBalance(user.data.balance.$numberDecimal)
        })
      } catch (error) {
          console.error(error)
      }
    }*/
  

  
  const animation = new Animated.Value(0);

  useEffect(() => {
    //getIsInMatchMaking()
    
    //getEmail()
    if (user !== "") {
      //getIsInMatchMaking()
    }
    //getBalance();
  }, [user]);

  const screenWidth = Dimensions.get('window').width;
  
  const handleToggle = (option:any) => {
    const toValue = option == 'head-to-head' ? 0 : -screenWidth + 40;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  return (
    <View style={{flex: 1}}>
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {/*Get image from storage*/}
          <Image style={styles.profilePic} source={require("../../assets/images/profilepic.png")}></Image>
          {userData && <Text style={styles.headerText}>Welcome {userData.username} 👋</Text>}
          <View style={{flex: 1}}/>
          <TouchableOpacity>
            <Icon name="search" style={[styles.icon, {marginRight: 5}]} size={24}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Menu")}>
            <Icon name="bars" style={styles.icon} size={24}/>
          </TouchableOpacity>
        </View>
        <ToggleButton onToggle={handleToggle}></ToggleButton>
        <Animated.View style={{flex: 1, flexDirection: 'row', width: screenWidth-40, transform: [{ translateX: animation }] }}>
          <View>
          {/*<Text style={{color: theme.colors.text, fontWeight: 'bold', fontSize: 14, marginBottom: 10, marginLeft: 5}}>Matches</Text>*/}
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <GameCard mode={"Stock"} amountWagered={"10"} timeFrame={3600} endDate={new Date(2024, 5, 8, 22, 34, 56, 789)} yourPercentChange={"4.54"} opp={"Rzon"} oppPercentChange={"3.21"} idIndex={0}></GameCard>
            <GameCard mode={"Stock"} amountWagered={"10"} timeFrame={3600} endDate={new Date(2024, 5, 8, 22, 34, 56, 789)} yourPercentChange={"4.54"} opp={"Rzon"} oppPercentChange={"3.21"} idIndex={0}></GameCard>
          </ScrollView>
          </View>
          <View>
            <Text style={{color: theme.colors.text, fontWeight: 'bold', fontSize: 14, marginBottom: 10, marginLeft: 5}}>Open Tournaments</Text>
          </View>
          </Animated.View>
          <View style={{marginTop: 20, gap: 5}}>
            <Text style={{color: theme.colors.text, fontSize: 18, marginLeft: 5}}>Discover Spar</Text>
            <DiscoverCard title={"Referral Program"} image={require("../../assets/images/referralIcon.png")} message={"Refer your friend to Spar, and when they sign up and play a match, you get $5"}/>
            <DiscoverCard title={"Spar Tutorials"} image={require("../../assets/images/tutorialsIcon.png")} message={"Learn about the functionality of Spar and develop your Spar skills to succeed"}/>
          </View>
      </ScrollView>
    </View>
    <View style={styles.hthContainer}>
      <TouchableOpacity style={styles.enterHTHMatchBtn} onPress={() => navigation.navigate('EnterMatch')}>
        <Text style={styles.enterHTHMatchBtnText}>Setup a Match</Text>
        <View style={{flex: 1}}></View>
        <Icon name="arrow-right" style={{marginRight: 20, color: theme.colors.background}} size={24}/>
      </TouchableOpacity>
    </View>
    <View style={styles.depositsContainer}>
      <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 20}}>
      <View>
        <Text style={styles.balance}>$545.43</Text>
        <Text style={styles.fundText}>Available Funds</Text>
      </View>
      <View style={{flex: 1}}></View>
      <TouchableOpacity style={styles.depositBtn} onPress={getActiveUserEmail}>
        <Text style={styles.depositBtnText}>Deposit</Text>
      </TouchableOpacity>
      </View>
    </View>
    </View>
  );
};

export default Home;

