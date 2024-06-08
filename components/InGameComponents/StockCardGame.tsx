import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TouchableWithoutFeedback, Touchable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart, LineChart, PieChart, PopulationPyramid } from "react-native-gifted-charts";
import { LineGraph, GraphPoint } from 'react-native-graph';
import axios from 'axios'
import { serverUrl } from '../../constants/global';
import { point } from '@shopify/react-native-skia';


const StockCardGame = (props:any) => {

    const colorScheme = useColorScheme();

    const navigation = useNavigation<any>();

    const [pointData, setPointData] = useState<GraphPoint[]>([])
    const [tickerData, setTickerData] = useState<any>(null)
    const [percentChange, setPercentChange] = useState(0.0);
    const [recentPrice, setRecentPrice] = useState(0.0);

    useEffect(() => {
        const getPrices = async () => {
            try {
                const response = await axios.post(serverUrl + "/getOneDayStockData", {ticker: props.ticker})
            
                if (response) {
               
                    const points: GraphPoint[] = response.data.prices.map((obj:any) => ({
                        value: obj.price,
                        date: new Date(obj.timeField)
                    }));
                    //console.log(points)
                    setPointData(points)
                    setPercentChange(Math.round(((points[points.length-1].value - points[0].value)/points[0].value)*100*100)/100)
                    setRecentPrice(Math.round(points[points.length-1].value*100)/100)
                }
            } catch {
                console.error("error getting prices")
            }
        }

        const getDetails = async () => {
            try {
                const response = await axios.post(serverUrl + "/getTickerDetails", {ticker: props.ticker})
                
                if (response) {
                    setTickerData(response.data)
                }
            } catch {
                console.error("error getting details")
        
            }
        }
        getPrices();
        getDetails();
        
    }, [])
  
    return (
        <View>
        {pointData.length > 0 &&
        <TouchableOpacity onPress={() => navigation.navigate("StockDetailsInGame", {ticker:props.ticker, matchId: props.matchId})} style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
            <View style={{height: 80, backgroundColor: "#111", borderColor: '#444', borderWidth: 2, flex: 1, marginHorizontal: 12, marginVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center'}}>
                <View style={{marginLeft: 20, width: 60}}>
                    <Text style={{color: '#fff', fontFamily: 'InterTight-Black', fontSize: 16}}>{props.ticker}</Text>
                </View>
                <LineGraph
                    style={{flex: 1, height: 40, marginLeft: 20, marginRight: 20}}
                    points={pointData}
                    animated={true}
                    color={percentChange > 0 ? '#1ae79c' : '#e71a1a'}
                    gradientFillColors={percentChange > 0 ? ['#0e8a5c', '#242F42'] : ['#e71a1a', '#242F42']}
                />
                <View style={{marginRight: 10, gap: 5}}>
                    <View style={{backgroundColor: '#e71a1a', borderRadius: 10, width: 90, alignItems: 'center'}}>
                        <Text style={{fontFamily: 'InterTight-Black', fontSize: 16, color:'#fff', paddingVertical: 5}}>${recentPrice/*String(pointData[pointData.length-1].value).split(".")[0] + "." + String(pointData[pointData.length-1].value).split(".")[1].substring(0, 2)*/}</Text>
                    </View>
                    {percentChange > 0 ? 
                    <Text style={{fontFamily: 'InterTight-Black', fontSize: 12, color:'#0e8a5c', textAlign: 'right'}}>+{percentChange}%</Text> 
                    : <Text style={{fontFamily: 'InterTight-Black', fontSize: 12, color:'#e71a1a', textAlign: 'right'}}>{percentChange}%</Text>}
                </View>
                </View>
                <View style={{height: 1, backgroundColor: '#292929'}}></View>
            </View>
        </TouchableOpacity> }
        </View>
    );
};


export default StockCardGame;
