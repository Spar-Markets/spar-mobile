

import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TouchableWithoutFeedback, Touchable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GraphPoint, LineGraph } from 'react-native-graph';
import { serverUrl } from '../constants/global';
import axios from 'axios'
import LinearGradient from 'react-native-linear-gradient';


const StockDetailGraph = (props:any) => {

    const colorScheme = useColorScheme();
    const navigation = useNavigation<any>();

    const [pointData, setPointData] = useState<GraphPoint[]>([])

    const [touchableWidth, setTouchableWidth] = useState(0);

    const [currPrice, setCurrPrice] = useState("")

    const [currDate, setCurrDate] = useState("")

    const updateVals = (obj:any) => {
        if (String(obj.value).includes(".") == false) {
            setCurrPrice(String(obj.value) + ".00")
        } else if (String(obj.value).split(".")[1].length == 1) {
            setCurrPrice(String(obj.value) + 0)
        } else {
            setCurrPrice(String(obj.value))
        }
        //setCurrDate(String(obj.date.toLocaleTimeString("en-US")))
    }

    useEffect(() => {
        const getPrices = async () => {
            try {
                const response = await axios.post(serverUrl + "/getMostRecentOneDayPrices", [props.ticker])
                
                console.log("here we have the api response:", response)

                // Check if response is successful and has data
                if (response && response.data && response.data[props.ticker]) {
                    const tickerData = response.data[props.ticker]
                    console.log("Here's the stock prices", tickerData);
    
                    // Map the data to the format expected by the graphing library
                    const points = tickerData.map(tickerData => ({
                        value: tickerData.price,
                        date: new Date(tickerData.timeField)
                    })); 
    
                    setPointData(points);
                }
            } catch (error){  
                console.error(error, "error getting prices")
            }
        }
        getPrices();
      

    }, []);
    
    return (
    <View>
    
    <LinearGradient colors={['#222', '#333', '#444']} style={{marginHorizontal: 15, borderColor: '#444', borderWidth: 2, borderRadius: 12}}>
    <View style={{marginLeft: 15, marginTop: 15}}>
    <Text style={{color: '#888888', fontFamily: 'InterTight-SemiBold', fontSize: 14}}>{props.ticker}</Text>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={[colorScheme == 'dark' ? {color:'#fff'}:{color:'#000'}, {fontFamily: 'InterTight-Black', fontSize: 24}]}>${currPrice}</Text>
        <View style={{backgroundColor: '#1ae79c', borderRadius: 5, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, marginLeft: 10, height: 20}}>
            <Text style={{color: '#242F42', fontFamily: 'InterTight-Bold', fontSize: 12}}>+5.55%</Text>
        </View>
    </View>
    </View>
    <LineGraph
    style={{height: 150, marginBottom: 15}}
    points={pointData}
    animated={true}
    color={'#1ae79c'}
    //gradientFillColors={['#0e8a5c', '#444']}
    enablePanGesture
    onPointSelected={(p) => updateVals(p)}
    enableIndicator={true}
    indicatorPulsating={true}
    lineThickness={3}
    horizontalPadding={0}
    //onGestureEnd={() => setCurrPrice(String(pointData[pointData.length - 1].value))}
    />
    </LinearGradient>
    </View>
    );
};



export default StockDetailGraph;
