import React, {useState, useEffect, useCallback} from 'react';
import { Image, ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Animated, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './ActiveGames';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import { Pointer } from 'react-native-gifted-charts/src/Components/common/Pointer';
import { LineGraph, GraphPoint } from 'react-native-graph'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StockDetailGraph from './StockDetailGraph';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';


const StockDetails = () => {
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
    const [descMaxHeight, setDescMaxHeight] = useState(150);
    const [showingMoreDesc, setShowingMoreDesc] = useState(false)
    
    const goBack = () => {
        navigation.goBack();
    };

    const showDesc = () => {
        if (showingMoreDesc) {
            setDescMaxHeight(150);
        } else {
            setDescMaxHeight(1000);
        }
    }

    const matchId = (route.params as {matchId?: string})?.matchId ?? null;

    const handlePress = async (url:string) => {
        // Checking if the link is supported for links with custom schemes (e.g., "https")
        const supported = await Linking.canOpenURL(url);
    
        if (supported) {
          // Opening the link
          await Linking.openURL(url);
        } else {
          console.error("Don't know how to open URI: " + url);
        }
      };


    
    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });
        const getData = async () => {
            try {

                const tickerResponse = await axios.post(serverUrl + "/getTickerDetails", route.params);

                if (tickerResponse) {
                    setTickerData(tickerResponse.data)
                    //console.log(tickerResponse.data)
                }

            } catch {
                console.error("error getting prices")
            }
        }
        console.log(matchId)

        getData();

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
 

    const TimeButton = (timeFrame:string) => {
        return (
        <View>
        {timeFrameSelected == timeFrame ?
        <TouchableOpacity onPress={() => setTimeFrameSelected(timeFrame)} style={{backgroundColor: '#1ae79c', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginHorizontal: 5}}>
            <Text style={{color:'#111', paddingHorizontal: 10, paddingVertical: 5, fontFamily: 'InterTight-Black', fontSize: 15}}>{timeFrame}</Text>
        </TouchableOpacity> : 
        <TouchableOpacity onPress={() => setTimeFrameSelected(timeFrame)} style={{backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginHorizontal: 5}}>
            <Text style={{color:'#1ae79c', paddingHorizontal: 10, paddingVertical: 5, fontFamily: 'InterTight-Black', fontSize: 15}}>{timeFrame}</Text>
        </TouchableOpacity>
        }
        </View>
        )
    }



    /*const buyStock = async () => {
        const email = await AsyncStorage.getItem("userEmail");
        try {
            console.log(email)
            await axios.post(serverUrl + "/buyStock", {email: email})
        } catch (error) {
            console.error(error)
        }
    }*/

    const purchaseStock = async () => {
        try {
            const email = await AsyncStorage.getItem("userEmail");
            const buyResponse = await axios.post(serverUrl + "/purchaseStock", {email: email, matchId: matchId, buyPrice: currentPrice, ticker: tickerData.ticker});
        } catch (error) {
            console.log(error)
        }
    }

    

    return (

       <View style={{backgroundColor: '#111', flex: 1}}>
        {tickerData != null ?
        <View style={{marginTop: statusBarHeight + 10, flex: 1}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: 'transparent'} : {backgroundColor: 'transparent'}, {height: 30,marginHorizontal: 15, marginBottom: 10, alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 10, borderRadius: 12}]}>
                        <Icon name={'chevron-left'} size= {20} color={"#33aaFF"} style={colorScheme == "dark" ? {color: '#FFF'} : {backgroundColor: '#000'}}/>
                        <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>Back</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{flex: 1}}/>
            </View>
        <ScrollView style={{}} showsVerticalScrollIndicator={false}>
        {/*<View style={{marginLeft: 12, marginTop: 20}}>
            <Text style={{fontFamily: 'InterTight-Black', fontSize: 20, color: '#888888'}}>{ticker}</Text>
            <Text style={{fontFamily: 'InterTight-Black', fontSize: 35, color: '#fff'}}>${currentPrice}</Text>
            <Text style={{fontFamily: 'InterTight-Black', fontSize: 20, color: '#888888'}}>{currentDate}</Text>
        </View>*/}
        <StockDetailGraph ticker={tickerData.ticker}/>
        
        <ScrollView horizontal={true} style={{marginTop: 20, marginRight: 15, marginLeft: 15}} showsHorizontalScrollIndicator={false}>
            {TimeButton("1D")}
            {TimeButton("1W")}
            {TimeButton("1M")}
            {TimeButton("3M")}
            {TimeButton("YTD")}
            {TimeButton("1Y")}
            {TimeButton("5Y")}
            {TimeButton("MAX")}
        </ScrollView>

        {tickerData != null &&
        <View>
            <LinearGradient colors={['#222', '#333', '#444']} style={{borderColor: '#333', borderWidth: 2, marginHorizontal: 15, marginTop: 20, borderRadius: 12}}>
                <Text style={{fontFamily: 'InterTight-Black', color: '#fff', marginTop: 15, marginLeft: 15}}>About {ticker}</Text>
                <Text style={{fontFamily: 'InterTight-SemiBold', color: '#aaaaaa', fontSize: 12, marginHorizontal: 15, marginBottom: 15}}>{tickerData.description}</Text>
            </LinearGradient>
            <LinearGradient colors={['#222', '#333', '#444']} style={{borderColor: '#333', borderWidth: 2, marginHorizontal: 15, marginTop: 10, borderRadius: 12}}>
                <Text style={{fontFamily: 'InterTight-Black', color: '#fff', marginTop: 15, marginLeft: 15}}>Stats</Text>
                <Text style={{fontFamily: 'InterTight-Black', color: '#1ae79c', fontSize: 12, marginHorizontal: 15, marginBottom: 3}}>{<Text style={{color: '#aaaaaa', fontFamily: 'InterTight-SemiBold'}}>Open </Text>}${tickerData.day_open}</Text>
                <Text style={{fontFamily: 'InterTight-Black', color: '#1ae79c', fontSize: 12, marginHorizontal: 15, marginBottom: 3}}>{<Text style={{color: '#aaaaaa', fontFamily: 'InterTight-SemiBold'}}>Volume </Text>}{tickerData.day_volume}</Text>
                <Text style={{fontFamily: 'InterTight-Black', color: '#1ae79c', fontSize: 12, marginHorizontal: 15, marginBottom: 3}}>{<Text style={{color: '#aaaaaa', fontFamily: 'InterTight-SemiBold'}}>Today's Low </Text>}${tickerData.day_low}</Text>
                <Text style={{fontFamily: 'InterTight-Black', color: '#1ae79c', fontSize: 12, marginHorizontal: 15, marginBottom: 3}}>{<Text style={{color: '#aaaaaa', fontFamily: 'InterTight-SemiBold'}}>Today's High </Text>}${tickerData.day_high}</Text>
                <Text style={{fontFamily: 'InterTight-Black', color: '#1ae79c', fontSize: 12, marginHorizontal: 15, marginBottom: 15}}>{<Text style={{color: '#aaaaaa', fontFamily: 'InterTight-SemiBold'}}>Market Cap </Text>}${tickerData.market_cap}</Text>
            </LinearGradient>
            <View style={{marginHorizontal: 15, marginBottom: 10}}>
                
                <Text style={{fontFamily: 'InterTight-Black', color: '#fff', marginVertical: 15, marginLeft: 15, fontSize: 20}}>News</Text>
                {tickerData.news.slice(0,3).map((item:any, index:any) => (
                <View key={index} style={{marginHorizontal: 15}}>
                    {item && 'title' in item && 'publisher' in item && (
                    <TouchableOpacity onPress={() => handlePress(item.article_url)}>
                        <View style={{flexDirection: 'row', gap: 30}}>
                        <View style={{flex: 1}}>
                            <Text style={{color: '#fff', fontFamily: 'InterTight-Bold', fontSize: 11}}>{item.publisher.name}</Text>
                            <View style={{}}>
                                <Text style={{color: '#fff', fontFamily: 'InterTight-SemiBold', fontSize: 14}}>{item.title}</Text> 
                            </View>
                        </View>
                        <Image
                            style={{borderRadius: 12, flex: 0.3}}
                            source={{uri: item.image_url}}
                        />
                        </View>
                        <View style={{height: 2, backgroundColor: '#333', marginVertical: 10}}></View>
                    </TouchableOpacity>
                    )}
                </View>
                ))}
                    
                
            </View>
        </View>
        }
        </ScrollView>
        <View style={{backgroundColor: '#111', marginTop: 10}}>
        <TouchableOpacity onPress={() => {navigation.navigate("StockOrder", {ticker: tickerData.ticker, matchId: matchId})}} style={{height: 80, marginBottom: 30, borderRadius: 12, marginHorizontal: 15, justifyContent: 'center', alignItems: 'center'}}>
            <LinearGradient colors={['#1ae79c', '#13ad75', '#109464']} style={{borderColor: '#13ad75', borderWidth: 2, flex: 1, width: '100%', borderRadius: 12, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#fff', fontSize: 20, fontFamily: 'InterTight-Black'}}>Buy</Text>
            </LinearGradient>
        </TouchableOpacity>
        </View>
        </View> :
        <View></View>
        }
       </View> 
       
    );
};


export default StockDetails;