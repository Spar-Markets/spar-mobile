import React, {useState, useEffect, useCallback} from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {GraphPoint, LineGraph} from 'react-native-graph';
import LinearGradient from 'react-native-linear-gradient';
import getPrices from '../../utility/getPrices';
import { CartesianChart, Line } from 'victory-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';

const StockDetailGraph = (props: any) => {
  const colorScheme = useColorScheme();
  const [pointData, setPointData] = useState<GraphPoint[]>([]);
  const [displayPrice, setDisplayPrice] = useState('');
  const [endPrice, setEndPrice] = useState('');
  const [formattedPointData, setFormattedPointData] = useState<any[]>([])
  const [minY, setMinY] = useState(0)
  const [maxY, setMaxY] = useState(0)

  const [dataLoading, setDataLoading] = useState(true)
  const [imageLoading, setImageLoading] = useState(true)

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width)

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

  useEffect(() => {
    const formattedData = pointData.map((item: any, index:number) => ({
      normalizedValue: item.value - pointData[0].value,
      value: item.value,
      index: index,
      date: new Date(item.date)
    }))

    setMaxY(Math.max(...formattedData.map((item:any) => item.normalizedValue)))
    setMinY(Math.min(...formattedData.map((item:any) => item.normalizedValue)))
    if (formattedData.length > 0) {
      setDisplayPrice(formattedData[formattedData.length-1].value)
    }
    setFormattedPointData(formattedData)
    setDataLoading(false);
  }, [pointData])

  return (
    <View>
      { !dataLoading && <View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 10}}>
          <Image source={{uri: props.iconUrl}} onLoad={() => setImageLoading(false)} style={{width: 40, height: 40, borderRadius: 50}}/>
          <View>
            <Text style={styles.stockDetailsTickerText}>{props.ticker}</Text>
            <Text style={styles.stockDetailsNameText}>{props.name}</Text>
          </View>
          <View style={{flex: 1}}/>
          <View>
            <Text style={styles.stockPriceText}>${displayPrice}</Text>
            <Text style={styles.stockPercentText}>$4.43 (2.42%)</Text>
          </View>
        </View>

        <View style={{height: 400}}>
          <CartesianChart data={formattedPointData} xKey="index" yKeys={["normalizedValue"]}
            domain={{y: [minY, maxY],
              x: [0, formattedPointData.length]
            }}>
            {({ points }) => (
            // 👇 and we'll use the Line component to render a line path.
              <>
              <Line points={points.normalizedValue} color={theme.colors.stockUpAccent} 
              strokeWidth={2} animate={{ type: "timing", duration: 300 }}/>
              </>
            )}
          </CartesianChart>
        </View>
      </View>}
    </View>
  );
};

export default StockDetailGraph;
