import React, {useState, useEffect, useCallback} from 'react';
import { Platform, View, Text, StyleSheet, Button } from 'react-native';
import {PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk';
import { serverUrl } from '../constants/global';
import axios from 'axios';
import { useAuth0 } from 'react-native-auth0';

var styles = require('../Style/style');

const Plaid = ({ navigation }: any) => {
  const [linkToken, setLinkToken] = useState("");
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
  const { authorize, user } = useAuth0();
  const [balance, setBalance] = useState(null);
  const [accessToken, setAccessToken] = useState("");


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
      console.log("Log Empty Token " + data.link_token)
      setLinkToken(data.link_token);
    })
    .catch((err) => {
      console.log("Error: " + err);
    });
  }, [setLinkToken])

  const fetchData = useCallback(async () => {
    const accessData = {
      email: user!.email
    };

    try {
      const response = await axios.post(serverUrl+'/getAccessFromMongo', accessData);
      console.log("MONGO ACCESS " + response.data )
      setAccessToken(response.data); // Assuming accessToken is in the response data
    } catch (error) {
      console.error('Error fetching access token, user may not have one:', error);
    }
  },[setAccessToken])

  const getBalance = async () => {
    console.log("In bal: " + accessToken)
    const accessData = {
      newAccessToken: accessToken 
    };
    try {
      const balGot = await axios.post(serverUrl+'/Balance', accessData);
      console.log(balGot.data.accounts[0].balances.available) 
    } catch {
      console.error("bal not good!!!")
    }
  }

  useEffect(() => {
    console.log("Logging User's Name: " + user!.name)
    if (linkToken == "") {
      console.log("Getting Link Token")
      createLinkToken();
    }
    fetchData();
    getBalance();
  }, [user, linkToken, createLinkToken,]);
  
  return (
    <View style={{flex: 1}}>
      <View style={styles.heading}>
        <Text style={styles.titleText}>Spar</Text>
      </View>
      <View style={styles.bottom}>
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

            // const accRes = await axios.post(serverUrl+'/accounts', updatingData);
            // console.log("Accres " + accRes)

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
        <Text>Hello</Text>
      </View>
    </View>
  );
};

export default Plaid;