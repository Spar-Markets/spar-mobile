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

const socket = new WebSocket('wss://music-api-grant.fly.dev/');

const GameScreen = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const route = useRoute();

  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [activeMatchID, setActiveMatchID] = useState(null);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [userNumber, setUserNumber] = useState<string>('');
  const [buyingPower, setBuyingPower] = useState(0);
  const [userPortfolioValue, setUserPortfolioValue] = useState(0);
  const [opponentPortfolioValue, setOpponentPortfolioValue] = useState(0);

  const goBack = () => {
    navigation.goBack();
  };

  const mode = (route.params as {mode?: string})?.mode ?? '';
  const amountWagered =
    (route.params as {amountWagered?: number})?.amountWagered ?? 0;
  const endDate = (route.params as {endDate?: number})?.endDate ?? 0;
  const idIndex = (route.params as {idIndex?: number})?.idIndex ?? null;

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
    calculateTimeRemaining(new Date(endDate)),
  );

  async function getSnapshots() {
    try {
      // get the match snapshots
      console.log('sdfds', activeMatchID);
      const snapshots = await axios.post(serverUrl + '/getSnapshots', {
        matchID: activeMatchID,
      });
      console.log(snapshots);
      // TODO: implement logic to display snapshots for correct user
      // e.g. is active user "user1" or "user2" + display UI accordingly
    } catch (error) {
      console.error('error in getSnapshots() on GameScreen.tsx:', error);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(new Date(endDate)));
      if (timeRemaining == '0:0:0') {
        //fix format of time
        //run axios post to remove match from matches and distribute winnings. add to past matches collection
      }
    }, 1000);
    getMatch();

    return () => clearInterval(timer);
  }, [endDate, idIndex]);

  const [matchesData, setMatchesData] = useState();

  useEffect(() => {
    if (activeMatch != '') {
      getSnapshots();
    } else {
      console.log();
    }
  }, [activeMatch]);

  useEffect(() => {
    NativeModules.StatusBarManager.getHeight(
      (response: {height: React.SetStateAction<number>}) => {
        setStatusBarHeight(response.height);
      },
    );
  }, []);

  // this is to get the live portfolio value
  useEffect(() => {
    if (activeMatchID != null) {
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
    }
  }, [activeMatchID]);

  const [rerenderKey, setRerenderKey] = useState(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setRerenderKey(prevKey => prevKey + 1);
    }
  }, [isFocused]);

  const fetchMatchIDAndData = async (userID: String) => {
    try {
      const response = await axios.post(serverUrl + '/getUserMatches', {
        userID,
      });
      //console.log("Matches: ", response.data);
      setActiveMatchID(response.data[idIndex!]);

      //console.log(response.data[idIndex!])
      const match = await axios.post(serverUrl + '/getMatchData', {
        matchID: response.data[idIndex!],
      });
      setActiveMatch(match.data);
      if (userID == match.data.user1.userID) {
        setUserNumber('user1');
        setBuyingPower(match.data.user1.buyingPower);
      } else if (userID == match.data.user2.userID) {
        setUserNumber('user2');
        setBuyingPower(match.data.user2.buyingPower);
      }
      console.log('Match data:', match.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const getMatch = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      if (userID) {
        await fetchMatchIDAndData(userID);
      } else {
        console.log('User email not found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error getting user email from AsyncStorage:', error);
    }
  };

  const data2 = [
    {value: 50},
    {value: 55},
    {value: 52},
    {value: 63},
    {value: 70},
    {value: 76},
    {value: 81},
    {value: 85},
    {value: 84},
    {value: 84},
    {value: 83},
    {value: 81},
    {value: 78},
    {value: 75},
    {value: 73},
    {value: 71},
    {value: 68},
    {value: 65},
    {value: 64},
    {value: 61},
    {value: 58},
    {value: 54},
    {value: 59},
    {value: 54},
    {value: 59},
    {value: 63},
    {value: 67},
    {value: 71},
    {value: 75},
    {value: 80},
    {value: 82},
    {value: 85},
    {value: 88},
    {value: 91},
    {value: 94},
    {value: 92},
    {value: 86},
    {value: 81},
    {value: 76},
    {value: 72},
    {value: 67},
    {value: 61},
  ];

  const data = [
    {value: 50},
    {value: 48},
    {value: 45},
    {value: 35},
    {value: 43},
    {value: 47},
    {value: 51},
    {value: 56},
    {value: 60},
    {value: 62},
    {value: 63},
    {value: 68},
    {value: 72},
    {value: 73},
    {value: 68},
    {value: 65},
    {value: 61},
    {value: 56},
    {value: 53},
    {value: 48},
    {value: 47},
    {value: 43},
    {value: 42},
    {value: 41},
    {value: 39},
    {value: 43},
    {value: 46},
    {value: 49},
    {value: 51},
    {value: 47},
    {value: 45},
    {value: 42},
    {value: 41},
    {value: 40},
    {value: 43},
    {value: 47},
    {value: 50},
    {value: 52},
    {value: 56},
    {value: 59},
    {value: 54},
    {value: 51},
  ];

  return (
    <View
      style={[
        colorScheme == 'dark'
          ? {backgroundColor: '#111'}
          : {backgroundColor: '#fff'},
        {flex: 1},
      ]}>
      {activeMatch != null ? (
        <View
          style={{
            marginTop: statusBarHeight + 10,
            marginHorizontal: 15,
            flex: 1,
          }}>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <TouchableOpacity
                onPress={goBack}
                style={[
                  colorScheme == 'dark'
                    ? {backgroundColor: 'transparent'}
                    : {backgroundColor: 'transparent'},
                  {
                    height: 30,
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 10,
                    borderRadius: 12,
                  },
                ]}>
                <Icon
                  name={'chevron-left'}
                  size={20}
                  color={'#33aaFF'}
                  style={
                    colorScheme == 'dark'
                      ? {color: '#FFF'}
                      : {backgroundColor: '#000'}
                  }
                />
                <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>
                  Back
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
              <Text
                style={[
                  colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'},
                  {
                    marginHorizontal: 15,
                    fontFamily: 'InterTight-Black',
                    fontSize: 20,
                  },
                ]}>
                {timeRemaining}
              </Text>
            </View>
            <View style={{flex: 1}} />
          </View>
          <LinearGradient
            colors={['#222', '#333', '#444']}
            style={{
              borderColor: '#333',
              borderWidth: 2,
              marginTop: 15,
              borderRadius: 12,
            }}>
            <View style={{flexDirection: 'row'}}>
              <View style={{marginLeft: 15, marginTop: 15, gap: 5}}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <View
                    style={{
                      backgroundColor: '#1ae79c',
                      width: 10,
                      height: 10,
                      borderRadius: 15,
                    }}></View>
                  <Text
                    style={{
                      fontFamily: 'InterTight-Black',
                      color: '#fff',
                      fontSize: 12,
                    }}>
                    You
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'InterTight-Black',
                    color: '#fff',
                    fontSize: 18,
                  }}>
                  $105,430.00
                </Text>
                <View
                  style={{
                    backgroundColor: '#1ae79c',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    height: 20,
                    width: 60,
                  }}>
                  <Text style={{fontFamily: 'InterTight-SemiBold'}}>5.43%</Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: '#1ae79c',
                    padding: 3,
                    borderRadius: 5,
                  }}>
                  <Text
                    style={{color: '#242F42', fontFamily: 'InterTight-Black'}}>
                    ${amountWagered}
                  </Text>
                </View>
                <Text style={{fontFamily: 'InterTight-Bold', color: 'gray'}}>
                  vs
                </Text>
              </View>
              <View
                style={{
                  marginRight: 15,
                  marginTop: 15,
                  gap: 5,
                  alignItems: 'flex-end',
                }}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <View
                    style={{
                      backgroundColor: 'gray',
                      width: 10,
                      height: 10,
                      borderRadius: 15,
                    }}></View>
                  <Text
                    style={{
                      fontFamily: 'InterTight-Black',
                      color: '#fff',
                      fontSize: 12,
                    }}>
                    Drinks
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'InterTight-Black',
                    color: '#fff',
                    fontSize: 18,
                  }}>
                  $103,890.00
                </Text>
                <View
                  style={{
                    backgroundColor: 'gray',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    height: 20,
                    width: 60,
                  }}>
                  <Text style={{fontFamily: 'InterTight-SemiBold'}}>3.89%</Text>
                </View>
              </View>
            </View>
            <View style={{marginTop: 15}}>
              <LineChart
                data={data}
                data2={data2}
                color1={'gray'}
                color2={'#1ae79c'}
                hideRules={true}
                curved={true}
                xAxisColor={'rgba(0, 0, 0, 0)'}
                thickness={2.5}
                maxValue={100}
                yAxisColor={'rgba(0, 0, 0, 0)'}
                hideYAxisText={true}
                height={80}
                hideDataPoints1={true}
                hideDataPoints2={true}
                spacing={340 / data.length}
              />
            </View>
            <View
              style={{
                height: 2,
                backgroundColor: '#777777',
                marginHorizontal: 15,
              }}></View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 20,
                marginVertical: 15,
              }}>
              <Text style={{color: 'white', fontFamily: 'InterTight-Bold'}}>
                Buying Power
              </Text>
              <View style={{flex: 1}}></View>
              <Text style={{color: 'white', fontFamily: 'InterTight-Bold'}}>
                ${activeMatch.user1.buyingPower}
              </Text>
            </View>
          </LinearGradient>
          <Text
            style={[
              colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'},
              {
                fontFamily: 'InterTight-Black',
                fontSize: 20,
                marginBottom: 10,
                marginTop: 15,
              },
            ]}>
            Positions
          </Text>
          {userNumber != '' && (
            <ScrollView style={{marginHorizontal: -15}}>
              {activeMatch.user1.assets.map((item: any, index: any) => (
                <View key={index}>
                  {item && 'ticker' in item && (
                    <PositionCard
                      ticker={item.ticker}
                      matchID={activeMatchID}
                      ownStock={true}
                      shares={item.totalShares}
                      buyingPower={buyingPower}></PositionCard>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          <View style={{flex: 1}}></View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('InGameStockSearch', {
                activeMatchID,
                buyingPower,
              });
            }}
            style={{
              backgroundColor: '#6254ff',
              height: 80,
              marginBottom: 30,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <LinearGradient
              colors={['#6254ff', '#4e42cf', '#3b31a3']}
              style={{
                flex: 1,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: '#4e42cf',
                borderWidth: 2,
                borderRadius: 12,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  fontFamily: 'InterTight-Black',
                }}>
                Trade
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View></View>
      )}
    </View>
  );
};

const darkStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 30,
    fontFamily: 'InterTight-Bold',
  },
});

const lightStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 15,
  },
  buttonText: {
    color: '#000',
    fontSize: 30,
    fontFamily: 'InterTight-Bold',
  },
});

export default GameScreen;
