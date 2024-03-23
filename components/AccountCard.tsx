import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TouchableWithoutFeedback, Touchable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

var styles = require('../Style/style');

const AccountCard = (props:any) => {

    const colorScheme = useColorScheme();
    const navigation = useNavigation<any>();
    

    return (
        <View style={{flexDirection: 'row'}}>
        <TouchableOpacity style={[colorScheme == 'dark' ? {backgroundColor: '#292929'} : {backgroundColor: '#fff'}, {flex: 1, marginLeft: 12, marginVertical: 15, borderRadius: 12, flexDirection: 'row'}]}>
          <View style={{backgroundColor: '#1ae79c', width: 20, height: '100%', borderTopLeftRadius: 12, borderBottomLeftRadius: 12}}></View>
          <View style={{marginLeft: 15, justifyContent: 'center', marginVertical: 15}}>
            <Text style={{color: '#888888', fontFamily: 'InterTight-Black', fontSize: 14}}>Account Value</Text>
            <Text style={[colorScheme == 'dark' ? {color:'#fff'}:{color:'#000'}, {fontFamily: 'InterTight-Black', fontSize: 24}]}>${props.text}</Text>
            <View style={{backgroundColor: '#0d754f', borderRadius: 12, marginTop: 10}}>
                <Text style={{padding: 10, color: '#1ae79c', fontFamily: 'InterTight-Black', fontSize: 12}}>+$5.67 (10.45%)</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={{flexDirection: 'column', gap: 10, flex: 0.7}}>
            <TouchableOpacity onPress={() => navigation.push("Deposit")} style={{backgroundColor: '#1ae79c', flex: 1, marginHorizontal: 12, marginTop: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontFamily: 'InterTight-Black', fontSize: 14, color: '#000'}}>Deposit</Text>
                
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.push("Withdraw")} style={[colorScheme == 'dark' ? {backgroundColor: '#292929'} : {backgroundColor: '#fff'}, {flex: 1, marginHorizontal: 12, marginBottom: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}]}>
                <View style={{}}>
                    <Text style={[colorScheme == 'dark' ? {color:'#fff'}:{color:'#000'}, {fontFamily: 'InterTight-Black', fontSize: 14}]}>Withdraw</Text>
                </View>
            </TouchableOpacity>
        </View>
        </View>
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

export default AccountCard;