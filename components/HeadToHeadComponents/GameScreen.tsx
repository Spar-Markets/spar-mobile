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
import PositionCard from './PositionCard';
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

  // this is to get the live portfolio value
  useEffect(() => {
    //console.log(params?.oppFormattedData)
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


  const [match, setMatch] = useState<any>(null)
  const [yourPointData, setYourPointData] = useState<GraphPoint[]>([]);
  const [opponentPointData, setOpponentPointData] = useState<any>([]);
  const [yourFormattedData, setYourFormattedData] = useState<any[] | null>(null)
  const [oppFormattedData, setOppFormattedData] = useState<any[] | null>(null)
  const [opponentUsername, setOpponentUsername] = useState<string | null>(null);
  const [you, setYou] = useState("")
  const [opp, setOpp] = useState("")
  const [yourColor, setYourColor] = useState("#fff")

  useEffect(() => {
    console.log("MatchID:", matchID)
    const getMatchData = async () => {
        try {
            const response = await axios.post(serverUrl+"/getMatchData", {matchID: matchID})
            if (response) {
                //console.log("Match:", response.data)
                setMatch(response.data)
            } 
        } catch (error) {
            console.log(error)
        }
    }
    getMatchData()
  }, [])

  useEffect(() => {
    if (match) {
      if (match.user1.userID === userID) {
        setUserMatchData('user1', 'user2');
        setYou('user1')
      } else if (match.user2.userID === userID) {
        setUserMatchData('user2', 'user1');
        setYou('user2')
      } else {
        console.error('Error determining whether active user is user1 or user2.');
      }
    }
  }, [match]);

  const setUserMatchData = async (yourUserNumber: string, opponentUserNumber: string) => {
    if (match) {
      try {
        const yourSnapshots: PortfolioSnapshot[] = match[yourUserNumber].snapshots;
        const yourPoints: GraphPoint[] = yourSnapshots.map((snapshot) => ({
          value: snapshot.value,
          date: new Date(snapshot.timeField), // Ensure date is in timestamp format
        }));
        setYourPointData(yourPoints);

        const oppSnapshots: PortfolioSnapshot[] = match[opponentUserNumber].snapshots;
        const oppPoints: GraphPoint[] = oppSnapshots.map((snapshot) => ({
          value: snapshot.value,
          date: new Date(snapshot.timeField), // Ensure date is in timestamp format
        }));
        setOpponentPointData(oppPoints);

        const response = await axios.post(serverUrl + '/getUsernameByID', { userID: match[opponentUserNumber].userID });
        console.log("Opp name:", opponentUserNumber)
        setOpponentUsername(response.data.username);
      } catch (error) {
        console.log('Game card error:', error);
      }
    }
  };

  useEffect(() => {
    const sourceData = yourPointData.slice(0, 500).filter((item:any, index:any) => index % 2 === 0)
    const data = sourceData // Select every 10th item
    .map((item:any, index:number) => ({
      value: item.value,
      normalizedValue: item.value - 100000,
      index: index,
      date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
    }));
    setYourFormattedData(data)

    const sourceData2 = opponentPointData.slice(0, 500).filter((item:any, index:any) => index % 2 === 0)
    const data2 = sourceData2 // Select every 10th item
    .map((item:any, index:number) => ({
      value: item.value,
      normalizedValue: item.value - 100000,
      index: index,
      date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
    }));
    setOppFormattedData(data2)

    if (data[data.length-1]) {
      if (data[data.length-1].value >= data2[data2.length-1].value) {
        setYourColor(theme.colors.stockUpAccent)
      } else {
        setYourColor(theme.colors.stockDownAccent)
      }
    }
    
    //setLoading(false);
  }, [yourPointData, opponentPointData]);

  useEffect(() => {
    if (yourFormattedData != null && oppFormattedData != null) {
      if (yourFormattedData[yourFormattedData.length-1]?.value != undefined) {
        console.log("Price:",yourFormattedData[yourFormattedData.length-1]?.value)
        setLoading(false)
      }
    } else {
      setLoading(true)
    }
  }, [yourFormattedData, oppFormattedData])


  if (loading) {
    return <View></View>
  }

  return (
   <View style={styles.container}>
      <HTHPageHeader text="Head-to-Head" endAt={new Date(Date.now() + 900000)}/>
      <ScrollView>
        <GameScreenGraph yourFormattedData={yourFormattedData} oppFormattedData={oppFormattedData} matchID={matchID} userID={userID}/>
        <View style={{marginHorizontal: 20}}>
          <View style={{
              flexDirection: 'row', 
              marginTop: 15
            }}>
            <Text style={styles.buyingPowerText}>Buying Power</Text>
            <View style={{flex: 1}}></View>
            <Text style={styles.buyingPowerText}>${(match[you].buyingPower).toFixed(2)}</Text>
          </View>
          <View style={{height: 2, backgroundColor: theme.colors.tertiary, marginTop: 15}}></View>
          <View style={{marginTop: 15}}>
            <Text style={{fontSize: 18, color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>Leaderboard</Text>
            <View style={{flexDirection: 'row', marginTop: 5, gap: 20}}>
              <View style={{gap: 5}}>
                <Text style={styles.leaderboardLabel}>#</Text>
                <View style={{flexDirection: 'row', gap: 10, backgroundColor: theme.colors.primary, 
                borderWidth: 1, borderRadius: 10, borderColor: theme.colors.tertiary, paddingVertical: 5, paddingHorizontal: 10, justifyContent: 'flex-end', alignItems: 'center', height: 30}}>
                  <Text style={styles.leaderboardText}>1</Text>
                  <View style={{width: 20, height: 20, borderRadius: 50, backgroundColor: 'red'}}></View>
                </View>
                <View style={{flexDirection: 'row', gap: 10, backgroundColor: theme.colors.primary, 
                borderWidth: 1, borderRadius: 10, borderColor: theme.colors.tertiary, paddingVertical: 5, paddingHorizontal: 10, justifyContent: 'flex-end', alignItems: 'center', height: 30}}>
                  <Text style={styles.leaderboardText}>2</Text>
                  <View style={{width: 20, height: 20, borderRadius: 50, backgroundColor: 'red'}}></View>
                </View>
              </View>
              <View style={{gap: 5}}>
                <Text style={styles.leaderboardLabel}>User</Text>
                <View style={{flexDirection: 'row', borderWidth: 1, 
                borderRadius: 10, paddingVertical: 5, alignItems: 'center', height: 30}}>
                  <Text style={styles.leaderboardText}>jjqtrader</Text>
                </View>
                <View style={{flexDirection: 'row', borderWidth: 1,
                borderRadius: 10, paddingVertical: 5, alignItems: 'center', height: 30}}>
                  <Text style={styles.leaderboardText}>Rzonance</Text>
                </View>
              </View>
              <View style={{flex: 1}}></View>
              <View style={{gap: 5}}>
                <Text style={[styles.leaderboardLabel, {textAlign: 'right', marginRight: 3}]}>To Win</Text>
                <View style={{flexDirection: 'row', height: 30, gap: 10, backgroundColor: theme.colors.primary, borderWidth: 1, borderRadius: 10, borderColor: theme.colors.tertiary, paddingVertical: 5, paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={[styles.leaderboardText, {color: theme.colors.accent}]}>$10</Text>
                </View>
                <View style={{flexDirection: 'row', height: 30, gap: 10, backgroundColor: theme.colors.primary, borderWidth: 1, borderRadius: 10, borderColor: theme.colors.tertiary, paddingVertical: 5, paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={[styles.leaderboardText, {color: theme.colors.stockDownAccent}]}>$0</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{marginTop: 20}}>
            <Text style={{fontSize: 18, color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>My Positions</Text>
            <PositionCard ticker="META"/>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => navigation.navigate("InGameStockSearch", {matchID: matchID, userNumber: you, buyingPower: match[you].buyingPower})} style={[globalStyles.primaryBtn, { marginBottom: 50, backgroundColor: theme.colors.accent, justifyContent: 'center' }]}>
        <Text style={{color: theme.colors.background, fontFamily: 'InterTight-Black', fontSize: 18}}>Trade</Text>
      </TouchableOpacity>
   </View>
  );
};


export default GameScreen;
