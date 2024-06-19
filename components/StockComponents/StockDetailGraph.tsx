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
import { CartesianChart, Line, useAnimatedPath, useChartPressState, useLinePath, type PointsArray} from 'victory-native';
import LinearGradient from 'react-native-linear-gradient';
import getPrices from '../../utility/getPrices';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useAnimatedReaction, useDerivedValue, runOnJS, SharedValue, useSharedValue } from "react-native-reanimated";
import HapticFeedback from "react-native-haptic-feedback";
import debounce from 'lodash/debounce';
import { Canvas, Rect, Text as SkiaText, useFont, TextAlign, Group, Circle, Paint } from '@shopify/react-native-skia';
import { GraphPoint } from 'react-native-graph';

const StockDetailGraph = (props: any) => {
  const colorScheme = useColorScheme();
  const [pointData, setPointData] = useState<any[]>([]);
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

  const [timeFrameSelected, setTimeFrameSelected] = useState<string>("1D");
  const [allPointData, setAllPointData] = useState<any>(null)

  const [panningGraph, setPanningGraph] = useState(false)

  const [currentAccentColorValue, setCurrentAccentColorValue] = useState(theme.colors.stockUpAccent);

  const TimeButton = ({ timeFrame, color }:any) => (
    <View>
      {timeFrameSelected == timeFrame ? (
        <TouchableOpacity
          style={[styles.timeButtonSelectedContainer, {backgroundColor: currentAccentColorValue}]}>
          <Text style={styles.timeButtonSelectedText}>{timeFrame}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            setTimeFrameSelected(timeFrame)
            setPointData(allPointData[timeFrame])
          }}
          style={styles.timeButtonContainer}>
          <Text style={[styles.timeButtonText, {color: currentAccentColorValue}]}>{timeFrame}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  useEffect(() => {
    const getPricesForSelectedTime = async () => {
      const allPoints = await getPrices(props.ticker);
      if (allPoints) {
        setPointData(allPoints["1D"])
        setAllPointData(allPoints)
      }
    }
    getPricesForSelectedTime()
    
  }, [props.ticker]);

  useEffect(() => {
    if (allPointData) {
      setDataLoading(false);
    } else {
      setDataLoading(true);
    }
  }, [allPointData, timeFrameSelected]);

  const { state, isActive } = useChartPressState({ x: 0, y: { normalizedValue: 0 } });

  const currentIndex = useDerivedValue(() => {
    const index = Math.round(state.x.position.value / width * pointData.length);
    return Math.min(Math.max(index, 0), pointData.length - 1);
  }, [pointData, state]);



  const [chartActive, setChartActive] = useState(false)

  useAnimatedReaction(
    () => currentIndex.value,
    () => {
      if (isActive) {
        runOnJS(setChartActive)(!chartActive)
      } else {
        runOnJS(setChartActive)(false)
      }
    }
  );

  function ToolTip({ x, y, color }: { x: SharedValue<number>, y: SharedValue<number>, color: any }) {
    return (
      <Group>
        <Circle cx={x} cy={y} r={20} color={color} opacity={0.15} />
        <Circle cx={x} cy={y} r={10} color={color} opacity={0.5} />
        <Circle cx={x} cy={y} r={3} color={color}>
          <Paint style="stroke" strokeWidth={2} color="white" />
        </Circle>
      </Group>
    );
  }


  //graph and data aninmation funtions

  const normalizedPriceValue = useDerivedValue(() => {
    return state.y.normalizedValue.value
  }, [state])  

  //gets percent difference based on array data
  const animatedPercentDiff = useDerivedValue(() => {
    if (pointData.length > 0) {
      const percentDiff = ((pointData[currentIndex.value]?.value) - 
      pointData[0].value) / Math.abs(pointData[0].value);
      
      return (100*percentDiff).toFixed(2)
    }
    return "0.00"
  }, [pointData]);

  const totalPercentDiff = useDerivedValue(() => {
    if (pointData.length > 0) {
      const percentDiff = ((pointData[pointData.length-1]?.value) - 
      pointData[0].value) / Math.abs(pointData[0].value)

      return (100*percentDiff).toFixed(2)
    }
  }, [pointData])

  const animatedValueDiff = useDerivedValue(() => {
    if (pointData.length > 0) {
      const valueDiff = ((pointData[currentIndex.value]?.value) - 
      pointData[0].value)
    
      if (valueDiff < 0) {
        return "-$" + Math.abs(valueDiff).toFixed(2) //formatting negative differences
      } 
      return "$" + Math.abs(valueDiff).toFixed(2)
    }
    return "0.00";
  }, [pointData]);

  const totalValueDiff = useDerivedValue(() => {
    if (pointData.length > 0) {
      const valueDiff = ((pointData[pointData.length-1]?.value) - 
      pointData[0].value)
    
      if (valueDiff < 0) {
        return "-$" + Math.abs(valueDiff).toFixed(2)
      } 
      return "$" + Math.abs(valueDiff).toFixed(2)
    }
    return "0.00";
  }, [pointData]);

  /*const currentAccentColor = useDerivedValue(() => {
    if (isActive) {
      if (parseFloat(animatedPercentDiff.value) >= 0) {
        return theme.colors.stockUpAccent;
      } else {
        return theme.colors.stockDownAccent;
      }
    } else {
      if (parseFloat(totalPercentDiff.value!) >= 0) {
        return theme.colors.stockUpAccent;
      } else {
        return theme.colors.stockDownAccent;
      }
    }
  }, [isActive, animatedPercentDiff, totalPercentDiff, theme.colors.stockUpAccent, theme.colors.stockDownAccent]);*/


  const currentDate = useDerivedValue(() => {
    if (pointData.length > 0) {
      return " • " + pointData[currentIndex.value]?.date
    }
    return ""
  }, [pointData, state])

  const lastDate = useDerivedValue(() => {
    if (pointData.length > 0) {
      return " • " + pointData[pointData.length-1]?.date
    }
    return ""
  }, [pointData, state])
  

  const priceFontSize = 26
  const priceFont = useFont(require("../../assets/fonts/InterTight-Black.ttf"), priceFontSize)

  const percentValFontSize = 12
  const percentValFont = useFont(require("../../assets/fonts/InterTight-Bold.ttf"), percentValFontSize)
  


  useEffect(() => {
    if (pointData.length != 0 ) {
        if(props.liveprice !== pointData[pointData.length-1].value) {
      } else {
        console.log("loading")
      }
    }
  }, [props.livePrice]);

  const [onloadPercentDiff, setOnLoadPercentDiff] = useState("0.00");
  const [onLoadValueDiff, setOnLoadValueDiff] = useState("0.00");

  const calculatePercentAndValueDiffAndColor = useCallback(() => {
    if (pointData.length > 0) {
      const percentDiff =
        ((pointData[pointData.length - 1]?.value || 0) - pointData[0].value) /
        Math.abs(pointData[0].value);
      const percentDiffValue = (100 * percentDiff).toFixed(2);
      setOnLoadPercentDiff(percentDiffValue);
  
      const valueDiff =
        (pointData[pointData.length - 1]?.value || 0) - pointData[0].value;
  
      if (valueDiff < 0) {
        setOnLoadValueDiff("-$" + Math.abs(valueDiff).toFixed(2));
        setCurrentAccentColorValue(theme.colors.stockDownAccent)
      } else {
        setOnLoadValueDiff("$" + Math.abs(valueDiff).toFixed(2));
        setCurrentAccentColorValue(theme.colors.stockUpAccent)
      }
    } else {
      setOnLoadPercentDiff("0.00");
      setOnLoadValueDiff("0.00");
    }
  }, [pointData]);

  useEffect(() => {
    calculatePercentAndValueDiffAndColor();
  }, [pointData, timeFrameSelected, calculatePercentAndValueDiffAndColor]);

  
  return (
    <View>
      {!dataLoading && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 10 }}>
            <Image source={{ uri: props.iconUrl }} onLoad={() => setImageLoading(false)} style={{ width: 20, height: 20, borderRadius: 50 }} />
            <View>
              <Text style={styles.stockDetailsTickerText}>{props.ticker}</Text>
              {/* <Text style={styles.stockDetailsNameText}>{props.name}</Text> */}
            </View>
            <View style={{ flex: 1 }} />
            {/*<View>
              <Text style={styles.stockPriceText}>${displayPrice?.toFixed(2)}</Text>
              <Text style={[styles.stockPercentText, { color: currentColorAccent }]}>{percentageAndValueDiff} {selectedTime}</Text>
            </View>*/}
          </View>

          <View style={{ height: 400 }}>
              {allPointData &&
              <>
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}>
                  <CartesianChart data={pointData} xKey="index" yKeys={["normalizedValue"]}
                    domain={{ y: 
                    [
                      /*Math.min(...formattedPointData.map(item => item.normalizedValue)) + 
                      0.5 * Math.min(...formattedPointData.map(item => item.normalizedValue)),
                      Math.max(...formattedPointData.map(item => item.normalizedValue)) +
                      0.5*Math.max(...formattedPointData.map(item => item.normalizedValue))*/
                      Math.min(...pointData.map(item => item.normalizedValue)) != 0 ? Math.min(...pointData.map(item => item.normalizedValue)) 
                      - 0.3*(Math.max(...pointData.map(item => item.normalizedValue)) + Math.abs(Math.min(...pointData.map(item => item.normalizedValue)))) : -0.2*(Math.max(...pointData.map(item => item.normalizedValue))),
                      Math.max(...pointData.map(item => item.normalizedValue))
                    ], 
                      x: [0, pointData.length] }} chartPressState={state}>
                    {({ points }) => {
                      
                      // lowkey a little ragtag to make reference line, but had to decompose type formate of pointArray and makeshift it
                      const firstNormalizedPoint = points.normalizedValue[0]; // Extract the first normalized point
                      const repeatedPoints = points.normalizedValue.map((point, index) => ({
                        x: point.x, // Keep x as it is
                        y: firstNormalizedPoint.y, // Set y to the first normalized point's y value
                        xValue: 0,
                        yValue: 0
                      }));
                      return (
                      <>
                        <Group>
                        <SkiaText 
                          text={isActive ? "$" + (normalizedPriceValue.value.value + pointData[0].value).toFixed(2) : "$" + (pointData[pointData.length-1].value).toFixed(2)}
                          x={20}
                          y={priceFontSize}
                          font={priceFont}
                          color={theme.colors.text}
                        ></SkiaText>
                        <SkiaText 
                          text={isActive ? animatedValueDiff.value + " (" + animatedPercentDiff.value + "%)" + currentDate.value :

                                onLoadValueDiff + " (" + onloadPercentDiff + "%)"  + lastDate.value
                          }
                          x={20}
                          y={priceFontSize + percentValFontSize + 5}
                          font={percentValFont}
                          color={currentAccentColorValue}
                          
                        ></SkiaText>
                        </Group>
                        <Group transform={[{ translateY: priceFontSize + percentValFontSize + 20 }]}>
                        <Line points={repeatedPoints} color={theme.colors.tertiary} 
                        strokeWidth={2} animate={{ type: "timing", duration: 300 }} curveType='linear'></Line>
                        <Line points={points.normalizedValue} color={currentAccentColorValue} 
                        strokeWidth={2} animate={{ type: "timing", duration: 300 }} curveType='linear'></Line>
                        {isActive && <ToolTip x={state.x.position} y={state.y.normalizedValue.position} color={currentAccentColorValue}/>}
                        </Group>
                      </>
                      )
                    
                    }}
                  </CartesianChart>
                </View>

                </>
             }
            
          </View>
          <View style={styles.timeCardContainer}>
          <FlatList
            horizontal
            data={['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'MAX']}
            renderItem={({ item }) => <TimeButton timeFrame={item} color={currentAccentColorValue}/>}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            />
            </View>
        </View>
      )}
    </View>
  );
};

export default StockDetailGraph;
