import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './ActiveGames';

var styles = require('../Style/style');

const Profile  = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();
    const [username, setUsername] = useState("jjquaratiello") 
    const handleLogout = useCallback(async () => {
        try {
          // Clear authentication state from AsyncStorage
          await AsyncStorage.removeItem('authData');
          navigation.replace('Onboardscreen1');
        } catch (error) {
          console.error('Error logging out:', error);
        }
    }, [navigation]);

    const [statusBarHeight, setStatusBarHeight] = useState(0);

    const goBack = () => {
        navigation.goBack();
    };

    const goToTransfers = () => {
      navigation.push("Transfers");
    }
  
    useEffect(() => {
      NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
        setStatusBarHeight(response.height);
      });



    });
 

return (
    <View style={[colorScheme == "dark" ? {backgroundColor: '#161d29'} : {backgroundColor: '#fff'}, {flex: 1}]}>
        <View style={{marginTop: statusBarHeight + 10, marginLeft: 12, flexDirection: 'row'}}>
            <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12}]}>
                <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Back</Text>
            </TouchableOpacity>
            <View style={{flex: 1}}></View>
        </View>
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, gap: 10}}>
            <View style={{height: 100, width: 100, backgroundColor: 'red', borderRadius: 100}}></View>
            <TextInput 
              style={{height: 40, color: '#fff', fontFamily: 'InterTight-Black', fontSize: 20}}
              onChangeText={setUsername}
              value={username}
            />
            <TouchableOpacity onPress={handleLogout} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12}]}>
                <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToTransfers} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12}]}>
                <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Transfers</Text>
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
    color: '#ffffff',
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
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'InterTight-Black'
  }
})

export default Profile;