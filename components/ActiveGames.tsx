import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import { serverUrl } from '../constants/global';
import axios from 'axios'

const GameModesScrollBar = () => {

    interface MatchData {
        wagerAmt: number;
        user1: {
            name: string;
            assets: [string]
        };
        user2: {
            name: string;
            assets: [string]
        };
        createdAt: Date;
        
    }

    const colorScheme = useColorScheme();
    const [selectedMode, setSelectedMode] = useState("HEAD TO HEAD");
    const [activeMatches, setActiveMatches] = useState([]);
    const [hasMatches, setHasMatches] = useState(false); 
    const [matchData, setMatchData] = useState<MatchData[]>([])
    
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
    const fetchMatchIds = async (email:String) => {
        try {
            const response = await axios.post(serverUrl + "/getUserMatches", { email: email });
            //console.log("Matches: ", response.data);
            setActiveMatches(response.data);
        } catch (error) {
            console.error("Error fetching matches:", error);
        } 
    }
    
    const getMatches = async () => {
        try {
            const userEmail = await AsyncStorage.getItem('userEmail');
            if (userEmail) {
                await fetchMatchIds(userEmail);
            } else {
                console.log("User email not found in AsyncStorage");
            }
        } catch (error) {
            console.error("Error getting user email from AsyncStorage:", error);
        }

        /*try {
            for (const id of activeMatches) {
                const matchData = await axios.post(serverUrl + "/getMatchData", { matchId: id })
            }
        }*/
    }
    
    useEffect(() => {
        getMatches()
    }, []);

    useEffect(() => {
        if (activeMatches.length > 0) {
            const getMatchData = async () => {
                try {
                    const md = [];
                    for (const id of activeMatches) {
                        const matchDataResponse = await axios.post(serverUrl + "/getMatchData", { matchId: id })
                        md.push(matchDataResponse.data)
                    }
                    console.log(md)
                    setMatchData(md);
                } catch {

                }
            }
            getMatchData();
        } else {
            console.log("hello")
        }
    }, [activeMatches])

    const calculateTimeRemaining = (endDate:Date) => {
        const endDateTime = new Date(endDate).getTime();
        const currentTime = new Date().getTime();
        
        const timeRemaining = endDateTime - currentTime;
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
        return `${hours}:${minutes}:${seconds}`;
    }

    return (
        <View>
            <View style={{height: 40, alignItems: 'center'}}>
                <View style={{flexDirection: 'row', marginHorizontal: 15}}>
                    <GameModeButton text={"HEAD TO HEAD"}></GameModeButton>
                    <GameModeButton text={"TOURNAMENTS"}></GameModeButton>
                </View>
            </View>

            <ScrollView style={{marginTop: 10, minHeight: 500}}>
            {selectedMode == "HEAD TO HEAD" ? matchData.map((item, index) => (
                <View key={index}>
                    {item && 'wagerAmt' in item && 'user1' in item && (
                    <GameCard amountWagered={item!.wagerAmt} mode={"Stock"} 
                    yourPercentChange={3.54} opp={item!.user1.name.split("@")[0]} oppPercentChange={1.56}
                    endDate={new Date(2024, 2, 28, 17, 0)}></GameCard> 
                    )}
                </View>
            ))
                
                : <View></View>
                
            }
            {selectedMode == "TOURNAMENTS" ? 
                <View></View>
                : <View></View>
                
            }
            </ScrollView>
        </View>
    );
};





export default GameModesScrollBar;