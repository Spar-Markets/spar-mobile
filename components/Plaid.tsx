import { link } from 'fs';
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
  const [balance, setBalance] = useState(0);

  //    Configuration for the Plaid client
  // const config = new Configuration({
  //   basePath: PlaidEnvironments['sandbox'],
  //   baseOptions: {
  //     headers: {
  //       'PLAID-CLIENT-ID': '65833a47f1ae5c001b9d8fee',
  //       'PLAID-SECRET': '3838c18936a0e24249069c952b743a',
  //     },
  //   },
  // });

  // //Instantiate the Plaid client with the configuration
  // const client = new PlaidApi(config);






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

  useEffect(() => {
    console.log("Logging User's Name: " + user!.name)
    if (linkToken == "") {
      console.log("Getting Link Token")
      createLinkToken();
    }
  }, [linkToken]);
  
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
            
            const accessData = {
              newAccessToken: accessToken 
            };

            console.log(accessToken)
            const balGot = await axios.post(serverUrl+'/Balance', accessData);
            console.log("balance " + balGot.data)


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

export default Plaid;