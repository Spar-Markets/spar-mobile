import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './GameModesScrollBar';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import Icon from '@mdi/react';
import { Pointer } from 'react-native-gifted-charts/src/Components/common/Pointer';
import { LineGraph, GraphPoint } from 'react-native-graph'


const TestGraph = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();

    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [currentPrice, setCurrPrice] = useState(0);
    
    const [pointData, setPointData] = useState<GraphPoint[]>([])

    
    const goBack = () => {
        navigation.goBack();
    };

    const data = {
        ticker: 'X:BTCUSD'
    };
    
    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });

        const getPrices = async () => {
            try {
                const response = await axios.post(serverUrl + "/getOneDayStockData", data)
                
                if (response) {
                   
                    const points: GraphPoint[] = response.data.map((obj:any) => ({
                        value: obj.price,
                        date: new Date(obj.timeField)
                    }));

                    console.log(points)

                    setPointData(points)

                }

            } catch {
                console.error("error getting prices")
            }
        }

        getPrices();

    }, []);

  

    /*const points: GraphPoint[] = [
        {
            date: new Date(2024, 1, 1),
            value: 10
        },
        {
            date: new Date(2024, 1, 2),
            value: 15
        },
        {
            date: new Date(2024, 1, 3),
            value: 5
        },
    ];*/
 


    return (
       <View style={{backgroundColor: '#181818', flex: 1}}>
        <View style={{marginTop: statusBarHeight + 10}}>
        <View style={{marginLeft: 15}}>
            <Text style={{fontFamily: 'InterTight-Black', fontSize: 20, color: '#888888'}}>BTC</Text>
            <Text style={{fontFamily: 'InterTight-Black', fontSize: 35, color: '#fff'}}>${currentPrice}</Text>
        </View>
        <LineGraph
            style={{width: '100%', height: 300}}
            points={pointData}
            animated={true}
            color={'#1ae79c'}
            gradientFillColors={['#1ae79c', '#181818']}
            enablePanGesture
            onPointSelected={(p) => setCurrPrice(p.value)}
            onGestureEnd={() => setCurrPrice(pointData[pointData.length - 1].value)}
        />

        </View>
       </View> 
    );
};


export default TestGraph;