import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import { serverUrl } from '../constants/global';
import axios from 'axios'
import { Skeleton } from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';

const ActiveGames = (props:any) => {

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
    const [isLoading, setIsLoading] = useState(true);
    
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
        <View style={{flex: 1}}>
            {/*<View style={{height: 40, alignItems: 'center'}}>
                <View style={{flexDirection: 'row', marginHorizontal: 15}}>
                    <GameModeButton text={"HEAD TO HEAD"}></GameModeButton>
                    <GameModeButton text={"TOURNAMENTS"}></GameModeButton>
                </View>
            </View>*/}
            <ScrollView style={{marginTop: 0}} horizontal={true} showsHorizontalScrollIndicator={false}>
                   {/* <TouchableOpacity style={{marginBottom: 10, flexDirection: 'row'}}>
                        <View style={[colorScheme == 'dark' ? {backgroundColor: '#6254ff'} : {backgroundColor: '#fff'}, {marginLeft: 15, borderRadius: 6, justifyContent: 'center', alignItems: 'center', flex: 1, shadowColor: 'black', height: 200, width: 100}]}>
                            <View style={{width: 80, height: 80, borderRadius: 50, justifyContent: 'center', alignItems: 'center'}}>
                                <Icon name={"plus"} size= {36} color={"#fff"} style={colorScheme == "dark" ? {color: '#fff'} : {color: '#fff'}}/>
                            </View>
                        </View>
        </TouchableOpacity>*/}
                {matchData.length > 0 ? 
                matchData.map((item, index) => (
               
                    <View key={index} style={{flexDirection: 'row'}}>
                        {item && 'wagerAmt' in item && 'user1' in item && (
                        <GameCard amountWagered={item!.wagerAmt} mode={"Stock"} idIndex={index}
                        yourPercentChange={3.54} opp={item!.user1.name.split("@")[0]} oppPercentChange={1.56}
                        endDate={new Date(2024, 4, 10, 12, 0)}></GameCard> 
                        )}
                    </View>
                
                ))
                : 
                <View style={{marginHorizontal: 15}}>
                 <Skeleton
                    animation="pulse"
                    style={{height: 120, borderRadius: 12, flex: 1, backgroundColor: '#242F42'}}
                    LinearGradientComponent={() => 
                        <LinearGradient
                          colors={['#242F42', '#374c70']} // Example gradient colors, adjust as needed
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 12,
                          }}
                        />
                    
                      }
                />
                 <Skeleton
                    animation="pulse"
                    style={{marginTop: 10, height: 120, borderRadius: 12, flex: 1, backgroundColor: '#242F42'}}
                    LinearGradientComponent={() => 
                        <LinearGradient
                          colors={['#242F42', '#374c70']} // Example gradient colors, adjust as needed
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 12,
                          }}
                        />
                    
                      }
                />
                 <Skeleton
                    animation="pulse"
                    style={{marginTop: 10, height: 120, borderRadius: 12, flex: 1, backgroundColor: '#242F42'}}
                    LinearGradientComponent={() => 
                        <LinearGradient
                          colors={['#242F42', '#374c70']} // Example gradient colors, adjust as needed
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 12,
                          }}
                        />
                    
                      }
                />
                </View>
                
            }
            {selectedMode == "TOURNAMENTS" ? 
                <View></View>
                : <View></View>
                
            }
            </ScrollView>
        </View>
    );
};





export default ActiveGames;