import React, {useState, useEffect, useCallback} from 'react';
import { Pressable, Platform, Image, Button, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TextInput, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon from 'react-native-vector-icons/FontAwesome';
import CircularProgress from 'react-native-circular-progress-indicator';
import { SvgXml } from 'react-native-svg';
import { serverUrl } from '../../constants/global';
import axios from 'axios';
 
const Profile  = ({ navigation }: any) => {
  const [linkToken, setLinkToken] = useState("");
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
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

  // This wasn't being used 
  // const fetchData = async () => {
  //   const accessData = {
  //     email: user!.email
  //   };

  //   try {
  //     const response = await axios.post(serverUrl+'/getAccessFromMongo', accessData);
  //     console.log("MONGO ACCESS " + response.data )
  //     setAccessToken(response.data); 
  //     // Assuming accessToken is in the response data
  //   } catch (error) {
  //     console.error('Error fetching access token, user may not have one:', error);
  //   }
  // }

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
  }, [linkToken, createLinkToken]);

  const profilePlusSvgCode = `<svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16.5" cy="16.5" r="15.5" fill="#161D29"/>
  <path d="M16.25 29.25C9.08375 29.25 3.25 23.4163 3.25 16.25C3.25 9.08375 9.08375 3.25 16.25 3.25C23.4163 3.25 29.25 9.08375 29.25 16.25C29.25 23.4163 23.4163 29.25 16.25 29.25ZM16.25 0C14.116 0 12.0029 0.420319 10.0314 1.23696C8.05985 2.0536 6.26847 3.25056 4.75951 4.75951C1.71205 7.80698 0 11.9402 0 16.25C0 20.5598 1.71205 24.693 4.75951 27.7405C6.26847 29.2494 8.05985 30.4464 10.0314 31.263C12.0029 32.0797 14.116 32.5 16.25 32.5C20.5598 32.5 24.693 30.788 27.7405 27.7405C30.788 24.693 32.5 20.5598 32.5 16.25C32.5 14.116 32.0797 12.0029 31.263 10.0314C30.4464 8.05985 29.2494 6.26847 27.7405 4.75951C26.2315 3.25056 24.4401 2.0536 22.4686 1.23696C20.4971 0.420319 18.384 0 16.25 0ZM17.875 8.125H14.625V14.625H8.125V17.875H14.625V24.375H17.875V17.875H24.375V14.625H17.875V8.125Z" fill="white"/>
  </svg>`

return (
  <SafeAreaView style={[colorScheme == "dark" ? {backgroundColor: '#161d29'} : {backgroundColor: '#fff'}, {flex: 1}]}>
    <ScrollView>
      <View style={{justifyContent: 'flex-start', alignItems: 'center', flex: 1, gap: 10, paddingTop: 15}}>
        <Pressable style={{
          position: 'absolute',
          top: 8,
          right: 25
        }}>
          <Icon
              name="bars"
              style={{
                color: '#fff',
              }}
              size={33}
            />
        </Pressable>
          <Image
            source={require('../../assets/images/joe_cute.jpg')}
            style={{height: 125, width: 125, borderRadius: 100}}
          />
          <SvgXml
            xml={profilePlusSvgCode}
            height="34"
            width="34"
            style={{
              position: 'absolute',
              top: 110, // Adjust this value to position the image correctly
              left: 240 // Adjust this johnson to position the image correctly
            }}
          />
          {/* <TextInput 
            style={{height: 40, color: '#fff', fontFamily: 'InterTight-Black', fontSize: 20}}
            onChangeText={setUsername}
            value={username}
          /> */}
          <Text style={{height: 40, color: '#fff', fontFamily: 'InterTight-Black', fontSize: 24, lineHeight: 0}}>@{username}</Text>
          <Text style={{color: '#888888', fontFamily: 'InterTight-Black', fontSize: 19, marginTop: -15, marginBottom: 20}}>Joined 2024</Text>
          {/* <TouchableOpacity onPress={handleLogout} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12}]}>
              <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToTransfers} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12}]}>
              <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Transfers</Text>
          </TouchableOpacity> */}
          <CircularProgress
            value={84}
            radius={120}
            activeStrokeWidth={26}
            inActiveStrokeWidth={26}
            progressValueColor={'#6254FF'}
            inActiveStrokeColor='#312B7D'
            activeStrokeColor={'#6254FF'}
            showProgressValue={false}
            title={"Silver"}
            subtitle={"85% to Gold"}
            titleStyle={{
              color: '#FFFFFF',
              fontWeight: "800",
              fontSize: 40,
              marginTop: 39
            }}
            subtitleStyle={{
              color: '#888888',
              fontWeight: "800",
              fontSize: 18
            }}
          />
          <Image
            source={require('../../assets/images/silverbadge.png')}
            style={{
              position: 'absolute',
              height: 70,
              width: 100,
              top: 282, // Adjust this value to position the image correctly
            }}
            resizeMode="contain"
          />
          <View style={{alignSelf: "stretch", marginLeft: 20, marginTop: 10}}>
            <Text
              style={{
                color: '#FFFFFF',
                fontWeight: "900",
                fontSize: 30,
                textAlign: 'left'
              }}
            >Summary</Text>
            <View style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: 100}}>
              <View style={darkStyles.achievementContainer}>
                <Text style={darkStyles.achievementLabel}>Lifetime Wins</Text>
                <Text style={darkStyles.achievement}>35</Text>
              </View>
              <View style={darkStyles.achievementContainer}>
                <Text style={darkStyles.achievementLabel}>Best Trade</Text>
                <Text style={darkStyles.achievement}>+57%</Text>
              </View>
              <View style={darkStyles.achievementContainer}>
                <Text style={darkStyles.achievementLabel}>Longest Win Streak</Text>
                <Text style={darkStyles.achievement}>7</Text>
              </View>
              <View style={darkStyles.achievementContainer}>
                <Text style={darkStyles.achievementLabel}>Most Traded</Text>
                <Text style={darkStyles.achievement}>AAPL</Text>
              </View>
              <View>
                <Text style={darkStyles.achievementLabel}>Ranking Among Friends</Text>
                <Text style={darkStyles.achievement}>#3</Text>
              </View>
            </View>
          </View>

        {/* <PlaidLink
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
        </PlaidLink> */}
      </View>
    </ScrollView>
  </SafeAreaView>
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
},
achievementLabel: {
  color: '#999999',
  fontWeight: "900",
  fontSize: 19,
  textAlign: 'left',
  marginTop: 15,
},
achievement: {
  color: '#fff',
  fontWeight: "900",
  fontSize: 43,
  textAlign: 'left',
  marginTop: 2
},
achievementContainer: {
  width: '50%'
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