import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  NativeModules,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {serverUrl, websocketUrl} from '../../constants/global';
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
import { set } from 'lodash';
import CustomActivityIndicator from '../GlobalComponents/CustomActivityIndicator';
import { Button } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';

//const socket = new WebSocket(websocketUrl);

interface RouteParams {
  matchID: string
  userID: string
  endAt: Date
  opponentUsername: string
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
  const opponentUsername = params?.opponentUsername

  const ws = useSelector((state: RootState) => state.websockets[matchID!]);

  const [loading, setLoading] = useState(true)

  const [matchIsEnded, setMatchIsEnded] = useState(false);

  const matches = useSelector((state: RootState) => state.matches);
  const { yourAssets, opponentAssets } = matches[matchID!]

  const [match, setMatch] = useState<any>(null)
  const [yourPointData, setYourPointData] = useState<GraphPoint[]>([]);
  const [opponentPointData, setOpponentPointData] = useState<any>([]);
  const [yourFormattedData, setYourFormattedData] = useState<any[] | null>(null)
  const [oppFormattedData, setOppFormattedData] = useState<any[] | null>(null)
  const [you, setYou] = useState("")
  const [opp, setOpp] = useState("")
  const [yourColor, setYourColor] = useState("#fff")
  const [assets, setAssets] = useState<any[]>([])

  const [firstPlace, setFirstPlace] = useState("")
  const [secondPlace, setSecondPlace] = useState("")

  //const [yourAssets, setYourAssets] = useState<any[] | null>(null);
  //const [opponentAssets, setOpponentAssets] = useState<any[] | null>(null);

  // time left in match WHEN component mounts
  const [timeLeft, setTimeLeft] = useState(null);
  
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const goHome = () => {
    //setModalVisible(false);
    navigation.goBack()
  };

  // useEffect for updating time
  useEffect(() => {
    // only execute if match object exists
    //console.log("WS FROM REDUX",ws)
    console.log("ASSETS FROM REDUX", yourAssets, opponentAssets)
    if (match && match.endAt) {
      // Calculate time until match end
      const end = new Date(match.endAt);
      const now = new Date();
      const timeUntilEnd = end.getTime() - now.getTime();

      if (timeUntilEnd <= 0) {
        // If the match end time has already passed, navigate back immediately
        //navigation.navigate('Home');
        setMatchIsEnded(true);
        openModal();
      } else {
        // Set a timeout to navigate back when the match ends
        const timeoutId = setTimeout(() => {
          // TODO: add popup saying match has ended
          navigation.navigate('Home');
        }, timeUntilEnd);

        // Clear timeout if the component unmounts before the match ends
        return () => clearTimeout(timeoutId);
      }
    }
  }, [match, navigation]);


  useEffect(() => {
    if (ws) {
      console.log("-------------------------------------")
      console.log("MATCH ID", matchID)
      console.log("WEBSOCKET IN GAMESCREEN")
      console.log("WS PRINTING!!!!!!!!!", ws)
      ws.send(JSON.stringify({type: "GameScreenConnection"}))
      console.log("-------------------------------------")
    }
  }, [])


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
        setOpp('user2')
      } else if (match.user2.userID === userID) {
        setUserMatchData('user2', 'user1');
        setYou('user2')
        setOpp('user1')
      } else {
        console.error('Error determining whether active user is user1 or user2.');
      }
    }
  }, [match]);

  // focus logic for websockets
  

  const setUserMatchData = async (yourUserNumber: string, opponentUserNumber: string) => {
    if (match) {
      try {

        const snapshots = await axios.post(serverUrl + '/getSnapshots', { matchID: match.matchID })
        const yourSnapshots: PortfolioSnapshot[] = snapshots.data[`${yourUserNumber}Snapshots`];
        
        const yourPoints: GraphPoint[] = yourSnapshots.map((snapshot) => ({
          value: snapshot.value,
          date: new Date(snapshot.timeField), // Ensure date is in timestamp format
        }));
        setYourPointData(yourPoints);

        const oppSnapshots: PortfolioSnapshot[] = snapshots.data[`${opponentUserNumber}Snapshots`];
        const oppPoints: GraphPoint[] = oppSnapshots.map((snapshot) => ({
          value: snapshot.value,
          date: new Date(snapshot.timeField), // Ensure date is in timestamp format
        }));
        setOpponentPointData(oppPoints);

        setAssets(match[yourUserNumber].assets)
        console.log("Assets:", match[yourUserNumber].assets)


      } catch (error) {
        console.log('Game screen error:', error);
      }
    }
  };

  const setLeaderboard = async (firstPlace:string, secondPlace:string) => {
    const firstPlaceResponse = await axios.post(serverUrl + '/getUsernameByID', { userID: match[firstPlace].userID });
    const secondPlaceResponse = await axios.post(serverUrl + '/getUsernameByID', { userID: match[secondPlace].userID });
    setFirstPlace(firstPlaceResponse.data.username)
    setSecondPlace(secondPlaceResponse.data.username)
  }

  

  function uint8ArrayToString(array:any) {
    return array.reduce((data:any, byte:any) => data + String.fromCharCode(byte), '');
  }

  useEffect(() => {
    if (yourPointData && opponentPointData) {
      const sourceData = yourPointData.filter((item:any, index:any) => index % 2 === 0)
      const data = sourceData // Select every 10th item
      .map((item:any, index:number) => ({
        value: item.value,
        normalizedValue: item.value - 100000,
        index: index,
        date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
      }));
      setYourFormattedData(data)

      const sourceData2 = opponentPointData.filter((item:any, index:any) => index % 2 === 0)
      const data2 = sourceData2 // Select every 10th item
      .map((item:any, index:number) => ({
        value: item.value,
        normalizedValue: item.value - 100000,
        index: index,
        date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
      }));
      setOppFormattedData(data2)

      if (data[data.length-1] && data2[data2.lenght-1]) {
        if (data[data.length-1].value >= data2[data2.length-1].value) {
          setYourColor(theme.colors.stockUpAccent)
          setLeaderboard(you, opp)
          console.log("SETTING LEADERBOARD IF")
        } else {
          setYourColor(theme.colors.stockDownAccent)
          setLeaderboard(opp, you)
          console.log("SETTING LEADERBOARD ELSE")
        }
      }
    }
    
    //setLoading(false);
  }, [yourPointData, opponentPointData]);

  useEffect(() => {
    console.log("INSIDE USER EFFECT FOR YOUR FORMATTED DATA")
    if (yourFormattedData != null && oppFormattedData != null) {
      console.log("WE HAVE YOUR FORMATTED DATA AND OPP FORMATTED DATA")
      console.log(yourFormattedData)
      if (yourFormattedData[yourFormattedData.length-1]?.value != undefined) {
        console.log("Price:",yourFormattedData[yourFormattedData.length-1]?.value)
        setLoading(false)
      }
    } else {
      setLoading(true)
    }
  }, [yourFormattedData, oppFormattedData])

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < yourAssets.length; i += 2) {
      rows.push(
        <View key={i} style={styles.positionRow}>
          <PositionCard ticker={yourAssets[i].ticker} qty={yourAssets[i].totalShares} matchID={matchID} 
          buyingPower={match[you].buyingPower} assets={match[you].assets} endAt={params?.endAt}/>
          {yourAssets[i + 1] && <PositionCard ticker={yourAssets[i + 1].ticker} qty={yourAssets[i + 1].totalShares} matchID={matchID} 
          buyingPower={match[you].buyingPower} assets={match[you].assets} endAt={params?.endAt}/>}
        </View>
      );
    }
    return rows;
  };

  
  if (loading) {
    return (
        <View style={styles.container}>
            <HTHPageHeader text="Back" endAt={params?.endAt}/>
            <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
              <CustomActivityIndicator size={60} color={theme.colors.text}/>
            </View>
        </View>
    )
  }

  return (
   <View style={styles.container}>
      <HTHPageHeader text="Back" endAt={params?.endAt}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <GameScreenGraph yourFormattedData={yourFormattedData} oppFormattedData={oppFormattedData} matchID={matchID} userID={userID} yourColor={yourColor} oppName={opponentUsername}/>
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
                <View style={{flexDirection: 'row', 
                borderRadius: 10, paddingVertical: 5, alignItems: 'center', height: 30}}>
                  <Text style={styles.leaderboardText}>{firstPlace}</Text>
                </View>
                <View style={{flexDirection: 'row',
                borderRadius: 10, paddingVertical: 5, alignItems: 'center', height: 30}}>
                  <Text style={styles.leaderboardText}>{secondPlace}</Text>
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
            {renderRows()}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => navigation.navigate("InGameStockSearch", {
        matchID: matchID, 
        userNumber: you, 
        buyingPower: match[you].buyingPower, 
        assets: assets,
        endAt: params?.endAt        
        })} style={[globalStyles.primaryBtn, { marginBottom: 50, backgroundColor: theme.colors.accent, justifyContent: 'center', marginTop: 10 }]}>
        <Text style={{color: theme.colors.background, fontFamily: 'InterTight-Black', fontSize: 18}}>Trade</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        //onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>The match has ended.</Text>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={[styles.closeButton, {borderRightWidth: 1, borderRightColor: theme.colors.primary}]} onPress={goHome}>
                <Text style={styles.textStyle}>Go Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.closeButton, {borderLeftWidth: 1, borderLeftColor: theme.colors.primary}]} onPress={goHome}>
                <Text style={styles.textStyle}>Match Summary</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
   </View>
  );
};


export default GameScreen;
