import React, {useState, useEffect, useCallback, useReducer} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './GameModesScrollBar';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import AccountCard from './AccountCard';
import { Dropdown } from 'react-native-element-dropdown';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { EmailTypeEnum } from 'plaid';

const Home  = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const colorScheme = useColorScheme();
  const [currStyles, setCurrStyles] = useState(darkStyles);
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [balance, setBalance] = useState("0.00");
  const [value, setValue] = useState("Entry Fee");
  const [value2, setValue2] = useState("Match Length");
  const [isFocus, setIsFocus] = useState(false);
  const [isFocus2, setIsFocus2] = useState(false);
  const [searchingForMatch, setSearchForMatch] = useState(false)
  const [activeMatches, setActiveMatches] = useState([]);
  const [hasMatches, setHasMatches] = useState(false); // Set this value based on your logic
  const [skillRating, setSkillRating] = useState(0.0)
  const [user, setUser] = useState("")
  const [username, setUsername] = useState("")


  const data = [
    { label: '$10', value: '10' },
    { label: '$20', value: '20' },
    { label: '$30', value: '30' },
  ];
  const data2 = [
    { label: '1 Day', value: '24' },
    { label: '1 Week', value: '168' },
    { label: '1 Month', value: '720' },
  ];
  

  const cancelMatchmaking = async () => {
    //MongoLogic
    const emailToSend = {
      email: user
    }
    const response = await axios.post(serverUrl + "/cancelMatchmaking", emailToSend)
    console.log(response)
    //ON success of mongodb
    setSearchForMatch(false)
  }


  const cancelAlert = () => {
    Alert.alert('Cancel Matchmaking?', '', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: () => cancelMatchmaking()},
    ]);
  }
  

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

  const getMatches = async () => {
    const emailToSend = {
      email: user
    }
    try {

      const response = await axios.post(serverUrl + "/getUserMatches", emailToSend) 
      // Check the value of the 'result' field
      if (response.data.result) {
        setActiveMatches(response.data.matches);
        console.log(`Has ${response.data.matches.length} matches`);
        setHasMatches(true)
        
        // Handle the case when the user is in matchmaking
        } else {
        console.log('User does not have Matches');
        setHasMatches(false)
        // Handle the case when the user is not in matchmaking
      }

    } catch (error) {
      console.log("This error is in pvp")
      console.error(error)
    }   
  }


  // Function to handle user logout
  const handleLogout = useCallback(async () => {
    try {
      // Clear authentication state from AsyncStorage
      await AsyncStorage.removeItem('authData');
      setIsAuthenticated(false);
      navigation.replace('Onboardscreen1');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [navigation]);


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

  const handleDeposit = async () => {
    navigation.push("Deposit");
  }

  //Matchmaking Function with server connection
  const handleEnterMatchmaking = async (entryFee: String, matchLength: String) => {
    const emailToSend = {
      email: user
    }

    //Ensure valid game params before starting search
    if (entryFee == 'Entry Fee' || matchLength == 'Match Length') {
        Alert.alert("Not Valid Match Params")
        return
    }
    //Changes appearance of the button
    setSearchForMatch(true)
    
    //retrieve user's skill rating
    try {
        await axios.post(serverUrl + "/getActiveUser", emailToSend).then(user => {
            setSkillRating(user.data.skillRating)
            setUsername(user.data.username)

        })
    } catch (error) {
        console.error(error)
    }
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
    console.log(player)

    try { const response = await axios.post(serverUrl + "/userToMatchmaking", player)
    console.log(response)
    }     
    catch (error) {
        console.log(error)
    }
  }

  const getEmail = async () => {
    const email = await AsyncStorage.getItem("userEmail");
    if (email !== null) {
      setUser(email); // Assuming setUser updates some state with the email
    }
  }


  useEffect(() => {
    getEmail()
    if (user !== "") {
      getIsInMatchMaking()
    }
    setCurrStyles(colorScheme == "dark" ? darkStyles : lightStyles);
    NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
      setStatusBarHeight(response.height);
    });
    getBalance();
  }, [colorScheme, user]);


return (
    <View style={currStyles.container}>
      <View style={{height: 40, flexDirection: 'row', marginTop: statusBarHeight + 10}}>
        <View style={{flex: 1, marginLeft: 12, justifyContent: 'center'}}>
          <Text style={[colorScheme == "dark" ? {color: '#fff'} : {color: '#000'}, {fontFamily: 'InterTight-Black', fontSize: 24}]}>Home</Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', gap: 5}}>
          <View style={{flex: 1}}></View>
          <TouchableOpacity onPress={() => navigation.push("Profile")} style={{width: 40, backgroundColor: '#3B30B9', justifyContent: 'center', alignItems: 'center', borderRadius: 12}}>
            {/*<Image source={require('../assets/images/account.png')} resizeMode='contain' style={{flex: 0.6}} />*/}
          </TouchableOpacity>
          <TouchableOpacity style={{width: 40, backgroundColor: '#3B30B9', justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginRight: 12}}>
            {/*<Image source={require('../assets/images/noti.png')} resizeMode='contain' style={{flex: 0.6}} />*/}
          </TouchableOpacity>
        </View>
      </View>
      <AccountCard text={balance}></AccountCard>
      <ScrollView style={{flex: 1, marginBottom: 10}} showsVerticalScrollIndicator={false}>
        <GameModesScrollBar></GameModesScrollBar>
      </ScrollView>
      <View>
        <View style={{flexDirection: 'row', height: 80, gap: 15}}>
          <Dropdown
          style={[darkStyles.dropdown, isFocus && { borderColor: '#3B30B9' },
          value2 == 'Entry Fee' && { borderColor: 'green' }
        ]} // Apply when specific value is selected
          placeholderStyle={darkStyles.placeholderStyle}
          selectedTextStyle={darkStyles.selectedTextStyle}
          data={data}
          containerStyle = {darkStyles.itemsContainer}
          dropdownPosition = 'top'
          iconStyle={darkStyles.iconStyle}
          maxHeight={150}
          labelField="label"
          valueField="value"
          autoScroll = {false}
          itemTextStyle = {darkStyles.text}
          activeColor = '#2f2f2f'
          placeholder={!isFocus ? 'Entry Fee' : value}
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
          }} 
          />

          <Dropdown
          style={[darkStyles.dropdown2, isFocus2 && { borderColor: '#3B30B9' }]}
          placeholderStyle={darkStyles.placeholderStyle}
          selectedTextStyle={darkStyles.selectedTextStyle}
          data={data2}
          containerStyle = {darkStyles.itemsContainer}
          dropdownPosition = 'top'
          iconStyle= {darkStyles.iconStyle}
          maxHeight={150}
          labelField="label"
          valueField="value"
          itemTextStyle = {darkStyles.text}
          activeColor = '#2f2f2f'
          placeholder={!isFocus2 ? 'Match Length' : value2}
          value={value2}
          onFocus={() => setIsFocus2(true)}
          onBlur={() => setIsFocus2(false)}
          onChange={item => {
            setValue2(item.value);
            setIsFocus2(false);
          }}
          />  
        </View>
        {searchingForMatch === false && (
        <TouchableOpacity onPress={ () => handleEnterMatchmaking(value, value2)} style={{backgroundColor: '#3B30B9', height: 80, marginBottom: 100, marginHorizontal: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: 'white', fontSize: 20, fontFamily: 'InterTight-Black'}}>Enter Matchmaking</Text>
        </TouchableOpacity>)}
        {searchingForMatch === true && (
          <TouchableOpacity onPress={cancelAlert} style={{backgroundColor: '#AAA0B9', height: 80, marginBottom: 100, marginHorizontal: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: 'white', fontSize: 20, fontFamily: 'InterTight-Black'}}>Cancel</Text>
        </TouchableOpacity>)}

      </View> 
    </View>
    );
};


const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    justifyContent: 'center',
  },
  iconStyle: {
    marginRight: 15,
    height: 30,
    width: 30
  },
  dropdown: {
    flex: 1, 
    marginLeft: 12, 
    marginBottom: 15, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    height: 65,
    borderColor: 'gray', 
    borderWidth: 1,
  },
  dropdown2: {
    flex: 1, 
    marginRight: 12, 
    marginBottom: 15, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    height: 65,
    borderColor: 'gray',
    borderWidth: 1,
  },
  text: {
    color: 'white',
    fontFamily: 'InterTight-Black'
  },
  placeholderStyle: {
    fontSize: 18,
    color: 'white',
    paddingLeft: 20,
    fontFamily: 'InterTight-Black'
  },
  itemsContainer: {
    backgroundColor: '#181818',
    color: 'white'
  },
  selectedState: {
    borderColor: 'purple'
  },
  mainTxt: {
    color: 'white',
    fontSize: 50,
    marginHorizontal: 24,
    fontFamily: 'InterTight-Black'
  },
  button: {
    backgroundColor: '#3B30B9',
    marginHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15
  },
  selectedTextStyle: {
    fontSize: 18,
    color: 'white',
    paddingLeft: 20,
    fontFamily: 'InterTight-Black'
  },
  buttonTxt: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'InterTight-Black'
  }
})

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    justifyContent: 'center',
  },
  iconStyle: {
    marginRight: 15,
    height: 30,
    width: 30
  },
  dropdown: {
    flex: 1, 
    marginLeft: 12, 
    marginBottom: 15, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    height: 65,
    borderColor: 'gray', 
    borderWidth: 1,
  },
  dropdown2: {
    flex: 1, 
    marginRight: 12, 
    marginBottom: 15, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    height: 65,
    borderColor: 'gray',
    borderWidth: 1,
  },
  text: {
    color: 'white',
    fontFamily: 'InterTight-Black'
  },
  placeholderStyle: {
    fontSize: 18,
    color: 'white',
    paddingLeft: 20,
    fontFamily: 'InterTight-Black'
  },
  itemsContainer: {
    backgroundColor: '#181818',
    color: 'white'
  },
  selectedState: {
    borderColor: 'purple'
  },
  mainTxt: {
    color: 'white',
    fontSize: 50,
    marginHorizontal: 24,
    fontFamily: 'InterTight-Black'
  },
  button: {
    backgroundColor: '#3B30B9',
    marginHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15
  },
  selectedTextStyle: {
    fontSize: 18,
    color: 'white',
    paddingLeft: 20,
    fontFamily: 'InterTight-Black'
  },
  buttonTxt: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'InterTight-Black'
  }
})

export default Home;
