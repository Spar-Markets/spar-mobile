import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  NativeModules,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {serverUrl} from '../../constants/global';
import Icon from 'react-native-vector-icons/FontAwesome';
import {LineChart} from 'react-native-gifted-charts';
import PositionCard from '../InGameComponents/PositionCard';
import LinearGradient from 'react-native-linear-gradient';
import {act} from 'react-test-renderer';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHTHStyles from '../../styles/createHTHStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import HTHPageHeader from '../GlobalComponents/HTHPageHeader';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';
import { Circle, Group, Paint, Rect } from '@shopify/react-native-skia';
import GameScreenGraph from './GameScreenGraph';
import {GraphPoint} from 'react-native-graph';

const socket = new WebSocket('wss://music-api-grant.fly.dev/');


interface RouteParams {
  matchID: string
  yourFormattedData: Array<any>
  oppFormattedData: Array<any>
  userID: string
}

interface PortfolioSnapshot {
  value: number;
  timeField: number;
}

const GameScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const { theme } = useTheme();
  const { width } = useDimensions();
  const styles = createHTHStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);

  const params = route.params as RouteParams | undefined;
  const matchID = params?.matchID
  const userID = params?.userID

  const [loading, setLoading] = useState(true)

  const goBack = () => {
    navigation.goBack();
  };

  // this is to get the live portfolio value
  useEffect(() => {
    console.log(params?.oppFormattedData)
    /*if (activeMatchID != null) {
      const ws = socket;

      ws.onopen = () => {
        console.log('Connected to server');
        ws.send(
          JSON.stringify({
            matchID: activeMatchID,
            type: 'match',
            status: 'add',
          }),
        );
      };

      ws.onmessage = event => {
        console.log(`Received message: ${event.data}`);
      };

      ws.onerror = error => {
        console.error(
          'WebSocket error:',
          error.message || JSON.stringify(error),
        );
      };

      // close websocket once component unmounts
      return () => {
        if (ws) {
          // sending ticker on ws close to remove it from interested list
          ws.send(
            JSON.stringify({
              matchID: activeMatchID,
              type: 'match',
              status: 'delete',
            }),
          );

          ws.close(
            1000,
            'Closing websocket connection due to page being closed',
          );
          console.log('Closed websocket connection due to page closing');
        }
      };
    } else {
      console.log('game screen activematchID is nothing but should update ');
    }*/
  }, []);

  const [maxY, setMaxY] = useState<any>()
  const [minY, setMinY] = useState<any>()

  useEffect(() => {

    const yourDataMax = Math.max(...(params!.yourFormattedData).map((item:any) => item.normalizedValue))
    const oppDataMax = Math.max(...(params!.oppFormattedData).map((item:any) => item.normalizedValue))
    const youDataMin = Math.min(...(params!.yourFormattedData).map((item:any) => item.normalizedValue))
    const oppDataMin = Math.min(...(params!.oppFormattedData).map((item:any) => item.normalizedValue))

    if (oppDataMax > yourDataMax) {
      setMaxY(oppDataMax)
    } else {
      setMaxY(yourDataMax)
    }

    if (oppDataMin > youDataMin) {
      setMinY(youDataMin)
    } else {
      setMinY(oppDataMin)
    }

  }, []);

  const [matchData, setMatchData] = useState<any>(null)
  const [you, setYou] = useState("")
  const [opp, setOpp] = useState("")

  useEffect(() => {
    console.log("MatchID:", matchID)
    const getMatchData = async () => {
        try {
            const response = await axios.post(serverUrl+"/getMatchData", {matchID: matchID})
            if (response) {
                //console.log("Match:", response.data)
                setMatchData(response.data)
                if (response.data.user1.userID === userID) {
                  setYou('user1');
                  setOpp('user2');
                } else if (response.data.user2.userID === userID) {
                  setYou('user2');
                  setOpp('user1')
                } else {
                  console.error('Error determining whether active user is user1 or user2.');
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    getMatchData()
  }, [])

  useEffect(() => {
    if (matchData) {
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [matchData])


  if (loading) {
    return <View></View>
  }

  return (
   <View style={styles.container}>
      <HTHPageHeader text="Head-to-Head" endAt={new Date(Date.now() + 900000)}/>
      <ScrollView>
        {/* <View style={{flexDirection: 'row', marginTop: 20}}>
          <View style={{marginLeft: 20}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <View style={[styles.hthGameIndicator, {backgroundColor: theme.colors.accent}]}></View>
              <Text style={styles.userText}>You</Text>
              <View style={styles.percentIndicator}>
                <Text style={[styles.percentText, {color: theme.colors.accent}]}>+3.43%</Text>
              </View>
            </View>
            <Text style={styles.portText}>$103,430.54</Text>
          </View>
          <View style={{flex: 1}}></View>
          <View style={{marginRight: 20}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <View style={styles.percentIndicator}>
                <Text style={[styles.percentText, {color: theme.colors.opposite}]}>+3.43%</Text>
              </View>
              <Text style={styles.userText}>Rzonance</Text>
              <View style={[styles.hthGameIndicator, {backgroundColor: theme.colors.opposite}]}></View>
            </View>
            <Text style={[styles.portText, {textAlign: 'right'}]}>$103,430.54</Text>
          </View>
        </View> */}
        <GameScreenGraph yourFormattedData={params?.yourFormattedData} oppFormattedData={params?.oppFormattedData} matchID={matchID} userID={userID}/>
        <View style={{marginHorizontal: 20}}>
          <View style={{
              flexDirection: 'row', 
              backgroundColor: theme.colors.primary, 
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.colors.tertiary,
              padding: 10
            }}>
            <Text style={styles.buyingPowerText}>Buying Power</Text>
            <View style={{flex: 1}}></View>
            <Text style={styles.buyingPowerText}>${(matchData[you].buyingPower).toFixed(2)}</Text>
          </View>
          <View style={{marginTop: 20}}>
            <Text style={{fontSize: 18, color: theme.colors.text, fontWeight: 'bold'}}>Leaderboard</Text>
            <View style={{flexDirection: 'row', marginTop: 5, gap: 20}}>
              <View style={{gap: 5}}>
                <Text style={styles.leaderboardLabel}>#</Text>
                <View style={{flexDirection: 'row', gap: 10, backgroundColor: theme.colors.primary, borderWidth: 1, borderRadius: 10, borderColor: theme.colors.tertiary, paddingVertical: 5, paddingHorizontal: 10, justifyContent: 'flex-end'}}>
                  <Text style={styles.leaderboardText}>1</Text>
                  <View style={{width: 20, height: 20, borderRadius: 50, backgroundColor: 'red'}}></View>
                </View>
                <View style={{flexDirection: 'row', gap: 10, backgroundColor: theme.colors.primary, borderWidth: 1, borderRadius: 10, borderColor: theme.colors.tertiary, paddingVertical: 5, paddingHorizontal: 10, justifyContent: 'flex-end'}}>
                  <Text style={styles.leaderboardText}>2</Text>
                  <View style={{width: 20, height: 20, borderRadius: 50, backgroundColor: 'red'}}></View>
                </View>
              </View>
              <View>
                <Text style={styles.leaderboardLabel}>User</Text>
                <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
                  <Text style={styles.leaderboardText}>jjqtrader</Text>
                </View>
                <View style={{flexDirection: 'row', gap: 10, marginTop: 17}}>
                  <Text style={styles.leaderboardText}>Rzonance</Text>
                </View>
              </View>
              <View style={{flex: 1}}></View>
              <View style={{gap: 5}}>
                <Text style={[styles.leaderboardLabel, {textAlign: 'right', marginRight: 3}]}>To Win</Text>
                <View style={{flexDirection: 'row', gap: 10, backgroundColor: theme.colors.primary, borderWidth: 1, borderRadius: 10, borderColor: theme.colors.tertiary, paddingVertical: 5, paddingHorizontal: 5, justifyContent: 'center'}}>
                  <Text style={[styles.leaderboardText, {color: theme.colors.accent}]}>$10</Text>
                </View>
                <View style={{flexDirection: 'row', gap: 10, backgroundColor: theme.colors.primary, borderWidth: 1, borderRadius: 10, borderColor: theme.colors.tertiary, paddingVertical: 5, paddingHorizontal: 5, justifyContent: 'center'}}>
                  <Text style={[styles.leaderboardText, {color: theme.colors.stockDownAccent}]}>$0</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={[globalStyles.primaryBtn, { marginBottom: 50, backgroundColor: theme.colors.accent, justifyContent: 'center' }]}>
        <Text style={{color: theme.colors.background, fontWeight: 'bold', fontSize: 18}}>Trade</Text>
      </TouchableOpacity>
   </View>
  );
};


export default GameScreen;
