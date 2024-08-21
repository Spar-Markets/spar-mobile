import React, {useState, useEffect, useCallback} from 'react';
import { Platform, Text, View, useColorScheme, NativeModules, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk';
import { serverUrl } from '../constants/global';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../GlobalDataManagment/store';
import PageHeader from './GlobalComponents/PageHeader';

import { useTheme } from '../components/ContextComponents/ThemeContext';

var styles = require('../styles/style');

const Bank = ({ navigation }: any) => {
    const [linkToken, setLinkToken] = useState("");
    const [accessTokens, setAccessTokens] = useState([String]);
    const [accountID, setAccountID] = useState("");

    const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';

    const user = useSelector((state: RootState) => state.user)
    const { theme } = useTheme();

    Icon.loadFont();

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

      const getAccessTokens = async () => {
        const accessData = {
          userID: user!.userID
        };
    
        try {
          const response = await axios.post(serverUrl+'/getAccessFromMongo', accessData);
          console.log("Retrieved accesstokens from mongo " + response.data )
          setAccessTokens(response.data); 
          // Assuming accessToken is in the response data
        } catch (error) {
          console.error('Error fetching access token, user may not have one:', error);
        }
      }

    const [statusBarHeight, setStatusBarHeight] = useState(0);
    
    Icon.loadFont();
  
      const accounts = async  () =>  { 
        console.log("prior to getting accounts", accessTokens)
      
          const accessData = {
          accessToken: accessTokens
        };
        try {
          const response = await axios.post(serverUrl+'/getAccount', accessData);
          console.log( response.data.data.accounts )
          const accountsData = response.data.data.accounts;
          const accountID = accountsData[0].account_id; // Access the account_id of the first account

          setAccountID(accountID)

        } catch (error) {
          console.error('Error fetching accounts:', error);
        }
      }


    useEffect(() => {
      NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
        setStatusBarHeight(response.height);
      });
      if (linkToken == "") {
        console.log("Getting Link Token")
        createLinkToken();

      }
      getAccessTokens()

    }, [])
    
    useEffect(() => {
      if (accessTokens.length === 1 && accessTokens[0] === String) {

      } else {
        accounts();

      }
  }, [linkToken]); // Run accounts only when accessTokens is set



    return (
        <SafeAreaView>
            <View>

                <Text>Bank</Text>
                <PlaidLink
                  tokenConfig={{
                      token: linkToken,
                      noLoadingState: false,
                  }}
                  onSuccess={ async (success: LinkSuccess) => {

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
                    //email: user!.email,
                      accessToken: accessToken,
                      userID: user.userID,
                      bankName: success.metadata.institution
                    };



                    await axios.post(serverUrl+'/uploadUserAccessToken', updatingData);

                    console.log("Logging Access Token " + accessToken)
                    // Call the function to get user's accesstokens to update the client with the most recent ones 
                    getAccessTokens()
                  })  
                    .catch((err) => {
                    console.log("Error in Success")
                    console.log(err);
                    });
                  }}
                  onExit={(response: LinkExit) => {
                      console.log("On exit, printing link token " + linkToken)
                      console.log(response);
                  }}>
                  <View style={styles.buttonContainer}>
                    <Text style={styles.buttonText}>Link Your Bank</Text>
                  </View>
                </PlaidLink>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Deposit', {accountID: accountID,accessTokens: accessTokens})}>
                <Text style={{color: theme.colors.opposite, padding: 30, backgroundColor: theme.colors.accent3}}>Deposit</Text>
              </TouchableOpacity>


        </SafeAreaView>
    )
}

export default Bank;