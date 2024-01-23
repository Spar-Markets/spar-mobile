import { link } from 'fs';
import React, {useState, useEffect, useCallback} from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import {PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk';
import { serverUrl } from '../constants/global';
import axios from 'axios';

var styles = require('./style');

const HomeScreen = ({ navigation }: any) => {
  const [linkToken, setLinkToken] = useState("");
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';

  const createLinkToken = useCallback(async () => {
    console.log("linkinitiative")
    await fetch(serverUrl+"/createLinkToken", {
    method: "POST",
    headers: {
      "Environment":"sandbox",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ address: address })
    })
    .then((response) => response.json())
    .then((data) => {
      
      console.log("log empty " + data.link_token)
      setLinkToken(data.link_token);
    })
    .catch((err) => {
      console.log("hello" + err);
    });
  }, [setLinkToken])

  useEffect(() => {
    if (linkToken == "") {
      console.log("GettingLinkToken")
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
            token: linkToken, // Add the environment name (sandbox) here
            noLoadingState: false,
          }}
          
          onSuccess={async (success: LinkSuccess) => {
            console.log(linkToken)
            await fetch(`${serverUrl}/exchangePublicToken`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ public_token: success.publicToken }),
            })
            .catch((err) => {
              console.log("ello" + linkToken)
              console.log(err);
            });
            navigation.navigate('Success', success);
          }}
          onExit={(response: LinkExit) => {
            console.log("rahh" + linkToken)

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

export default HomeScreen;