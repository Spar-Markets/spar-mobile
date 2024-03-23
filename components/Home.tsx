import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './GameModesScrollBar';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import AccountCard from './AccountCard';





const Home  = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const colorScheme = useColorScheme();
  const [currStyles, setCurrStyles] = useState(darkStyles);
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [balance, setBalance] = useState("0.00");

  



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

  useEffect(() => {
    
    setCurrStyles(colorScheme == "dark" ? darkStyles : lightStyles);
    NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
      setStatusBarHeight(response.height);
    });
    getBalance();
  }, [colorScheme]);


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
          <TouchableOpacity style={[colorScheme == 'dark' ? {backgroundColor: '#292929'} : {backgroundColor: '#fff'}, {flex: 1, marginLeft: 12, marginBottom: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}]}>
                <View style={{}}>
                    <Text style={[colorScheme == 'dark' ? {color:'#fff'}:{color:'#000'}, {fontFamily: 'InterTight-Black', fontSize: 14}]}>Entry Fee</Text>
                </View>
          </TouchableOpacity>
          <TouchableOpacity style={[colorScheme == 'dark' ? {backgroundColor: '#292929'} : {backgroundColor: '#fff'}, {flex: 1, marginRight: 12, marginBottom: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}]}>
                <View style={{}}>
                    <Text style={[colorScheme == 'dark' ? {color:'#fff'}:{color:'#000'}, {fontFamily: 'InterTight-Black', fontSize: 14}]}>Match Length</Text>
                </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{backgroundColor: '#3B30B9', height: 80, marginBottom: 100, marginHorizontal: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: 'white', fontSize: 20, fontFamily: 'InterTight-Black'}}>Enter Matchmaking</Text>
        </TouchableOpacity>
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
  buttonTxt: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'InterTight-Black'
  }
})

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E6E6",
    justifyContent: 'center',
  },
  mainTxt: {
    color: '#181818',
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
  buttonTxt: {
    color: '#E6E6E6',
    fontSize: 20,
    fontFamily: 'InterTight-Black'
  }
})

export default Home;