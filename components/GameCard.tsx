import React, {useState, useEffect, useCallback} from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  NativeModules,
  ScrollView,
  TouchableWithoutFeedback,
  Touchable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth0, Auth0Provider} from 'react-native-auth0';
import {useNavigation} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  BarChart,
  LineChart,
  PieChart,
  PopulationPyramid,
} from 'react-native-gifted-charts';
import LinearGradient from 'react-native-linear-gradient';
import {GraphPoint, LineGraph} from 'react-native-graph';
import {serverUrl} from '../constants/global';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

var styles = require('../Style/style');

const GameCard = (props: any) => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();

  const sendData = {
    mode: props.mode,
    amountWagered: props.amountWagered,
    endDate: props.endDate.getTime(),
    yourPercentChange: props.yourPercentChange,
    opp: props.opp,
    oppPercentChange: props.oppPercentChange,
    idIndex: props.idIndex,
  };

  const [pointData, setPointData] = useState<GraphPoint[]>([]);
  const [pointData2, setPointData2] = useState<GraphPoint[]>([]);

  interface TickerPricestamp {
    price: number;
    timeField: number;
  }

  useEffect(() => {
    // !!!! RAGTAG: this is for the users graphs as a placeholder. It shows the aapl and tsla most recent trading day charts -GRANT
    const getPrices = async () => {
      try {
        const response = await axios.post(
          serverUrl + '/getMostRecentOneDayPrices',
          {ticker: ['AAPL'], timeframe: '1D'},
        );

        // Check if response is successful and has data
        if (response && response.data && response.data['AAPL']) {
          const tickerData: TickerPricestamp[] = response.data['AAPL'];

          // Map the data to the format expected by the graphing library
          const points = tickerData.map(tickerData => ({
            value: tickerData.price,
            date: new Date(tickerData.timeField),
          }));

          setPointData(points);
        }
      } catch (error) {
        console.error(error, 'game card error getting prices');
      }

      try {
        const response = await axios.post(
          serverUrl + '/getMostRecentOneDayPrices',
          {ticker: ['TSLA'], timeframe: '1D'},
        );

        // Check if response is successful and has data
        if (response && response.data && response.data['TSLA']) {
          const tickerData: TickerPricestamp[] = response.data['TSLA'];

          // Map the data to the format expected by the graphing library
          const points = tickerData.map(tickerData => ({
            value: tickerData.price,
            date: new Date(tickerData.timeField),
          }));

          setPointData2(points);
        }
      } catch (error) {
        console.error(error, 'game card 2 error getting prices');
      }
    };

    getPrices();
  }, []);

  const calculateTimeRemaining = (endDate: Date) => {
    const endDateTime = new Date(endDate).getTime();
    const currentTime = new Date().getTime();

    const timeRemaining = Math.max(0, endDateTime - currentTime); // Ensure time remaining doesn't go negative
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    // Format minutes with leading zero if necessary
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    // Format seconds with leading zero if necessary
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(props.endDate),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(props.endDate));
      if (timeRemaining == '0:0:0') {
        //fix format of time
        //run axios post to remove match from matches and distribute winnings. add to past matches collection
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [props.endDate]);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('GameScreen', sendData)}
      style={{marginBottom: 10, flexDirection: 'row'}}>
      <LinearGradient
        colors={['#272743', '#43436e']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          colorScheme == 'dark'
            ? {backgroundColor: '#272743'}
            : {backgroundColor: '#fff'},
          {
            marginLeft: 15,
            borderRadius: 12,
            height: 200,
            width: 180,
            flex: 1,
            borderWidth: 2,
            borderColor: '#3a3a61',
          },
        ]}>
        <View style={{flexDirection: 'row'}}>
          <View style={{gap: 10, marginHorizontal: 10, marginTop: 10, flex: 1}}>
            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
              <Icon
                name={'star'}
                size={10}
                color={'#fff'}
                style={
                  colorScheme == 'dark' ? {color: '#1ae79c'} : {color: '#fff'}
                }
              />
              <View style={{justifyContent: 'center'}}>
                <Text
                  style={[
                    colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'},
                    {fontFamily: 'InterTight-Black', fontSize: 14},
                  ]}>
                  You
                </Text>
              </View>
              <View style={{backgroundColor: '#1ae79c', borderRadius: 5}}>
                <Text
                  style={{
                    fontSize: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    color: '#000',
                    fontFamily: 'InterTight-Bold',
                  }}>
                  {props.yourPercentChange}%
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
              <View
                style={{
                  backgroundColor: 'gray',
                  height: 7,
                  width: 7,
                  borderRadius: 5,
                  marginLeft: 1,
                }}></View>
              <View style={{justifyContent: 'center'}}>
                <Text
                  style={[
                    colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'},
                    {fontFamily: 'InterTight-Black', fontSize: 14},
                  ]}>
                  {props.opp}
                </Text>
              </View>
              <View
                style={[
                  colorScheme == 'dark'
                    ? {backgroundColor: '#888888'}
                    : {backgroundColor: '#cccccc'},
                  {borderRadius: 5},
                ]}>
                <Text
                  style={{
                    fontSize: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    color: '#000',
                    fontFamily: 'InterTight-Bold',
                  }}>
                  {props.oppPercentChange}%
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{flex: 1}}>
          <LineGraph
            style={{
              position: 'absolute',
              top: 10,
              left: 0,
              right: 0,
              bottom: 10,
            }}
            points={pointData}
            animated={true}
            color={'#1ae79c'}
            //gradientFillColors={colorScheme == "dark" ? ['#0e8a5c', '#29292f']:['#0e8a5c', '#fff']}
            //onPointSelected={(p) => updateVals(p)}
            lineThickness={3}
            horizontalPadding={0}
          />
          <LineGraph
            style={{
              position: 'absolute',
              top: 10,
              left: 0,
              right: 0,
              bottom: 10,
            }}
            points={pointData2}
            animated={true}
            color={'#808080'}
            //gradientFillColors={colorScheme == "dark" ? ['#0e8a5c', '#29292f']:['#0e8a5c', '#fff']}
            //onPointSelected={(p) => updateVals(p)}
            lineThickness={3}
            horizontalPadding={0}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 5,
            marginHorizontal: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: '#fff', fontFamily: 'InterTight-Black'}}>
            {timeRemaining}
          </Text>
          <View style={{flex: 1}}></View>
          <View style={{backgroundColor: '#fff', borderRadius: 5}}>
            <Text style={{padding: 3, fontFamily: 'InterTight-Black'}}>
              ${props.amountWagered}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const darkStyles = StyleSheet.create({
  txt: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'InterTight-Black',
  },
});

const lightStyles = StyleSheet.create({
  txt: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'InterTight-Black',
  },
});

export default GameCard;
