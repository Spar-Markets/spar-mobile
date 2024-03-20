import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TouchableWithoutFeedback, Touchable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

var styles = require('../Style/style');

const GameCard = (props:any) => {

    const colorScheme = useColorScheme();

    return (
        <TouchableOpacity style={[colorScheme == 'dark' ? {backgroundColor: '#292929'} : {backgroundColor: '#fff'}, {height: 100, marginHorizontal: 12, borderRadius: 12, marginBottom: 12, flexDirection: 'row'}]}>
          <View style={{backgroundColor: '#3B30B9', width: 20, height: '100%', borderTopLeftRadius: 12, borderBottomLeftRadius: 12}}></View>
          <Text style={[colorScheme == "dark" ? darkStyles.txt : lightStyles.txt, {margin: 10}]}>Amount Wagered: ${props.amountWagered}</Text>
        </TouchableOpacity>
    );
};

const darkStyles = StyleSheet.create({
  txt: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'InterTight-Black'
  },
})

const lightStyles = StyleSheet.create({
  txt: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'InterTight-Black'
  },
})

export default GameCard;