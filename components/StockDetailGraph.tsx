import React, {useState, useEffect, useCallback} from 'react';
import {
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {GraphPoint, LineGraph} from 'react-native-graph';
import LinearGradient from 'react-native-linear-gradient';
import getPrices from '../utility/getPrices';

const StockDetailGraph = (props: any) => {
  const colorScheme = useColorScheme();
  const [pointData, setPointData] = useState<GraphPoint[]>([]);
  const [displayPrice, setDisplayPrice] = useState('');
  const [endPrice, setEndPrice] = useState('');

  const updateVals = (obj: any) => {
    const newValue = Math.round(obj.value * 100) / 100;
    if (String(newValue).includes('.') == false) {
      setDisplayPrice(String(newValue) + '.00');
    } else if (String(newValue).split('.')[1].length == 1) {
      setDisplayPrice(String(newValue) + 0);
    } else {
      setDisplayPrice(String(newValue));
    }
  };

  useEffect(() => {
    const run = async () => {
      const points = await getPrices(props.ticker, props.timeframe);
      console.log('PRICES POINTS!! ', points);
      if (points != undefined) {
        setPointData(points);
        if (String(points[points.length - 1].value).includes('.') == false) {
          setEndPrice(String(points[points.length - 1].value) + '.00');
        } else if (
          String(points[points.length - 1].value).split('.')[1].length == 1
        ) {
          setEndPrice(String(points[points.length - 1].value) + 0);
        } else {
          setEndPrice(String(points[points.length - 1].value));
        }
      }
    };

    run();
  }, [props.timeframe]);

  return (
    <View>
      <LinearGradient
        colors={['#222', '#333', '#444']}
        style={{
          marginHorizontal: 15,
          borderColor: '#444',
          borderWidth: 2,
          borderRadius: 12,
        }}>
        <View style={{marginLeft: 15, marginTop: 15}}>
          <Text
            style={{
              color: '#888888',
              fontFamily: 'InterTight-SemiBold',
              fontSize: 14,
            }}>
            {props.ticker}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={[
                colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'},
                {fontFamily: 'InterTight-Black', fontSize: 24},
              ]}>
              ${displayPrice}
            </Text>
            <View
              style={{
                backgroundColor: '#1ae79c',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 5,
                marginLeft: 10,
                height: 20,
              }}>
              <Text
                style={{
                  color: '#242F42',
                  fontFamily: 'InterTight-Bold',
                  fontSize: 12,
                }}>
                +5.55%
              </Text>
            </View>
          </View>
        </View>

        <LineGraph
          style={{height: 150, marginBottom: 15}}
          points={pointData}
          animated={true}
          color={'#1ae79c'}
          gradientFillColors={['#0e8a5c', '#444']}
          enablePanGesture
          onPointSelected={p => updateVals(p)}
          enableIndicator={true}
          indicatorPulsating={true}
          lineThickness={3}
          horizontalPadding={0}
          onGestureEnd={() => setDisplayPrice(endPrice)}
        />
      </LinearGradient>
    </View>
  );
};

export default StockDetailGraph;
