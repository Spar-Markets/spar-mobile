import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TouchableWithoutFeedback, Touchable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart, LineChart, PieChart, PopulationPyramid } from "react-native-gifted-charts";

var styles = require('../Style/style');

const data = [ {value:50}, {value:51}, {value:52},{value:54},{value:58},{value:54},
  {value:49},{value:40},{value:45},{value:52},{value:57},{value:62}, {value:68},
  {value:62},{value:54},{value:43},{value:32},{value:43},{value:36}, {value:45},
  {value:48},{value:51},{value:54},{value:53},{value:49},{value:48}, {value:52},
  {value:50}, {value:51}, {value:52},{value:54},{value:58},{value:54},
  {value:49},{value:40},{value:45},{value:52},{value:57},{value:62}, {value:68},
  {value:62},{value:54},{value:43},{value:32},{value:43},{value:36}, {value:45},
  {value:48},{value:51},{value:54},{value:53},{value:49},{value:48}, {value:52},
  {value:50}, {value:51}, {value:52},{value:54},{value:58},{value:54},
  {value:49},{value:40},{value:45},{value:52},{value:57},{value:62}, {value:68},
  {value:62},{value:54},{value:43},{value:32},{value:43},{value:36}, {value:45},
  {value:48},{value:51},{value:54},{value:53},{value:49},{value:48}, {value:52}]

const data2 = [ {value:50},{value:50},{value:51},{value:55},{value:57},{value:58},
  {value:58},{value:51},{value:54},{value:53},{value:49},{value:48}, {value:52},
  {value:56},{value:75},{value:68},{value:65},{value:63},{value:68}, {value:62},
  {value:49},{value:40},{value:45},{value:52},{value:57},{value:62}, {value:68},
  {value:50},{value:50},{value:51},{value:55},{value:57},{value:58},
  {value:58},{value:51},{value:54},{value:53},{value:49},{value:48}, {value:52},
  {value:56},{value:75},{value:68},{value:65},{value:63},{value:68}, {value:62},
  {value:49},{value:40},{value:45},{value:52},{value:57},{value:62}, {value:68},
  {value:50},{value:50},{value:51},{value:55},{value:57},{value:58},
  {value:58},{value:51},{value:54},{value:53},{value:49},{value:48}, {value:52},
  {value:56},{value:75},{value:68},{value:65},{value:63},{value:68}, {value:62},
  {value:49},{value:40},{value:45},{value:52},{value:57},{value:62}, {value:68}
]




/*
TODO: 
 */

const GameCard = (props:any) => {

    const colorScheme = useColorScheme();
    const navigation = useNavigation<any>();

    const sendData = {
      mode: props.mode,
      amountWagered: props.amountWagered,
      endTime: props.timeRemaining,
      yourPercentChange: props.yourPercentChange,
      opp: props.opp,
      oppPercentChange: props.oppPercentChange,
    }

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

    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(props.endDate))
    
    useEffect(() => {
      const timer = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(props.endDate))
        if (timeRemaining == "0:0:0") {
          //fix format of time
          //run axios post to remove match from matches and distribute winnings. add to past matches collection
        }
      }, 1000);
      return () => clearInterval(timer)
    }, [props.endDate])



    return (
        <TouchableOpacity onPress={() => navigation.navigate("GameScreen", sendData)} style={{marginBottom: 10, flexDirection: 'row'}}>
         
        <View style={[colorScheme == 'dark' ? {backgroundColor: '#242F42'} : {backgroundColor: '#fff'}, {marginHorizontal: 15, borderRadius: 12, height: 120, flex: 1, shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 4,}]}>
          <View style={{flexDirection: 'row', gap: 5}}>
            <View style={{backgroundColor: '#6254ff', height: 30, marginTop: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 5}}>
              <Text style={{color:'#fff', fontFamily: 'InterTight-Black', fontSize: 12, paddingHorizontal: 10}}>{props.mode}</Text>
            </View>
            <View style={{flex: 1}}></View>
            <View style={{height: 30, marginTop: 5, alignItems: 'center', backgroundColor: '#242F42', borderRadius: 10, justifyContent: 'center'}}>
              <Text style={{color:'#fff', fontFamily: 'InterTight-Black', fontSize: 12, paddingHorizontal: 10}}>{timeRemaining}</Text>
            </View>
            <View style={{height: 30, marginTop: 5, backgroundColor: '#1ae79c', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 5}}>
              <Text style={{color:'#000', fontFamily: 'InterTight-Black', fontSize: 12, paddingHorizontal: 10}}>${props.amountWagered}</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row'}}>
          <View style={{gap: 10, marginLeft: 10, marginTop: 10, flex: 1}}>
            <View style={{flexDirection: 'row', gap: 5, alignItems:'center'}}>
              <View style={{backgroundColor: '#FFBB54', height: 7, width: 7, borderRadius: 5}}></View>
              <View style={{justifyContent: 'center'}}>
                <Text style={[colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'}, 
                {fontFamily: 'InterTight-Black', fontSize: 14}]}>You</Text>
              </View>
              <View style={{backgroundColor: '#1ae79c', borderRadius: 5}}>
                <Text style={{fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, color: '#000', fontFamily: 'InterTight-Bold'}}>{props.yourPercentChange}%</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', gap: 5, alignItems:'center'}}>
            <View style={{backgroundColor: '#E71AA1', height: 7, width: 7, borderRadius: 5}}></View>
              <View style={{justifyContent: 'center'}}>
                <Text style={[colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'}, 
                {fontFamily: 'InterTight-SemiBold', fontSize: 14}]}>{props.opp}</Text>
              </View>
              <View style={{backgroundColor: '#888888', borderRadius: 5}}>
                  <Text style={{fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, color: '#000', fontFamily: 'InterTight-Bold'}}>{props.oppPercentChange}%</Text>
              </View>
            </View>
          </View>
            <View style={{flex: 1.3}}>
              <LineChart data={data} data2={data2} 
                color1={'#E71AA1'} color2={'#FFBB54'}  
                hideRules={true} curved={true} xAxisColor={"rgba(0, 0, 0, 0)"} 
                thickness={2.5} maxValue={100} yAxisColor={"rgba(0, 0, 0, 0)"} 
                hideYAxisText={true} height={80} hideDataPoints1={true} 
                hideDataPoints2={true} spacing={170/data.length}/>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
};

const darkStyles = StyleSheet.create({
  txt: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'InterTight-Black'
  },
})

const lightStyles = StyleSheet.create({
  txt: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'InterTight-Black'
  },
})

export default GameCard;