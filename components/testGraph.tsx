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
import { LineChart, LineChartBicolor } from 'react-native-gifted-charts';
import { Pointer } from 'react-native-gifted-charts/src/Components/common/Pointer';


const TestGraph = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();

    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [currentPrice, setCurrPrice] = useState('50.54');
    const [maxValue, setMaxValue] = useState(25);
    
    const goBack = () => {
        navigation.goBack();
    };

    const data = [ {value:50.00}, {value:51}, {value:52},{value:54},{value:58},{value:54},
        {value:49},{value:40},{value:45},{value:52},{value:57},{value:62}, {value:68},
        {value:62},{value:54},{value:43},{value:32},{value:43},{value:36}, {value:45},
        {value:48},{value:51},{value:54},{value:53},{value:49},{value:48}, {value:52},
        {value:50}, {value:51}, {value:52},{value:100},{value:75},{value:54}, {value: 61},
        
    ]
  
    
    const UIdata = data.map(obj => ({value: obj.value - data[0].value}))
    
    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });
        
        const max = Math.max(...UIdata.map(item => item.value));
        console.log(max)
        setMaxValue(max);

    }, []);

  


 


return (
    <View style={[colorScheme == "dark" ? {backgroundColor: "#181818"} : {backgroundColor: '#fff'}, {flex: 1}]}>
        <View style={{marginTop: statusBarHeight + 10}}>
            <View style={{flexDirection: 'row', marginHorizontal: 15}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, width: 60, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12}]}>
                        <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Back</Text>
                        {/*<Icon path={mdiChevronLeft}/>*/}
                    </TouchableOpacity>
                </View>
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {marginHorizontal: 15, fontFamily: 'InterTight-Black', fontSize: 20}]}>Apple</Text>
                </View>
                <View style={{flex: 1}}/>
            </View>
            <View style={{marginTop: 30, marginHorizontal: 15}}>
                <Text style={{fontFamily: 'InterTight-Black', color: '#888888', fontSize: 20}}>AAPL</Text>
                <Text style={{fontFamily: 'InterTight-Black', color: '#fff', fontSize: 30}}>${currentPrice}.00</Text>
            </View>
           
            <LineChart data={UIdata} 
                color1={'#1ae79c'}  
                hideRules={true} curved={true} xAxisColor={"#505050"} 
                thickness={2.5} maxValue={maxValue} yAxisColor={"rgba(0, 0, 0, 0)"} 
                hideYAxisText={true} height={200} hideDataPoints1={true} hideAxesAndRules={true} 
                spacing={400/data.length} pointerConfig={{
                    
                    pointerStripHeight: 0,
                    pointerStripWidth: 2,
                    pointerColor: 'white',
                    pointerStripColor: 'white',
                    radius: 6,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 90,
                    pointerLabelComponent: (items: any) => {
                        setCurrPrice(items[0].value + data[0].value);
                    },
                    
                }}/>
            
        </View>
    </View>
    );
};


export default TestGraph;