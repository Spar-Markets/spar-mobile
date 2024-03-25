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

    return (
        <TouchableOpacity onPress={() => navigation.navigate("TestGraph", {ticker:props.ticker})} style={{marginTop: 15, flexDirection: 'row'}}>
         
        <View style={[colorScheme == 'dark' ? {backgroundColor: '#292929'} : {backgroundColor: '#fff'}, {marginHorizontal: 12, borderRadius: 12, height: 120, flex: 1}]}>
          <View style={{flexDirection: 'row', gap: 5}}>
            <View style={[props.mode == "Stock" ? {backgroundColor: '#3b30b9'} : {backgroundColor: '#0578ad'}, {height: 30, marginTop: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 5}]}>
              <Text style={{color:'#fff', fontFamily: 'InterTight-Black', fontSize: 12, paddingHorizontal: 10}}>{props.mode}</Text>
            </View>
            <View style={{flex: 1}}></View>
            <View style={{height: 30, marginTop: 5, backgroundColor: '#1ae79c', borderRadius: 10, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{color:'#000', fontFamily: 'InterTight-Black', fontSize: 12, paddingHorizontal: 10}}>${props.amountWagered}</Text>
            </View>
            <View style={{height: 30, marginTop: 5, alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', marginRight: 5}}>
              <Text style={{color:'#000', fontFamily: 'InterTight-Black', fontSize: 12, paddingHorizontal: 10}}>8:34:21</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row'}}>
          <View style={{gap: 10, marginLeft: 10, marginTop: 10, flex: 1}}>
            <View style={{flexDirection: 'row', gap: 5}}>
              
              <View style={{justifyContent: 'center'}}>
                <Text style={[colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'}, 
                {fontFamily: 'InterTight-Black', fontSize: 14}]}>Rzonance</Text>
              </View>
              <View style={{backgroundColor: '#1ae79c', borderRadius: 10}}>
                <Text style={{fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, color: '#000', fontFamily: 'InterTight-Bold'}}>+3.04%</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', gap: 5}}>
              
              <View style={{justifyContent: 'center'}}>
                <Text style={[colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'}, 
                {fontFamily: 'InterTight-SemiBold', fontSize: 14}]}>Drinks</Text>
              </View>
              <View style={{backgroundColor: '#888888', borderRadius: 10}}>
                  <Text style={{fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, color: '#000', fontFamily: 'InterTight-Bold'}}>+1.56%</Text>
              </View>
            </View>
          </View>
            <View style={{flex: 1.3}}>
              <LineChart data={data} data2={data2} 
                color1={'#888888'} color2={'#1ae79c'}  
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