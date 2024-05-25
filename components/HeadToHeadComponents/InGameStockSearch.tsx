import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Animated, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from '../GameCard';
import GameModesScrollBar from '../ActiveGames';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { Pointer } from 'react-native-gifted-charts/src/Components/common/Pointer';
import { LineGraph, GraphPoint } from 'react-native-graph'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StockCardGame from '../HeadToHeadComponents/StockCardGame';
import { Skeleton } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';

const InGameStockSearch = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();
    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [stockSearch, setStockSearch] = useState("");
    Icon.loadFont();
    const [Prop, setProp] = useState(0)
    const goBack = () => {
        navigation.goBack();
    };

    const route = useRoute();

    const activeMatchId = (route.params as {activeMatchId?: string})?.activeMatchId ?? null;
    
    //const socket = new WebSocket('wss://music-api-grant.fly.dev')
    
    /*const data = {
        ticker: route.params?. //'X:BTCUSD'
    };*/

    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });

      /*socket.onopen = () => {
        console.log('Opened');
      };

      socket.onmessage = (event) => {
        console.log('Message received:', event.data);
        setProp(event.data)
      };

      socket.onclose = () => {
        console.log('Connection closed');
      };*/

      console.log(activeMatchId)

    }, []);

    const CategoryButton = (category:string) => {
        return (
        <TouchableOpacity style={{backgroundColor: '#242F42', borderRadius: 10}}>
            <Text style={{color: 'white', fontFamily: 'InterTight-Bold', padding: 10, fontSize: 12}}>{category}</Text>
        </TouchableOpacity>
        )
    }

    return (
  
    <View style={{backgroundColor: '#161d29', flex: 1}}>
            <View style={{flexDirection: 'row',marginHorizontal: 15, marginTop: statusBarHeight + 15}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: 'transparent'} : {backgroundColor: 'transparent'}, {height: 30, alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 10, borderRadius: 12}]}>
                        <Icon name={'chevron-left'} size= {20} color={"#33aaFF"} style={colorScheme == "dark" ? {color: '#FFF'} : {backgroundColor: '#000'}}/>
                        <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {marginHorizontal: 15, fontFamily: 'InterTight-Black', fontSize: 20}]}>Trade</Text>
                </View>
                <View style={{flex: 1}}/>
            </View>
      <TextInput 
        style={{height: 40, color: '#fff', fontFamily: 'InterTight-Black', fontSize: 14, marginHorizontal: 12, marginVertical: 15, backgroundColor: '#242F42', borderRadius: 12, paddingLeft: 10}}
        onChangeText={setStockSearch}
        value={stockSearch}
        placeholder='Search Stocks, Crypto...'
      />
      <View style={{}}>
      {stockSearch == "" ? 
      <View style={{marginHorizontal: 15}}>
        <Text style={{fontFamily: 'InterTight-Black', color: 'white', fontSize: 14}}>Explore by Category</Text>
        <View style={{flexDirection: 'row', gap: 5, marginTop: 15}}>
            {CategoryButton("Artifical Intelligence")}
            {CategoryButton("Semiconductors")}
            {CategoryButton("Biotechnology")}
        </View>
        <View style={{flexDirection: 'row', gap: 5, marginTop: 10}}>
            {CategoryButton("Consumer Discretionary")}
            {CategoryButton("Financials")}
            {CategoryButton("Energy")}
        </View>
      </View> :
        <ScrollView>
            <StockCardGame ticker={"AAPL"} matchId={activeMatchId}></StockCardGame>
        </ScrollView>
      }
      </View>
    </View> 
    
    );
};


export default InGameStockSearch;