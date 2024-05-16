import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TouchableWithoutFeedback, Touchable, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart, LineChart, PieChart, PopulationPyramid } from "react-native-gifted-charts";
import { LineGraph, GraphPoint } from 'react-native-graph';
import axios from 'axios'
import { serverUrl } from '../constants/global';
import { point } from '@shopify/react-native-skia';
import LinearGradient from 'react-native-linear-gradient';


const DailyChallengeCard = (props:any) => {

    const colorScheme = useColorScheme();

    const navigation = useNavigation<any>();

    const screenWidth = Dimensions.get("window").width;
  
    return (
        <View>
            <TouchableOpacity style={{flexDirection: 'row', height: 150, width: 300}}>
                <LinearGradient colors={["#29292f", "#29292f"]} style={{borderRadius: 6, flex: 1}}>
                    <Text>Hello</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};


export default DailyChallengeCard;
