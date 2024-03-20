import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './GameModesScrollBar';

var styles = require('../Style/style');

const Home  = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const colorScheme = useColorScheme();
  const [currStyles, setCurrStyles] = useState(darkStyles);
  const [statusBarHeight, setStatusBarHeight] = useState(0);

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
  }, [colorScheme]);

return (
    <View style={currStyles.container}>
      <View style={{height: 40, flexDirection: 'row', marginTop: statusBarHeight + 10}}>
        <TouchableOpacity onPress={() => navigation.push("Profile")} style={{width: 40, backgroundColor: '#3B30B9', justifyContent: 'center', alignItems: 'center', borderRadius: 24, marginLeft: 12}}>
            <Image source={require('../assets/images/account.png')} resizeMode='contain' style={{flex: 0.6}} />
        </TouchableOpacity>
        <View style={{flex:1.5, justifyContent: 'center', alignItems: 'center'}}></View>
        <TouchableOpacity style={{borderRadius: 24, height: 40, backgroundColor: '#66FEB7', flex: 1, justifyContent: 'center', alignItems: 'center', marginRight: 8}}>
            <Text style={{fontFamily: 'InterTight-Black'}}>Deposit +</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{width: 40, backgroundColor: '#3B30B9', justifyContent: 'center', alignItems: 'center', borderRadius: 24, marginRight: 12}}>
            <Image source={require('../assets/images/noti.png')} resizeMode='contain' style={{flex: 0.6}} />
        </TouchableOpacity>
      </View>
      <View style={[colorScheme == "dark" ? {backgroundColor: '#292929'} : {backgroundColor: '#fff'}, {marginHorizontal: 12, borderRadius: 12}]}>
        <View style={{marginVertical: 15, marginHorizontal: 15, flexDirection: 'row'}}>
          <View>
            <Text style={{color: '#888888', fontSize: 12, fontFamily: 'InterTight-Black'}}>Account Value</Text>
            <Text style={[colorScheme == "dark" ? {color: '#fff'} : {color: '#000'}, {fontSize: 24, fontFamily: 'InterTight-Black'}]}>$1,245.45</Text>
          </View>
          <View>
            
          </View>
        </View>
      </View>
      <ScrollView style={{flex: 1}}>
        <GameModesScrollBar></GameModesScrollBar>
      </ScrollView>
      <TouchableOpacity style={{backgroundColor: '#3B30B9', height: 80, marginBottom: 100, marginHorizontal: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'white', fontSize: 20, fontFamily: 'InterTight-Black'}}>Enter Matchmaking</Text>
      </TouchableOpacity>
    </View>
    );
};

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    justifyContent: 'center',
    gap: 30,
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
    gap: 30,
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