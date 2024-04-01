import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Animated, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './ActiveGames';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import { Pointer } from 'react-native-gifted-charts/src/Components/common/Pointer';
import { LineGraph, GraphPoint } from 'react-native-graph'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StockCard from './StockCard';
import { Skeleton } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';

const StockSearch = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();
    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [stockSearch, setStockSearch] = useState("");
    Icon.loadFont();
    
    const goBack = () => {
        navigation.goBack();
    };

    /*const data = {
        ticker: route.params?. //'X:BTCUSD'
    };*/
    
    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });


    }, []);


    return (

    
    <View style={{backgroundColor: '#161d29', flex: 1}}>
    
      <View style={{height: 40, flexDirection: 'row', marginTop: statusBarHeight + 10}}>
        <View style={{flex: 1, marginLeft: 12, justifyContent: 'center'}}>
          <Text style={[colorScheme == "dark" ? {color: '#fff'} : {color: '#000'}, {fontFamily: 'InterTight-Black', fontSize: 24}]}>Stocks</Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', gap: 5}}>
          <View style={{flex: 1}}></View>
          <TouchableOpacity onPress={() => navigation.push("Profile")} style={{width: 40, backgroundColor: '#3B30B9', justifyContent: 'center', alignItems: 'center', borderRadius: 12}}>
            {/*<Image source={require('../assets/images/account.png')} resizeMode='contain' style={{flex: 0.6}} />*/}
            <Icon name="user" size={20} color="#ffffff" />

          </TouchableOpacity>
          <TouchableOpacity style={{width: 40, backgroundColor: '#3B30B9', justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginRight: 12}}>
            {/*<Image source={require('../assets/images/noti.png')} resizeMode='contain' style={{flex: 0.6}} />*/}
          </TouchableOpacity>
        </View>
      </View>
      <TextInput 
        style={{height: 40, color: '#fff', fontFamily: 'InterTight-Black', fontSize: 14, marginHorizontal: 12, marginVertical: 15, backgroundColor: '#242F42', borderRadius: 12, paddingLeft: 10}}
        onChangeText={setStockSearch}
        value={stockSearch}
        placeholder='Search Stocks, Crypto...'
      />
      <ScrollView>
        <StockCard ticker={"AAPL"}></StockCard>
        <StockCard ticker={"TSLA"}></StockCard>
        <StockCard ticker={"NVDA"}></StockCard>
        <StockCard ticker={"NNDM"}></StockCard>
        <StockCard ticker={"GOOG"}></StockCard>
        <StockCard ticker={"AVGO"}></StockCard>
      </ScrollView>
        
    </View> 
    
    );
};


export default StockSearch;