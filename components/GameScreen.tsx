import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './ActiveGames';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import Icon from 'react-native-vector-icons/FontAwesome';

const GameScreen = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();
    const route = useRoute();

    const [statusBarHeight, setStatusBarHeight] = useState(0);
    
    const goBack = () => {
        navigation.goBack();
    };

    const mode = (route.params as { mode?: string })?.mode ?? ''
    const amountWagered = (route.params as { amountWagered?: number})?.amountWagered ?? 0
    const endDate = (route.params as { endDate?: number})?.endDate ?? 0;
    
    const calculateTimeRemaining = (endDate:Date) => {
        const endDateTime = new Date(endDate).getTime();
        const currentTime = new Date().getTime();
        
        const timeRemaining = Math.max(0, endDateTime - currentTime); // Ensure time remaining doesn't go negative
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  
        const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
        // Format minutes with leading zero if necessary
        const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        // Format seconds with leading zero if necessary
        const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        
        
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
      };
  
      const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(new Date(endDate)))
      
      useEffect(() => {
        const timer = setInterval(() => {
          setTimeRemaining(calculateTimeRemaining(new Date(endDate)))
          if (timeRemaining == "0:0:0") {
            //fix format of time
            //run axios post to remove match from matches and distribute winnings. add to past matches collection
          }
        }, 1000);
        return () => clearInterval(timer)
      }, [endDate])
    
  
    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });
     
    }, []);

return (
        
    <View style={[colorScheme == "dark" ? {backgroundColor: "#161d29"} : {backgroundColor: '#fff'}, {flex: 1}]}>
        <View style={{marginTop: statusBarHeight + 10, marginHorizontal: 15, flex: 1}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: 'transparent'} : {backgroundColor: 'transparent'}, {height: 30, alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 10, borderRadius: 12}]}>
                        <Icon name={'chevron-left'} size= {20} color={"#33aaFF"} style={colorScheme == "dark" ? {color: '#FFF'} : {backgroundColor: '#000'}}/>
                        <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {marginHorizontal: 15, fontFamily: 'InterTight-Black', fontSize: 20}]}>{timeRemaining}</Text>
                </View>
                <View style={{flex: 1}}/>
            </View>
            <View style={{height: 200, backgroundColor:'#242F42', marginTop: 15, borderRadius: 12}}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{marginLeft: 15, marginTop: 15, gap: 5}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                            <View style={{backgroundColor: '#1ae79c', width: 10, height: 10, borderRadius: 15}}></View>
                            <Text style={{fontFamily: 'InterTight-Black', color: '#fff', fontSize: 12}}>You</Text>
                        </View>
                        <Text style={{fontFamily: 'InterTight-Black', color: '#fff', fontSize: 18}}>$105,430.00</Text>
                        <View style={{backgroundColor: '#1ae79c', alignItems: 'center', justifyContent: 'center', borderRadius: 4, height: 20, width: 60}}>
                            <Text style={{fontFamily: 'InterTight-SemiBold'}}>5.43%</Text>
                        </View>
                    </View>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontFamily: 'InterTight-Bold', color: 'gray'}}>vs.</Text>
                    </View>
                    <View style={{marginRight: 15, marginTop: 15, gap: 5, alignItems: 'flex-end'}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                            <View style={{backgroundColor: 'gray', width: 10, height: 10, borderRadius: 15}}></View>
                            <Text style={{fontFamily: 'InterTight-Black', color: '#fff', fontSize: 12}}>Drinks</Text>
                        </View>
                        <Text style={{fontFamily: 'InterTight-Black', color: '#fff', fontSize: 18}}>$103,890.00</Text>
                        <View style={{backgroundColor: 'gray', alignItems: 'center', justifyContent: 'center', borderRadius: 4, height: 20, width: 60}}>
                            <Text style={{fontFamily: 'InterTight-SemiBold'}}>3.89%</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{flex: 1}}></View>
            <TouchableOpacity  style={{backgroundColor: '#6254ff', height: 80, marginBottom: 30, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: 'white', fontSize: 20, fontFamily: 'InterTight-Black'}}>Trade</Text>
            </TouchableOpacity>
        </View>  
    </View>
    );
};

const darkStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginBottom: 10
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        padding: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 30,
        fontFamily: 'InterTight-Bold'
    }
})

const lightStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginBottom: 10
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        padding: 15,
    },
    buttonText: {
        color: '#000',
        fontSize: 30,
        fontFamily: 'InterTight-Bold'
    }
})

export default GameScreen;