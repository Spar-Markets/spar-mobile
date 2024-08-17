import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  FlatList,
  Animated,
} from 'react-native';
import {
  CartesianChart,
  Line,
  useAnimatedPath,
  useChartPressState,
  useLinePath,
  type PointsArray,
} from 'victory-native';
import LinearGradient from 'react-native-linear-gradient';
import getPrices from '../../utility/getPrices';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import {
  useAnimatedReaction,
  useDerivedValue,
  runOnJS,
  SharedValue,
  useSharedValue,
} from 'react-native-reanimated';
import HapticFeedback from 'react-native-haptic-feedback';
import debounce from 'lodash/debounce';
import {
  Canvas,
  Rect,
  Text as SkiaText,
  useFont,
  TextAlign,
  Group,
  Circle,
  Paint,
  RadialGradient,
  vec,
  BlurMask,
  point,
  useImage,
  Box,
  RoundedRect
} from '@shopify/react-native-skia';
import { GraphPoint } from 'react-native-graph';
import { Skeleton } from '@rneui/base';
import { serverUrl, websocketUrl } from '../../constants/global';
import getMarketFraction from '../../utility/getMarketFraction';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { updateStockPrice } from '../../GlobalDataManagment/stockSlice';
import getCurrentPrice from '../../utility/getCurrentPrice';
import { RootState } from '../../GlobalDataManagment/store';
import { Image as SkiaImage } from '@shopify/react-native-skia';
import { useFocusEffect } from '@react-navigation/native';
import TimeButtons from '../InGameComponents/TimeButtons';
import StockDetailsGraphTopBar from './StockDetailsGraphTopBar';

const StockDetailGraph = (props: any) => {
  const [pointData, setPointData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [stockLogoLoaded, setStockLogoLoaded] = useState(false)

  const colorScheme = useColorScheme();

  const [closePriceLineObject, setClosePriceLineObject] = useState<any>({});

  const dispatch = useDispatch();

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width);

  const [timeFrameSelected, setTimeFrameSelected] = useState<string>('1D');
  const [allPointData, setAllPointData] = useState<any>(null);
  const [oneDayClose, setOneDayClose] = useState<number>(0);

  const [currentPrice, setCurrentPrice] = useState<number>(0);

  const { currentAccentColorValue, setCurrentAccentColorValue } = props;

  const stockPrice = useSelector((state: RootState) => state.stock.stockPrice);

  const minY = useRef<number | null>(null)
  const maxY = useRef<number | null>(null)

  useEffect(() => {
    const getPricesForSelectedTime = async () => {
      let prevClose: number = 0
      try {
        // Need to get previous, previous day close price
        const fetchCloseComparison = async () => {
          try {
            const response = await axios.post(`${serverUrl}/closeEndpoint`, {
              ticker: props.ticker,
            });
            //console.log('fetchCloseComparison', response.data);
            setOneDayClose(response.data.lastPrice);
            prevClose = response.data.lastPrice
          } catch (error) {
            console.error('Error fetching close:', error);
          }
        };
        fetchCloseComparison();
        const allPoints = await getPrices(props.ticker, false);
        if (allPoints) {
          console.log("TESTING", prevClose)

          setClosePriceLineObject({
            normalizedValue: prevClose - allPoints['1D'][0].value,
          });


          //console.log("LOG!!", oneDayClose - allPoints['1D'][0].value)

          const normalizedValues = allPoints["1D"].map((point: any) => point.normalizedValue);

          const normalizedPrevClose = prevClose - allPoints['1D'][0].value
          const minNormalizedVal = Math.min(...normalizedValues)
          const maxNormalizedVal = Math.max(...normalizedValues)

          console.log("Hello", normalizedPrevClose, minNormalizedVal, maxNormalizedVal)

          if (minNormalizedVal > normalizedPrevClose) {
            minY.current = normalizedPrevClose
            maxY.current = maxNormalizedVal
          } else if (normalizedPrevClose > maxNormalizedVal) {
            minY.current = minNormalizedVal
            maxY.current = normalizedPrevClose
          } else {
            minY.current = minNormalizedVal
            maxY.current = maxNormalizedVal
          }

          console.log("helllllo", minY.current)


          setPointData(allPoints['1D']);
          setAllPointData(allPoints);

        }
      } catch (error) {
        console.log('Error getting prices:', error);
      }
    };
    getPricesForSelectedTime();
  }, [props.ticker]);

  /*const grabCurrentPrice = async (ticker: string) => {
    try {
      const price = await getCurrentPrice(ticker);
      if (price) {
        setCurrentPrice(price);
        dispatch(updateStockPrice(price));
      }
    } catch (error) {
      console.error('stockdetailgraph: setting redux price error', error);
    }
  };*/

  useEffect(() => {
    if (allPointData && oneDayClose > 0) {
      //grabCurrentPrice(props.ticker);
      setDataLoading(false);
    } else {
      setDataLoading(true);
    }
  }, [allPointData, timeFrameSelected, oneDayClose]);

  const { state, isActive } = useChartPressState({ x: 0, y: { normalizedValue: 0 } });

  const [marketFraction, setMarketFraction] = useState(1);

  useEffect(() => {
    setMarketFraction(getMarketFraction(new Date(Date.now() - 90000)));
  }, [pointData]);

  const currentIndex = useDerivedValue(() => {
    const index =
      timeFrameSelected != '1D'
        ? Math.round((state.x.position.value / width) * (pointData.length - 1))
        : Math.round(
          ((state.x.position.value / width) * (pointData.length - 1)) /
          marketFraction,
        );
    //console.log(index);
    return Math.min(Math.max(index, 0), pointData.length - 1);
  }, [pointData, state]);

  const [chartActive, setChartActive] = useState(false);

  useAnimatedReaction(
    () => currentIndex.value,
    () => {
      if (isActive) {
        runOnJS(setChartActive)(!chartActive);
      } else {
        runOnJS(setChartActive)(false);
      }
    },
  );

  function ToolTip({
    x,
    y,
    color,
  }: {
    x: SharedValue<number>;
    y: SharedValue<number>;
    color: any;
  }) {


    return (
      <Group>
        <Rect
          x={x}
          y={0}
          width={1}
          height={400}
          color={theme.colors.opposite}
        />
        <Circle cx={x} cy={y} r={8} color={theme.colors.background} />
        <Circle cx={x} cy={y} r={6} color={theme.colors.opposite}>

        </Circle>

      </Group>
    );
  }

  function LiveIndicator({ x, y, color }: { x: number; y: number; color: any }) {
    return (
      <Group>
        <Circle cx={x} cy={y} r={7} color={color} opacity={0.2} />
        <Circle cx={x} cy={y} r={3} color={color} />
      </Group>
    );
  }


  const referenceLineObject = Array.from({ length: 50 }, (_, index) => ({
    index: index,
    normalizedValue: closePriceLineObject.normalizedValue,
  }));

  const graphOpacity = useRef(new Animated.Value(0)).current;
  const skeletonOpacity = useRef(new Animated.Value(1)).current;

  const [graphFocused, setGraphFocused] = useState(true)

  useFocusEffect(
    useCallback(() => {
      // Component is focused
      setGraphFocused(true)
      return () => {
        // Component lost focus
        // Set your variable here
        setGraphFocused(false)
        console.log('Screen lost focus');
      };
    }, [])
  );


  useEffect(() => {
    if (allPointData) {
      Animated.parallel([
        Animated.timing(skeletonOpacity, {
          toValue: 0,
          duration: 500, // Adjust the duration as needed
          useNativeDriver: true,
        }),
        Animated.timing(graphOpacity, {
          toValue: 1,
          duration: 500, // Adjust the duration as needed
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [allPointData]);

  useEffect(() => {
    if (props.logoUrl) {
      console.log("TESTTTT", props.logoUrl)
    }
  }, [])

  return (
    <View>
      <View>
        <StockDetailsGraphTopBar
          allPointData={allPointData}
          pointData={pointData}
          setPointData={setPointData}
          dataLoading={dataLoading}
          isActive={isActive}
          timeFrameSelected={timeFrameSelected}
          currentIndex={currentIndex}
          currentAccentColorValue={currentAccentColorValue}
          setCurrentAccentColorValue={setCurrentAccentColorValue}
          state={state}
          oneDayClose={oneDayClose}
          logoUrl={props.logoUrl}
          ticker={props.ticker}
          name={props.name}
        />

        <View style={{ height: 400, marginVertical: 20 }}>

          <Animated.View style={{ opacity: skeletonOpacity, height: 400, position: 'absolute', top: 0, left: 0, right: 0 }}>
            <Skeleton animation={"pulse"} height={400} width={width - 40} style={{ backgroundColor: theme.colors.primary, borderRadius: 5, marginHorizontal: 20, marginVertical: 20 }} skeletonStyle={{ backgroundColor: theme.colors.secondary }}></Skeleton>
          </Animated.View>

          <Animated.View style={{ height: 400, marginVertical: 20, opacity: graphOpacity }}>
            {allPointData && graphFocused && (
              <>
                {timeFrameSelected == '1D' && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}>
                    <CartesianChart
                      data={referenceLineObject}
                      xKey="index"
                      yKeys={['normalizedValue']}
                      domain={{
                        y: [
                          minY.current!,
                          maxY.current!
                        ],
                      }}
                      chartPressState={state}>
                      {({ points, chartBounds }) => {
                        // lowkey a little ragtag to make reference line, but had to decompose type formate of pointArray and makeshift it


                        const repeatedPoints = points.normalizedValue.map(
                          point => ({
                            x: point.x, // Keep x as it is
                            y: point.y, // Set y to the first normalized point's y value
                            xValue: 0,
                            yValue: 0,
                          }),

                        );
                        return (
                          <>
                            <Group>
                              {repeatedPoints.map((point, index) => (
                                <Circle
                                  key={index}
                                  cx={point.x}
                                  cy={point.y!}
                                  r={1} // radius of the dot
                                  color={theme.colors.secondaryText}
                                />
                              ))}
                            </Group>
                          </>
                        );
                      }}
                    </CartesianChart>
                  </View>
                )}
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}>
                  <CartesianChart
                    data={pointData}
                    xKey="index"
                    yKeys={['normalizedValue']}
                    domain={{
                      y: [
                        timeFrameSelected == "1D" ? minY.current! : Math.min(
                          ...pointData.map(item => item.normalizedValue),
                        ),
                        timeFrameSelected == "1D" ? maxY.current! : Math.max(
                          ...pointData.map(item => item.normalizedValue),
                        ),
                      ],
                      x: [
                        0,
                        timeFrameSelected == '1D'
                          ? (pointData.length - 1) /
                          getMarketFraction(new Date(Date.now() - 90000))
                          : pointData.length - 1,
                      ],
                    }}
                    chartPressState={state}>
                    {({ points }) => {
                      // lowkey a little ragtag to make reference line, but had to decompose type formate of pointArray and makeshift it
                      const firstNormalizedPoint = points.normalizedValue[0]; // Extract the first normalized point

                      return (
                        <>
                          <Group>
                            <Line
                              points={points.normalizedValue.slice(0)}
                              color={currentAccentColorValue}
                              strokeWidth={2.5}
                              curveType="linear">
                            </Line>
                            {isActive && (
                              <ToolTip
                                x={state.x.position}
                                y={state.y.normalizedValue.position}
                                color={currentAccentColorValue}
                              />
                            )}
                            {timeFrameSelected == '1D' && (
                              <LiveIndicator
                                x={
                                  points.normalizedValue[
                                    points.normalizedValue.length - 1
                                  ].x
                                }
                                y={
                                  points.normalizedValue[
                                    points.normalizedValue.length - 1
                                  ].y!
                                }
                                color={currentAccentColorValue}
                              />
                            )}
                          </Group>
                        </>
                      );
                    }}
                  </CartesianChart>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </View>
      <View>
        <TimeButtons timeFrameSelected={timeFrameSelected} setTimeFrame={setTimeFrameSelected} setPointData={setPointData} allPointData={allPointData} currentAccentColorValue={props.currentAccentColorValue} />
      </View>
    </View>
  );
};

export default StockDetailGraph;
