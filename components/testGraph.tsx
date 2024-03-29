import React, {useState, useEffect, useCallback} from 'react';
import { Image, ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './ActiveGames';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import Icon from '@mdi/react';
import { Pointer } from 'react-native-gifted-charts/src/Components/common/Pointer';
import { LineGraph, GraphPoint } from 'react-native-graph'
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const TestGraph = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();

    const route = useRoute();

    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [currentPrice, setCurrPrice] = useState("");
    const [currentDate, setCurrDate] = useState("");
    const [range, setRange] = useState({})
    
    const [pointData, setPointData] = useState<GraphPoint[]>([])
    const [ticker, setTicker] = useState("");

    const [timeFrameSelected, setTimeFrameSelected] = useState("1D")
    const [tickerData, setTickerData] = useState<any>(null)

    
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
        const getPrices = async () => {
            try {
                const response = await axios.post(serverUrl + "/getOneDayStockData", route.params)
                
                if (response) {
                   
                    const points: GraphPoint[] = response.data.prices.map((obj:any) => ({
                        value: obj.price,
                        date: new Date(obj.timeField)
                    }));

                    setPointData(points)

                    setTicker(response.data.ticker)

                    setCurrPrice(String(points[points.length-1].value))
                    setCurrDate(points[points.length-1].date.toLocaleTimeString("en-US"))

                    

                }

                const tickerResponse = await axios.post(serverUrl + "/getTickerDetails", route.params);

                if (tickerResponse) {
                    setTickerData(tickerResponse.data)
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
 
    const updateVals = (obj:any) => {
        if (String(obj.value).includes(".") == false) {
            setCurrPrice(String(obj.value) + ".00")
        } else if (String(obj.value).split(".")[1].length == 1) {
            setCurrPrice(String(obj.value) + 0)
        } else {
            setCurrPrice(String(obj.value))
        }
        setCurrDate(String(obj.date.toLocaleTimeString("en-US")))
    }

    const TimeButton = (timeFrame:string) => {
        return (
        <View>
        {timeFrameSelected == timeFrame ?
        <TouchableOpacity onPress={() => setTimeFrameSelected(timeFrame)} style={{backgroundColor: '#1ae79c', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginHorizontal: 5}}>
            <Text style={{color:'#181818', paddingHorizontal: 10, paddingVertical: 5, fontFamily: 'InterTight-Black', fontSize: 15}}>{timeFrame}</Text>
        </TouchableOpacity> : 
        <TouchableOpacity onPress={() => setTimeFrameSelected(timeFrame)} style={{backgroundColor: '#181818', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginHorizontal: 5}}>
            <Text style={{color:'#1ae79c', paddingHorizontal: 10, paddingVertical: 5, fontFamily: 'InterTight-Black', fontSize: 15}}>{timeFrame}</Text>
        </TouchableOpacity>
        }
        </View>
        )
    }

    return (
        

       <View style={{backgroundColor: '#181818', flex: 1}}>
        {pointData.length > 0 ?
        <View style={{marginTop: statusBarHeight + 10, flex: 1}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, marginLeft: 12, width: 60, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginBottom: 10}]}>
                        <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Back</Text>
                        {/*<Icon path={mdiChevronLeft}/>*/}
                    </TouchableOpacity>
                </View>
                
                <View style={{flex: 1}}/>
            </View>
        <ScrollView style={{}}>
        <View style={{marginLeft: 12, marginTop: 20}}>
            <Text style={{fontFamily: 'InterTight-Black', fontSize: 20, color: '#888888'}}>{ticker}</Text>
            <Text style={{fontFamily: 'InterTight-Black', fontSize: 35, color: '#fff'}}>${currentPrice}</Text>
            <Text style={{fontFamily: 'InterTight-Black', fontSize: 20, color: '#888888'}}>{currentDate}</Text>
        </View>
        <LineGraph
            style={{width: '100%', height: 400}}
            points={pointData}
            animated={true}
            color={'#1ae79c'}
            gradientFillColors={['#0e8a5c', '#181818']}
            enablePanGesture
            onPointSelected={(p) => updateVals(p)}
            enableIndicator={true}
            indicatorPulsating={true}
            lineThickness={4}
            horizontalPadding={0}
            //onGestureEnd={() => setCurrPrice(String(pointData[pointData.length - 1].value))}
        />

        
        <ScrollView horizontal={true} style={{marginTop: 20, marginRight: 10}} showsHorizontalScrollIndicator={false}>
            {TimeButton("1D")}
            {TimeButton("1W")}
            {TimeButton("1M")}
            {TimeButton("3M")}
            {TimeButton("YTD")}
            {TimeButton("1Y")}
            {TimeButton("5Y")}
            {TimeButton("MAX")}
        </ScrollView>
        <View style={{marginHorizontal:12, marginTop: 15}}>
            <Text style={{color: '#fff', fontFamily: 'InterTight-Black', fontSize: 16}}>About {ticker}</Text>
            <Text style={{color: '#999999', fontFamily: 'InterTight-Reg', fontSize: 12}}>{tickerData?.description}</Text>
        </View>
        </ScrollView>
        </View> :
        <View></View>
        }
       </View> 
       
    );
};


export default TestGraph;