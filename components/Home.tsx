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
import { Dropdown } from 'react-native-element-dropdown';

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

  const data = [
    { label: '$10', value: '10' },
    { label: '$20', value: '20' },
    { label: '$30', value: '30' },
  ];
  const data2 = [
    { label: '1 Day', value: '1 Day' },
    { label: '1 Week', value: '1 Week' },
    { label: '1 Month', value: '1 Month' },
  ];
  
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
      <ScrollView style={{flex: 1}}>
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
    fontSize: 20,
    color: 'white',
    paddingLeft: 20,
    fontFamily: 'InterTight-Black'
  },
  itemsContainer: {
    backgroundColor: '#181818',
    color: 'white'
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
    fontSize: 16,
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
