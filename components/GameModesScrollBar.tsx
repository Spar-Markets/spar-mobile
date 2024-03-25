import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';

var styles = require('../Style/style');

const GameModesScrollBar = () => {

    const colorScheme = useColorScheme();
    const [selectedMode, setSelectedMode] = useState("HEAD TO HEAD");
    
    const GameModeButton = (props:any) => {
        const colorScheme = useColorScheme();
        if (selectedMode == props.text) {
            return (
                <TouchableOpacity style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {alignItems: 'center', justifyContent: 'center', borderRadius: 12, height: 40, flex: 1}]} onPress={() => {setSelectedMode(props.text)}}>
                    <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontSize: 12, marginHorizontal: 15,fontFamily: 'InterTight-Black'}]}>{props.text}</Text>
                </TouchableOpacity>
        )} else {
            return (
                <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center', flex: 1}} onPress={() => {setSelectedMode(props.text)}}>
                    <Text style={[colorScheme == "dark" ? {color: '#fff'} : {color: '#000'}, {fontSize: 12, marginHorizontal: 15,fontFamily: 'InterTight-Black'}]}>{props.text}</Text>
                </TouchableOpacity>
            )
        }
    }

    return (
        <View>
            <View style={{height: 40, alignItems: 'center'}}>
                <View style={{flexDirection: 'row', marginHorizontal: 12}}>
                    <GameModeButton text={"HEAD TO HEAD"}></GameModeButton>
                    <GameModeButton text={"TOURNAMENTS"}></GameModeButton>
                </View>
            </View>
            {selectedMode == "HEAD TO HEAD" ? 
                <View>
                    <GameCard ticker={'AAPL'} amountWagered={10} mode={"Stock"}></GameCard> 
                    <GameCard ticker={'X:BTCUSD'} amountWagered={100} mode={"Crypto"}></GameCard> 
                    <GameCard amountWagered={5} mode={"Stock"}></GameCard> 
                </View>
                
                : <View></View>
                
            }
            {selectedMode == "TOURNAMENTS" ? 
                <View></View>
                : <View></View>
                
            }
        </View>
    );
};





export default GameModesScrollBar;