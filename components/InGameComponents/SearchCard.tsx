import React, {useState, useEffect} from 'react';
import {Text, TouchableOpacity, View, useColorScheme} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {LineGraph, GraphPoint} from 'react-native-graph';
import getPrices from '../../utility/getPrices';

const StockCard = (props: any) => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();
  const [pointData, setPointData] = useState<GraphPoint[]>([]);
  const [percentChange, setPercentChange] = useState(0.0);
  const [recentPrice, setRecentPrice] = useState(0.0);

  /*useEffect(() => {
    const run = async () => {
      const points = await getPrices(props.ticker);
      if (points != undefined) {
        setPointData(points);
        setRecentPrice(points[points.length - 1].value);
      }
    };

    run();
  }, [props.ticker]);*/
  
  return (
    <View>
      {pointData.length > 0 && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('StockDetails', {
              matchID: props.matchID,
              ticker: props.ticker,
              tradable: props.tradable,
            })
          }
          style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <View
              style={{
                height: 80,
                backgroundColor: '#111',
                borderColor: '#444',
                borderWidth: 2,
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
              </View>
              <LineGraph
                style={{flex: 1, height: 40, marginLeft: 20, marginRight: 20}}
                points={pointData}
                animated={true}
                color={percentChange > 0 ? '#1ae79c' : '#e71a1a'}
                gradientFillColors={
                  percentChange > 0
                    ? ['#0e8a5c', '#242F42']
                    : ['#e71a1a', '#242F42']
                }
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
                      fontSize: 16,
                      color: '#fff',
                      paddingVertical: 5,
                    }}>
                    ${recentPrice}
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
            </View>
            <View style={{height: 1, backgroundColor: '#292929'}}></View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StockCard;
