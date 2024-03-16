import { link } from 'fs';
import React, {useState, useEffect, useCallback} from 'react';
import { Platform, View, Text, StyleSheet, Button } from 'react-native';
import {PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk';
import { serverUrl } from '../constants/global';
import axios from 'axios';

var styles = require('../Style/style');

const Plaid = ({ navigation }: any) => {
  const [linkToken, setLinkToken] = useState("");
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';

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
          
          onSuccess={async (success: LinkSuccess) => {
            console.log("This is being printed under the onsuccess" + linkToken)
            
            // Fetching access token
            await fetch(`${serverUrl}/exchangePublicToken`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ public_token: linkToken }),
            })
            .catch((err) => {
              console.log("Error, printing link token: " + linkToken)
              console.log(err);
            });
            // Save the access token to mongo user here?
            console.log("navigate to success")
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