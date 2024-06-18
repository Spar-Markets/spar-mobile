import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  FlatList,
} from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import LinearGradient from 'react-native-linear-gradient';
import getPrices from '../../utility/getPrices';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useAnimatedReaction, useDerivedValue, runOnJS, SharedValue, useSharedValue } from "react-native-reanimated";
import HapticFeedback from "react-native-haptic-feedback";
import debounce from 'lodash/debounce';
import { Canvas, Rect, Text as SKText, useFont, TextAlign } from '@shopify/react-native-skia';
import { GraphPoint } from 'react-native-graph';

const StockDetailGraph = (props: any) => {
  const colorScheme = useColorScheme();
  const [pointData, setPointData] = useState<GraphPoint[]>([]);
  const [displayPrice, setDisplayPrice] = useState<number>();
  const [endPrice, setEndPrice] = useState<number>();
  const [formattedPointData, setFormattedPointData] = useState<any[]>([]);
  const [minY, setMinY] = useState(0);
  const [maxY, setMaxY] = useState(0);
  const [value, setValue] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width);

  const [selectedTime, setSelectedTime] = useState("");
  const [percentageAndValueDiff, setPercentageAndValueDiff] = useState("");
  const [currentColorAccent, setCurrentColorAccent] = useState<any>();

  const [timeFrameSelected, setTimeFrameSelected] = useState('1D');

  const TimeButton = useCallback(({ timeFrame }:any) => (
    <View>
      {timeFrameSelected == timeFrame ? (
        <TouchableOpacity
          onPress={() => setTimeFrameSelected(timeFrame)}
          style={styles.timeButtonSelectedContainer}>
          <Text style={styles.timeButtonSelectedText}>{timeFrame}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setTimeFrameSelected(timeFrame)}
          style={styles.timeButtonContainer}>
          <Text style={styles.timeButtonText}>{timeFrame}</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [timeFrameSelected, styles]);

  useEffect(() => {
    const run = async () => {
      const points = await getPrices(props.ticker, props.timeframe);
      if (points) {
        setPointData(points);
        const lastValue = points[points.length - 1].value;
        setEndPrice(lastValue);
      }
    };

    run();
  }, [props.ticker, props.timeframe]);

  useEffect(() => {
    const formattedData = pointData.map((item: any, index: number) => ({
      normalizedValue: item.value - pointData[0].value,
      value: item.value,
      index: index,
      date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    console.log(formattedData)

    const max = Math.max(...formattedData.map(item => item.normalizedValue));
    const min = Math.min(...formattedData.map(item => item.normalizedValue));

    setMaxY(max + 0.1 * max);
    setMinY(min < 0 ? min + 0.1 * min : min - 0.1 * min);

    if (formattedData.length > 0) {
      const lastValue = formattedData[formattedData.length - 1].value;
      setDisplayPrice(lastValue);
      const percentageDiff = ((100 * (lastValue - formattedData[0].value) / lastValue)).toFixed(2);
      const valueDiff = (lastValue - formattedData[0].value).toFixed(2);
      setPercentageAndValueDiff(`$${valueDiff} (${percentageDiff}%)`);
    }
    setFormattedPointData(formattedData);
    setDataLoading(false);
  }, [pointData]);

  const { state, isActive } = useChartPressState({ x: 0, y: { normalizedValue: 0 } });

  const currentIndex = useDerivedValue(() => {
    const index = Math.round(state.x.position.value / width * formattedPointData.length);
    return Math.min(Math.max(index, 0), formattedPointData.length - 1);
  });

  const updateDisplayPrice = (index: number) => {
    if (formattedPointData[index]) {
      const currentPrice = formattedPointData[index].value;
      const newValue = Math.round(currentPrice * 100) / 100;
      let displayPriceCandidate = newValue.toFixed(2);

      setDisplayPrice(parseFloat(displayPriceCandidate));      
    }
  };

  const calculteDifference = (index: number) => {

    const currentPoint = formattedPointData[index];
    const initialPoint = formattedPointData[0];

    if (initialPoint.value === 0) {
      console.error("Initial value is zero, cannot calculate percentage difference");
      return;
    }

    const valueDiff = currentPoint.value - initialPoint.value;
    const percentageDiff = (100 * (valueDiff / currentPoint.value)).toFixed(2);

    setCurrentColorAccent(valueDiff < 0 ? theme.colors.stockDownAccent : theme.colors.stockUpAccent);

    const formattedValueDiff = Math.abs(valueDiff).toFixed(2);
    const result = `$${formattedValueDiff} (${percentageDiff}%)`;

    setPercentageAndValueDiff(result);
  }

  const triggerHapticFeedback = () => {
    HapticFeedback.trigger("impactSmall", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false
    });
  };

  useAnimatedReaction(
    () => currentIndex.value,
    (index) => {
      if (isActive) {
        //runOnJS(setSelectedTime)("• " + formattedPointData[index].date);
        runOnJS(updateDisplayPrice)(index);
        //runOnJS(triggerHapticFeedback)();
      } else {
        //runOnJS(setSelectedTime)("");
        runOnJS(updateDisplayPrice)(formattedPointData.length - 1);
      }
    }
  );

  function ToolTip({ x, y }: { x: SharedValue<number>, y: SharedValue<number> }) {
    return (
      <Rect x={x} y={12} width={2} height={400} color={theme.colors.tertiary} />
    );
  }



  /*function PriceDisplay({ x, y }: { x: SharedValue<number>, y: SharedValue<number>}) {

    const priceFont = useFont(require("../../assets/fonts/InterTight-Black.ttf"), 24)

    const priceValue = useDerivedValue(() => {
      const price = "$" + state.y.normalizedValue.value.value.toFixed(2)
      return price
    }, [state])

    const textWidth = 100


    if (!priceFont) {
      return null; // Handle case when font is not loaded
    }
    return (
        <SKText x={width-textWidth} y={20} color={theme.colors.text} text={priceValue} font={priceFont}></SKText>
    );
  }*/
  

  const DATA = Array.from({ length: 50 }, (_, i) => ({
    index: i,
    value: 0
  }));


  const tickerFont = useFont(require("../../assets/fonts/InterTight-Black.ttf"), 18)

  if (formattedPointData)

  return (
    <View>
      {!dataLoading && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 10 }}>
            <Image source={{ uri: props.iconUrl }} onLoad={() => setImageLoading(false)} style={{ width: 40, height: 40, borderRadius: 50 }} />
            <View>
              <Text style={styles.stockDetailsTickerText}>{props.ticker}</Text>
              {/* <Text style={styles.stockDetailsNameText}>{props.name}</Text> */}
            </View>
            <View style={{ flex: 1 }} />
            <View>
              <Text style={styles.stockPriceText}>${displayPrice?.toFixed(2)}</Text>
              <Text style={[styles.stockPercentText, { color: currentColorAccent }]}>{percentageAndValueDiff} {selectedTime}</Text>
            </View>
          </View>

          <View style={{ height: 300, marginTop: 20, }}>
      
              <CartesianChart data={formattedPointData} xKey="index" yKeys={["normalizedValue"]}
                domain={{ y: [minY, maxY], x: [0, formattedPointData.length] }} chartPressState={state}>
                {({ points }) => (
                  <>
                    <Line points={points.normalizedValue} color={"red"} strokeWidth={2} animate={{ type: "timing", duration: 300 }} />
                    {isActive && <ToolTip x={state.x.position} y={state.y.normalizedValue.position} />}
                  </>
                )}
              </CartesianChart>
            
          </View>

          <FlatList
            horizontal
            data={['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'MAX']}
            renderItem={({ item }) => <TimeButton timeFrame={item} />}
            keyExtractor={(item) => item}
            contentContainerStyle={{ marginTop: 20, marginRight: 15, marginLeft: 15 }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

export default StockDetailGraph;
