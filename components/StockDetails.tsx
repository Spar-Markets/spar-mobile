import React, {useState, useEffect} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  NativeModules,
  ScrollView,
  Linking,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {serverUrl} from '../constants/global';
import StockDetailGraph from './StockDetailGraph';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

// interface for RouteParams, so we can expect the format of the params being passed in
// when you navigate to this page. (just an object with a ticker)
interface RouteParams {
  ticker: string;
  tradable: boolean;
  canSell: boolean;
  matchID: string;
  buyingPower: number;
}

// apply stockdetails props interface so it knows its formatted correctly
const StockDetails = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const route = useRoute();
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [ticker, setTicker] = useState('');
  const [timeFrameSelected, setTimeFrameSelected] = useState('1D');
  const [tickerData, setTickerData] = useState<any>(null);

  const goBack = () => {
    navigation.goBack();
  };

  function formatLargeNumber(number: number) {
    if (number >= 1e12) {
      return (number / 1e12).toFixed(2) + ' trillion';
    } else if (number >= 1e9) {
      return (number / 1e9).toFixed(2) + ' billion';
    } else if (number >= 1e6) {
      return (number / 1e6).toFixed(2) + ' million';
    } else if (number >= 1e3) {
      return (number / 1e3).toFixed(2) + ' thousand';
    } else {
      return number.toString();
    }
  }

  const handlePress = async (url: string) => {
    // Checking if the link is supported for links with custom schemes (e.g., "https")
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link
      await Linking.openURL(url);
    } else {
      console.error("Don't know how to open URI: " + url);
    }
  };

  // get params either in the expected format, or allow it to be undefined
  const params = route.params as RouteParams | undefined;

  console.log('stock details, params: ' + params?.matchID);

  useEffect(() => {
    const ticker = String(params?.ticker);

    const ws = new WebSocket('wss://music-api-grant.fly.dev');

    ws.onopen = () => {
      console.log('Connected to server');
      ws.send(JSON.stringify({ticker: ticker, status: 'add'}));
    };

    ws.onmessage = event => {
      console.log(`Received message: ${event.data}`);
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error.message || JSON.stringify(error));
    };

    // close websocket once component unmounts
    return () => {
      if (ws) {
        // sending ticker on ws close to remove it from interested list
        ws.send(JSON.stringify({ticker: ticker, status: 'delete'}));

        ws.close(1000, 'Closing websocket connection due to page being closed');
        console.log('Closed websocket connection due to page closing');
      }
    };
  }, []);

  useEffect(() => {
    NativeModules.StatusBarManager.getHeight(
      (response: {height: React.SetStateAction<number>}) => {
        setStatusBarHeight(response.height);
      },
    );

    console.log(params);

    // update ticker state with the passed in ticker from the route.
    // set it to empty string if no ticker provided or undefined.
    setTicker(params?.ticker || '');

    const getData = async () => {
      console.log(params?.ticker);
      try {
        const tickerResponse = await axios.post(
          serverUrl + '/getTickerDetails',
          {ticker: params?.ticker},
        );
        console.log('ticker response data;', tickerResponse.data);
        console.log(
          'ticker response details;',
          tickerResponse.data.detailsResponse,
        );
        console.log(
          'ticker response price details:' + tickerResponse.data.priceDetails,
        );
        console.log('ticker response news:' + tickerResponse.data.news.results);

        if (tickerResponse) {
          // This sets all the data
          setTickerData(tickerResponse);
        }
      } catch {
        console.error('Error getting details in StockDetails.tsx');
      }
    };

    getData();
  }, []);

  const TimeButton = (timeFrame: string) => {
    return (
      <View>
        {timeFrameSelected == timeFrame ? (
          <TouchableOpacity
            onPress={() => setTimeFrameSelected(timeFrame)}
            style={{
              backgroundColor: '#1ae79c',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              marginHorizontal: 5,
            }}>
            <Text
              style={{
                color: '#111',
                paddingHorizontal: 10,
                paddingVertical: 5,
                fontFamily: 'InterTight-Black',
                fontSize: 15,
              }}>
              {timeFrame}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setTimeFrameSelected(timeFrame)}
            style={{
              backgroundColor: '#111',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              marginHorizontal: 5,
            }}>
            <Text
              style={{
                color: '#1ae79c',
                paddingHorizontal: 10,
                paddingVertical: 5,
                fontFamily: 'InterTight-Black',
                fontSize: 15,
              }}>
              {timeFrame}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{backgroundColor: '#111', flex: 1}}>
      {tickerData != null && params != undefined ? (
        <View style={{marginTop: statusBarHeight + 10, flex: 1}}>
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
                    marginHorizontal: 15,
                    marginBottom: 10,
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

            <View style={{flex: 1}} />
          </View>
          <ScrollView style={{}} showsVerticalScrollIndicator={false}>
            {/*<View style={{marginLeft: 12, marginTop: 20}}>
                        <Text style={{fontFamily: 'InterTight-Black', fontSize: 20, color: '#888888'}}>{ticker}</Text>
                        <Text style={{fontFamily: 'InterTight-Black', fontSize: 35, color: '#fff'}}>${currentPrice}</Text>
                        <Text style={{fontFamily: 'InterTight-Black', fontSize: 20, color: '#888888'}}>{currentDate}</Text>
                    </View>*/}

            <StockDetailGraph ticker={ticker} timeframe={timeFrameSelected} />

            <ScrollView
              horizontal={true}
              style={{marginTop: 20, marginRight: 15, marginLeft: 15}}
              showsHorizontalScrollIndicator={false}>
              {TimeButton('1D')}
              {TimeButton('1W')}
              {TimeButton('1M')}
              {TimeButton('3M')}
              {TimeButton('YTD')}
              {TimeButton('1Y')}
              {TimeButton('5Y')}
              {TimeButton('MAX')}
            </ScrollView>

            <View>
              <LinearGradient
                colors={['#222', '#333', '#444']}
                style={{
                  borderColor: '#333',
                  borderWidth: 2,
                  marginHorizontal: 15,
                  marginTop: 20,
                  borderRadius: 12,
                }}>
                <Text
                  style={{
                    fontFamily: 'InterTight-Black',
                    color: '#fff',
                    marginTop: 15,
                    marginLeft: 15,
                  }}>
                  About {ticker}
                </Text>
                <Text
                  style={{
                    fontFamily: 'InterTight-SemiBold',
                    color: '#aaaaaa',
                    fontSize: 12,
                    marginHorizontal: 15,
                    marginBottom: 15,
                  }}>
                  {tickerData.data.detailsResponse.results.description}
                </Text>
              </LinearGradient>
              <LinearGradient
                colors={['#222', '#333', '#444']}
                style={{
                  borderColor: '#333',
                  borderWidth: 2,
                  marginHorizontal: 15,
                  marginTop: 10,
                  borderRadius: 12,
                }}>
                <Text
                  style={{
                    fontFamily: 'InterTight-Black',
                    color: '#fff',
                    marginTop: 15,
                    marginLeft: 15,
                  }}>
                  Stats
                </Text>
                <Text
                  style={{
                    fontFamily: 'InterTight-Black',
                    color: '#1ae79c',
                    fontSize: 12,
                    marginHorizontal: 15,
                    marginBottom: 3,
                  }}>
                  {
                    <Text
                      style={{
                        color: '#aaaaaa',
                        fontFamily: 'InterTight-SemiBold',
                      }}>
                      Open:{' '}
                    </Text>
                  }
                  ${tickerData.data.priceDetails.open}
                </Text>
                <Text
                  style={{
                    fontFamily: 'InterTight-Black',
                    color: '#1ae79c',
                    fontSize: 12,
                    marginHorizontal: 15,
                    marginBottom: 3,
                  }}>
                  {
                    <Text
                      style={{
                        color: '#aaaaaa',
                        fontFamily: 'InterTight-SemiBold',
                      }}>
                      Volume:{' '}
                    </Text>
                  }
                  {formatLargeNumber(tickerData.data.priceDetails.volume)}
                </Text>
                <Text
                  style={{
                    fontFamily: 'InterTight-Black',
                    color: '#1ae79c',
                    fontSize: 12,
                    marginHorizontal: 15,
                    marginBottom: 3,
                  }}>
                  {
                    <Text
                      style={{
                        color: '#aaaaaa',
                        fontFamily: 'InterTight-SemiBold',
                      }}>
                      Today's Low:{' '}
                    </Text>
                  }
                  ${tickerData.data.priceDetails.low}
                </Text>
                <Text
                  style={{
                    fontFamily: 'InterTight-Black',
                    color: '#1ae79c',
                    fontSize: 12,
                    marginHorizontal: 15,
                    marginBottom: 3,
                  }}>
                  {
                    <Text
                      style={{
                        color: '#aaaaaa',
                        fontFamily: 'InterTight-SemiBold',
                      }}>
                      Today's High:{' '}
                    </Text>
                  }
                  ${tickerData.data.priceDetails.high}
                </Text>
                <Text
                  style={{
                    fontFamily: 'InterTight-Black',
                    color: '#1ae79c',
                    fontSize: 12,
                    marginHorizontal: 15,
                    marginBottom: 15,
                  }}>
                  {
                    <Text
                      style={{
                        color: '#aaaaaa',
                        fontFamily: 'InterTight-SemiBold',
                      }}>
                      Market Cap:{' '}
                    </Text>
                  }
                  $
                  {formatLargeNumber(
                    tickerData.data.detailsResponse.results.market_cap,
                  )}
                </Text>
              </LinearGradient>
            </View>

            <View style={{marginHorizontal: 15, marginBottom: 10}}>
              <Text
                style={{
                  fontFamily: 'InterTight-Black',
                  color: '#fff',
                  marginVertical: 15,
                  marginLeft: 15,
                  fontSize: 20,
                }}>
                News
              </Text>
              {tickerData.data.news.results
                .slice(0, 3)
                .map((item: any, index: any) => (
                  <View key={index} style={{marginHorizontal: 15}}>
                    {item && 'title' in item && 'publisher' in item && (
                      <TouchableOpacity
                        onPress={() => handlePress(item.article_url)}>
                        <View style={{flexDirection: 'row', gap: 30}}>
                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                color: '#fff',
                                fontFamily: 'InterTight-Bold',
                                fontSize: 11,
                              }}>
                              {item.publisher.name}
                            </Text>
                            <View style={{}}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontFamily: 'InterTight-SemiBold',
                                  fontSize: 14,
                                }}>
                                {item.title}
                              </Text>
                            </View>
                          </View>
                          <Image
                            style={{borderRadius: 12, flex: 0.3}}
                            source={{uri: item.image_url}}
                          />
                        </View>
                        <View
                          style={{
                            height: 2,
                            backgroundColor: '#333',
                            marginVertical: 10,
                          }}></View>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
            </View>
          </ScrollView>

          {params.tradable == true ? (
            <View
              style={{
                backgroundColor: '#111',
                marginBottom: 50,
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
              }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('StockOrder', {
                    ticker: params.ticker,
                    matchID: params.matchID,
                    tradeType: 'Buy',
                    buyingPower: params.buyingPower,
                  });
                }}
                style={{flex: 1}}>
                <LinearGradient
                  colors={['#1ae79c', '#13ad75', '#109464']}
                  style={{
                    borderColor: '#13ad75',
                    borderWidth: 2,
                    width: '100%',
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 75,
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 20,
                      fontFamily: 'InterTight-Black',
                    }}>
                    Buy
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('StockOrder', {
                    ticker: params.ticker,
                    matchID: params.matchID,
                    tradeType: 'Sell',
                  });
                }}
                style={{flex: 1}}>
                <LinearGradient
                  colors={['#FFFFFF', '#FFFFFF', '#FFFFFF']}
                  style={{
                    borderColor: '#FFFFFF',
                    borderWidth: 2,
                    width: '100%',
                    borderRadius: 12,
                    height: 75,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      fontSize: 20,
                      fontFamily: 'InterTight-Black',
                    }}>
                    Sell
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View></View>
          )}
        </View>
      ) : (
        <View></View>
      )}
    </View>
  );
};

export default StockDetails;
