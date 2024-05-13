import React, {useState, useEffect, useCallback} from 'react';
import { Platform, Image, Button, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './ActiveGames';
import Icon from 'react-native-vector-icons/FontAwesome';
import { rgbaColor } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';

import {PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk';
import { serverUrl } from '../constants/global';
import axios from 'axios';
 

var styles = require('../Style/style');

const Profile  = ({ navigation }: any) => {


  const [linkToken, setLinkToken] = useState("");
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
  const { authorize, user } = useAuth0();
  const [balance, setBalance] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState("jjquaratiello") 


  const createLinkToken = useCallback(async () => {
    await fetch(serverUrl+"/createLinkToken", {
    method: "POST",
    headers: {
      "Environment": "sandbox",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ address: address })
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.link_token)
      setLinkToken(data.link_token);
    })
    .catch((err) => {
      console.log("Error: " + err);
    });
  }, [setLinkToken])

  const fetchData = async () => {
    const accessData = {
      email: user!.email
    };

    try {
      const response = await axios.post(serverUrl+'/getAccessFromMongo', accessData);
      console.log("MONGO ACCESS " + response.data )
      setAccessToken(response.data); 
      // Assuming accessToken is in the response data
    } catch (error) {
      console.error('Error fetching access token, user may not have one:', error);
    }
  }

  /*const getBalance = async () => {
    //console.log("In bal: " + accessToken)
    const accessData = {
      newAccessToken: accessToken 
    };
    try {
      const balGot = await axios.post(serverUrl+'/Balance', accessData);
      console.log(balGot.data.accounts[0]) 
    } catch {
      console.error("bal not good!!!")
    }
  }*/




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
  Icon.loadFont();

  const goToTransfers = () => {
    navigation.push("Transfers");
  }

  useEffect(() => {
    NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
      setStatusBarHeight(response.height);
    });
    //console.log("Logging User's Name: " + user!.name)
    if (linkToken == "") {
      console.log("Getting Link Token")
      createLinkToken();
    }
    //fetchData();
    //getBalance();
  }, [user, linkToken, createLinkToken]);

return (
  <View style={[colorScheme == "dark" ? {backgroundColor: '#161d29'} : {backgroundColor: '#fff'}, {flex: 1}]}>
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

        <PlaidLink
          tokenConfig={{
            token: linkToken,
            noLoadingState: false,
          }}
          
          onSuccess={ async (success: LinkSuccess) => {
            console.log("This is being printed under the onsuccess" + linkToken)
            // console.log(success)
            
            // Fetching access token
            const response = fetch(`${serverUrl}/exchangePublicToken`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              public_token: success.publicToken, 
              accounts: success.metadata.accounts,
              institution: success.metadata.institution,
              linkSessionId: success.metadata.linkSessionId,
              }),
            })
            .then(response => response.json()) // Parse the response body as JSON
            .then(async data => {
            // Access the values sent back from the server
            const accessToken = data.access_token;
            const itemId = data.item_id;

            // Save the access token to mongo user here?
 
            const updatingData = {
              email: user!.email,
              newAccessToken: accessToken 
            };

            await axios.post(serverUrl+'/updateUserAccessToken', updatingData);
            console.log("Logging Access Token " + accessToken)
            await AsyncStorage.setItem('plaidAccessToken', accessToken);

          })
            .catch((err) => {
              console.log("Error in Success")
              console.log(err);
            });
  
            //console.log("Navigate to Success")
            //navigation.push('Success', success);
          }}

          onExit={(response: LinkExit) => {
            console.log("On Exit, printing link token " + linkToken)

            console.log(response);
          }}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Open Link</Text>
          </View>
        </PlaidLink>
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