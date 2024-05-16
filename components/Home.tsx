import React, {useState, useEffect, useCallback, useReducer} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import ActiveGames from './ActiveGames';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import AccountCard from './AccountCard';
import { Dropdown } from 'react-native-element-dropdown';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { EmailTypeEnum } from 'plaid';
import LinearGradient from 'react-native-linear-gradient';
import io from "socket.io-client";
import {PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk';
import Icon from 'react-native-vector-icons/FontAwesome';
import WagerEarn from './PromotionBanners/WagerEarn';
import { Dimensions } from "react-native";
import { LineChart } from 'react-native-chart-kit';
import DailyChallengeCard from './DailyChallengeCard';
import TournamentCard from './TournamentCard';

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
  
  const [linkToken, setLinkToken] = useState("");
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
  const [accessToken, setAccessToken] = useState("");

  const screenWidth = Dimensions.get("window").width;

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
  };

  const data = [
    { label: '$10', value: '10' },
    { label: '$20', value: '20' },
    { label: '$30', value: '30' },
  ];
  const data2 = [
    { label: '15 Min', value: '900' },
    { label: '30 Min', value: '1800' },
    { label: '1 Hour', value: '3600' },
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
  }

  const getEmail = async () => {
    const email = await AsyncStorage.getItem("userEmail");
    if (email !== null) {
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
    }
  }

  useEffect(() => {


    getIsInMatchMaking()
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

  /*const testData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 20, 45, 28, 80, 99, 43, 20, 45, 28, 80, 99, 43, 20, 45, 28, 80, 99, 43
        ,20, 45, 28, 80, 99, 43,20, 45, 28, 80, 99, 43,20, 45, 28, 80, 99, 43,20, 45, 28, 80, 99, 43,20, 45, 28, 80, 99, 43, 20, 45, 28, 80, 99, 43, 20, 45, 28, 80, 99, 43, 20, 45, 28, 80, 99, 43, 20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
        strokeWidth: 2 // optional
      }
    ],
    legend: ["Rainy Days"] // optional
  };*/


return (
    <View style={[colorScheme=="dark" ? {backgroundColor: "#1b1c30"} : {backgroundColor: "#eee"} , {flex: 1,justifyContent: 'center'}]}>
      <View style={{height: 40, flexDirection: 'row', marginTop: statusBarHeight + 10, marginBottom: 5}}>
        {/*<View style={{flex: 1, marginLeft: 15, justifyContent: 'center'}}>
          <Text style={[colorScheme == "dark" ? {color: '#fff'} : {color: '#000'}, {fontFamily: 'InterTight-Black', fontSize: 24}]}>Home</Text>
          <TouchableOpacity>
            <Icon name={"bars"} size= {25} color={"#fff"} style={colorScheme == "dark" ? {color: '#FFF'} : {backgroundColor: '#000'}}/>
          </TouchableOpacity>
        </View>*/}
        <TouchableOpacity style={{backgroundColor: '#6254ff', alignItems: 'center', justifyContent: 'center', 
           borderRadius: 10, marginLeft: 15, flexDirection: 'row'}}>
          <Text style={{color: 'white', fontFamily: 'InterTight-Black', marginHorizontal: 15}}>Rzonance ({skillRating})</Text>
        </TouchableOpacity>
        <View style={{flex: 1}}></View>
        <TouchableOpacity style={{backgroundColor: '#272743', alignItems: 'center', justifyContent: 'center', 
           borderRadius: 10, marginRight: 15, flexDirection: 'row'}}>
          <Text style={{color: 'white', fontFamily: 'InterTight-Black', marginHorizontal: 15}}>${balance}</Text>
          <View style={{backgroundColor: '#6254ff', height: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
            <Icon name={"plus"} size= {20} color={"#fff"} style={colorScheme == "dark" ? {color: '#FFF'} : {color: '#fff'}}/>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView>
      {/*<ScrollView horizontal={true} style={{marginVertical: 10}}>
        <WagerEarn></WagerEarn>
      </ScrollView>*/}
      <View style={{flex: 1, marginVertical: 5}}>
        <Text style={[colorScheme == "dark" ? {color: '#aaa'}:{color:'#000'}, {fontFamily: 'InterTight-Black', fontSize: 16, marginLeft: 15, marginBottom: 10}]}>My Matches</Text>
     
        <ActiveGames></ActiveGames>
      
        
       {/*} <TouchableOpacity style={[colorScheme == 'dark' ? {backgroundColor: '#6254ff'} : {backgroundColor: '#fff'}, {marginLeft: 15, borderRadius: 6, justifyContent: 'center', alignItems: 'center', flex: 1, shadowColor: 'black', height: 60}]}>
          <Text style={{color: '#fff', fontFamily: 'interTight-Black'}}>Go to Matchmaking</Text>
    </TouchableOpacity>*/}
      
      </View>

      {/*<View style={{height: 2, backgroundColor: '#43436e', marginLeft: 15}}></View>*/}

      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
          <Text style={[colorScheme == "dark" ? {color: '#aaa'}:{color:'#000'}, {fontFamily: 'InterTight-Black', fontSize: 16, marginLeft: 15}]}>Featured Tournaments</Text>
          <View style={{flex: 1}}></View>
          <TouchableOpacity style={{backgroundColor: '#fff', borderRadius: 8, height: 30, width: 100, marginRight: 15, justifyContent:'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'interTight-Black'}}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <TournamentCard name={"Daily Tournament"} entryFee={20} startDate={new Date(2024, 4, 10, 12, 0)}></TournamentCard>
          <TournamentCard name={"Tech Tactics"} entryFee={10} startDate={new Date(2024, 4, 10, 12, 0)}></TournamentCard>
        </ScrollView>
      </View>



      {/*<TouchableOpacity style={{backgroundColor: '#1ae79c', marginHorizontal: 15, borderRadius: 6, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{color: '#1c1e24', fontFamily: 'intertight-black', paddingVertical: 8}}>REFER A FRIEND AND GET A $5 BONUS!</Text>
    </TouchableOpacity>*/}
      {/*<LineChart
        data={testData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
    />*/}



      </ScrollView>
      {/*<View>
        <View style={{flexDirection: 'row', height: 80, gap: 15}}>
          <Dropdown
          style={[darkStyles.dropdown, isFocus && { borderColor: '#6254ff' },
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
          style={[darkStyles.dropdown2, isFocus2 && { borderColor: '#6254ff'}]}
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
        <TouchableOpacity onPress={ () => handleEnterMatchmaking(value, value2)} style={{height: 80, marginBottom: 100, marginHorizontal: 15,justifyContent: 'center', alignItems: 'center'}}>
          <View style={{flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#6254ff', borderRadius: 12}}>
            <Text style={{color: 'white', fontSize: 20, fontFamily: 'InterTight-Black'}}>Enter Matchmaking</Text>
          </View>
        </TouchableOpacity>)}
        {searchingForMatch === true && (
          <TouchableOpacity onPress={cancelAlert} style={{backgroundColor: '#242F42', height: 80, marginBottom: 100, 
          marginHorizontal: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection:'row', gap: 10}}>
          <Text style={{color: 'white', fontSize: 20, fontFamily: 'InterTight-Black'}}>Cancel Matchmaking</Text>
          <ActivityIndicator size="small" color="#1ae79c" />
        </TouchableOpacity>)}

        </View> */}
    </View>
    );
};


const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161d29",
    justifyContent: 'center',
  },
  iconStyle: {
    marginRight: 15,
    height: 30,
    width: 30
  },
  dropdown: {
    flex: 1, 
    marginLeft: 15, 
    marginBottom: 15, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    height: 65,
    borderColor: '#444', 
    borderWidth: 2,
    backgroundColor: '#1c1e24'
  },
  dropdown2: {
    flex: 1, 
    marginRight: 15, 
    marginBottom: 15, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    height: 65,
    borderColor: '#444',
    borderWidth: 2,
    backgroundColor: '#1c1e24'
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
    color: 'white',
    borderRadius: 12
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
    backgroundColor: '#1c1e24'
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
    backgroundColor: '#1c1e24'
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
    color: 'white',
    borderRadius: 12,
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
