import React, {useState, useEffect, useCallback} from 'react';
import { Platform, Text, View, useColorScheme, NativeModules, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import Icon from 'react-native-vector-icons/FontAwesome';
import {PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk';
import { serverUrl } from '../constants/global';
import axios from 'axios';
 
var styles = require('../Style/style');

const Bank = ({ navigation }: any) => {
    const [linkToken, setLinkToken] = useState("");
    const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
    const { authorize, user } = useAuth0();
    const [accessToken, setAccessToken] = useState("");
    const colorScheme = useColorScheme();

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
        if (linkToken == "") {
          console.log("Getting Link Token")
          createLinkToken();
        }
      }, [user, linkToken, createLinkToken]);

    return (
        <SafeAreaView>
            <View style={{}}>
                <Text>Bank</Text>
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
                <Text style={styles.buttonText}>Link Your Bank</Text>
            </View>
            </PlaidLink>
            </View>
        </SafeAreaView>
    )
}

export default Bank;