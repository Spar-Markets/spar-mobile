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
import Icon from '@mdi/react';



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
  
    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });
     
    }, []);

return (
        
    <View style={[colorScheme == "dark" ? {backgroundColor: "#161d29"} : {backgroundColor: '#fff'}, {flex: 1}]}>
        <View style={{marginTop: statusBarHeight + 10, marginHorizontal: 15}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, width: 60, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12}]}>
                        <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Back</Text>
                        {/*<Icon path={mdiChevronLeft}/>*/}
                    </TouchableOpacity>
                </View>
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {marginHorizontal: 15, fontFamily: 'InterTight-Black', fontSize: 20}]}>{}</Text>
                </View>
                <View style={{flex: 1}}/>
            </View>
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