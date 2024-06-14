import React, {useState, useEffect} from 'react';
import {Text, TouchableOpacity, View, useColorScheme} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {LineGraph, GraphPoint} from 'react-native-graph';
import axios from 'axios';
import {serverUrl} from '../../constants/global';
import LinearGradient from 'react-native-linear-gradient';

const PositionCard = (props: any) => {
  const navigation = useNavigation<any>();
  const [pointData, setPointData] = useState<GraphPoint[]>([]);
  const [tickerData, setTickerData] = useState<any>(null);
  const [percentChange, setPercentChange] = useState(0.0);
  const [recentPrice, setRecentPrice] = useState(0.0);

  useEffect(() => {
    console.log('Entered Position card useeffect');
    console.log(props.ticker, props.matchID, props.ownStock);
    const getPrices = async () => {
      try {
        interface TickerPricestamp {
          price: number;
          timeField: number;
        }

        const response = await axios.post(
          serverUrl + '/getMostRecentOneDayPrices',
          {ticker: props.ticker, timeframe: '1D'},
        );
        console.log('after api request');

        // Check if response is successful and has data
        if (response && response.data && response.data[props.ticker]) {
          const tickerData: TickerPricestamp[] = response.data[props.ticker];

          // Map the data to the format expected by the graphing library
          const points = tickerData.map(tickerData => ({
            value: tickerData.price,
            date: new Date(tickerData.timeField),
          }));

          console.log(tickerData[tickerData.length - 1]);

          setRecentPrice(Number(tickerData[tickerData.length - 1].price));
          setPointData(points);
        }
      } catch (error) {
        console.error(error, 'stock game card error getting prices');
      }
    };

    const getDetails = async () => {
      try {
        const response = await axios.post(serverUrl + '/getTickerDetails', {
          ticker: props.ticker,
        });
        if (response) {
          setTickerData(response.data);
        }
      } catch {
        console.error('error getting details');
      }
    };
    getPrices();
    getDetails();
  }, []);

  return (
    <View>
      {pointData.length > 0 && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('StockDetails', {
              ticker: props.ticker,
              matchID: props.matchID,
              ownStock: props.ownStock,
              tradable: true,
            })
          }
          style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <LinearGradient
              colors={['#222', '#333', '#444']}
              style={{
                height: 80,
                backgroundColor: '#222',
                borderWidth: 2,
                borderColor: '#333',
                flex: 1,
                marginHorizontal: 12,
                marginVertical: 8,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{marginLeft: 20, width: 60}}>
                <Text
                  style={{
                    color: '#fff',
                    fontFamily: 'InterTight-Black',
                    fontSize: 16,
                  }}>
                  {props.ticker}
                </Text>
                <Text
                  style={{
                    color: '#aaaaaa',
                    fontFamily: 'InterTight-Black',
                    fontSize: 11,
                  }}>
                  {props.shares} Shares
                </Text>
              </View>
              <LineGraph
                style={{flex: 1, height: 40, marginLeft: 20, marginRight: 20}}
                points={pointData}
                animated={true}
                color={percentChange > 0 ? '#1ae79c' : '#e71a1a'}
                //gradientFillColors={percentChange > 0 ? ['#0e8a5c', '#111'] : ['#e71a1a', '#333']}
              />
              <View style={{marginRight: 10, gap: 5}}>
                <View
                  style={{
                    backgroundColor: '#e71a1a',
                    borderRadius: 10,
                    width: 90,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'InterTight-Black',
                      fontSize: 14,
                      color: '#fff',
                      paddingVertical: 5,
                    }}>
                    $
                    {
                      recentPrice /*String(pointData[pointData.length-1].value).split(".")[0] + "." + String(pointData[pointData.length-1].value).split(".")[1].substring(0, 2)*/
                    }
                  </Text>
                </View>
                {percentChange > 0 ? (
                  <Text
                    style={{
                      fontFamily: 'InterTight-Black',
                      fontSize: 12,
                      color: '#0e8a5c',
                      textAlign: 'right',
                    }}>
                    +{percentChange}%
                  </Text>
                ) : (
                  <Text
                    style={{
                      fontFamily: 'InterTight-Black',
                      fontSize: 12,
                      color: '#e71a1a',
                      textAlign: 'right',
                    }}>
                    {percentChange}%
                  </Text>
                )}
              </View>
            </LinearGradient>
            {/*<View style={{height: 1, backgroundColor: '#292929'}}></View>*/}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PositionCard;
