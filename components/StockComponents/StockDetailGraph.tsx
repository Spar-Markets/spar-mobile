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
import { Canvas, Rect, Text as SkiaText, useFont, TextAlign, Group, Circle, Paint, RadialGradient, vec, BlurMask, point } from '@shopify/react-native-skia';
import { GraphPoint } from 'react-native-graph';
import { Skeleton } from '@rneui/base';

const StockDetailGraph = (props: any) => {
  const [pointData, setPointData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const colorScheme = useColorScheme()

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width);

  const [timeFrameSelected, setTimeFrameSelected] = useState<string>("1D");
  const [allPointData, setAllPointData] = useState<any>(null)

  const { currentAccentColorValue, setCurrentAccentColorValue } = props;

  const TimeButton = ({ timeFrame }:any) => (
    <View>
      {timeFrameSelected == timeFrame ? (
        <TouchableOpacity
          style={[styles.timeButtonSelectedContainer, {backgroundColor: currentAccentColorValue}]}>
          <Text style={styles.timeButtonSelectedText}>{timeFrame}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            if (allPointData) {
            setTimeFrameSelected(timeFrame)
            setPointData(allPointData[timeFrame])
            HapticFeedback.trigger("impactMedium", {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false
            });
            }
          }}
          style={styles.timeButtonContainer}>
          <Text style={[styles.timeButtonText, {color: currentAccentColorValue}]}>{timeFrame}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  useEffect(() => {
    const getPricesForSelectedTime = async () => {
      try {
        const allPoints = await getPrices(props.ticker, false);
        if (allPoints) {
          //console.log("ALL POINT DATA:", allPoints["3M"])
          setPointData(allPoints["1D"])
          setAllPointData(allPoints)
          //console.log("abcd",allPoints["3M"])
        }
      } catch(error) {
        console.log("Error getting prices:", error)
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
  
  const getMarketFraction = (currentDate:Date) => {
    // Define the market open and close times
    const marketOpen = new Date(currentDate);
    marketOpen.setHours(9, 30, 0, 0); // 9:30 AM

    const marketClose = new Date(currentDate);
    marketClose.setHours(16, 0, 0, 0); // 4:00 PM

    // Calculate the total market duration in milliseconds
    const marketDuration = marketClose.getTime() - marketOpen.getTime();

    // Calculate the elapsed time from market open to the current time
    const elapsedTime = currentDate.getTime() - marketOpen.getTime();

    // Calculate the fraction of the market day completed
    const fractionCompleted = elapsedTime / marketDuration;

    // Ensure the fraction is between 0 and 1
    //console.log(fractionCompleted)
    return Math.min(Math.max(fractionCompleted, 0), 1);
  }

  const [marketFraction, setMarketFraction] = useState(1);

  useEffect(() => {
    setMarketFraction(getMarketFraction(new Date(Date.now() - 90000)));
  }, [pointData]);
  
  const currentIndex = useDerivedValue(() => {
    const index = timeFrameSelected != "1D" ? Math.round(state.x.position.value / width * (pointData.length-1)) 
    : Math.round(state.x.position.value / width * (pointData.length-1)/marketFraction);
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
  const spacing = useSharedValue(1);

  function ToolTip({ x, y, color }: { x: SharedValue<number>, y: SharedValue<number>, color: any }) {
    
    const adjustedX = useDerivedValue(() => {
      return x.value - spacing.value;
    })

    return (
      <Group>
        {/*<SkiaText                           
          text={"Time"}
          x={adjustedX}
          font={percentValFont}
    color={theme.colors.text}/>*/}
        <Rect x={adjustedX} y={0} width={2} height={400} color={theme.colors.secondaryText}/>
      </Group>
    );
  }

  function LiveIndicator({ x, y, color }: { x: number, y: number, color: any }) {
    return (
      <Group>
        <Circle cx={x} cy={y} r={12} color={color} opacity={0.05} />
        <Circle cx={x} cy={y} r={7} color={color} opacity={0.2} />
        <Circle cx={x} cy={y} r={3} color={color}/>
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

  const currentDate = useDerivedValue(() => {
    if (pointData.length > 0) {
      console.log(currentIndex.value, pointData[currentIndex.value]?.date)
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
  


  /*useEffect(() => {
    if (pointData.length != 0 ) {
      if (props.liveprice) {
        console.log("live price, " + props.liveprice)
      } else {
        console.log("loading")
      }
    }
  }, []);*/

  const [onloadPercentDiff, setOnLoadPercentDiff] = useState("0.00");
  const [onLoadValueDiff, setOnLoadValueDiff] = useState("0.00");
  const [currentGradientAccent, setCurrentGradientAccent] = useState("")

  const calculatePercentAndValueDiffAndColor = useCallback(() => {
    if (pointData.length > 0) {
      const percentDiff =
        ((pointData[pointData.length - 1]?.value || 0) - pointData[0].value) /
        Math.abs(pointData[0].value);
      const percentDiffValue = (100 * percentDiff).toFixed(2);
      setOnLoadPercentDiff(percentDiffValue);
  
      const valueDiff =
        (pointData[pointData.length - 1]?.value || 0) - pointData[0].value;
      if (pointData) {
      if (valueDiff < 0) {
        setOnLoadValueDiff("-$" + Math.abs(valueDiff).toFixed(2));
        setCurrentAccentColorValue(theme.colors.stockDownAccent)
        setCurrentGradientAccent("#3b0a06")
      } else {
        setOnLoadValueDiff("$" + Math.abs(valueDiff).toFixed(2));
        setCurrentAccentColorValue(theme.colors.stockUpAccent)
        setCurrentGradientAccent("#063b24")
      }
      }
    } else {
      setOnLoadPercentDiff("0.00");
      setOnLoadValueDiff("0.00");
    }
  }, [pointData, colorScheme]);

  const [livePrice, setPassingLivePrice] = useState<any>(null)

  useEffect(() => {
    calculatePercentAndValueDiffAndColor();
  }, [pointData, colorScheme, livePrice]);

  function uint8ArrayToString(array:any) {
    return array.reduce((data:any, byte:any) => data + String.fromCharCode(byte), '');
  }


  const ws = useRef<WebSocket | null>(null);

  const [retries, setRetries] = useState(0);

  const MAX_RETRIES = 5;  // Maximum number of retry attempts
  const RETRY_DELAY = 2000; // Delay between retries in milliseconds

  const setupSocket = async (ticker: any) => {
    /*if (ws.current && (ws.current.readyState === WebSocket.OPEN || 
      ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.CLOSING)) {
      // WebSocket is already open or connecting, no need to create a new one
      console.log("WS FROM RETURN CHECK:", ws.current)
      return;
    }*/
   
    const socket = new WebSocket('ws://10.0.0.127:3001');

    ws.current = socket;
    
    ws.current.onopen = () => {
      console.log(`Connected to ${ticker}, but not ready for messages...`);
      if (ws.current!.readyState === WebSocket.OPEN) {
        console.log(`Connection for ${ticker} is open and ready for messages`);
        ws.current!.send(JSON.stringify({ ticker: ticker, status: 'add' }));
      } else {
        console.log('WebSocket is not open:', ws.current!.readyState);
      }
    };

    ws.current.onmessage = (event) => {
      const buffer = new Uint8Array(event.data);
      const message = uint8ArrayToString(buffer);
      
      //console.log(`Websocket Received message: ${message}`);
      

      try {
        const jsonMessage = JSON.parse(message);
        setPassingLivePrice(jsonMessage);
      } catch (error) {
        setPassingLivePrice(message);
      }
    };

    ws.current.onerror = (error) => {
      console.log('WebSocket error:', error || JSON.stringify(error));
      if (retries < MAX_RETRIES) {
        console.log(`Retrying connection (${retries + 1}/${MAX_RETRIES})...`);
        setRetries(retries + 1);
        setTimeout(() => {
          setupSocket(ticker);
        }, RETRY_DELAY);
      } else {
        console.error('Maximum retry attempts reached. Unable to connect to WebSocket.');
      }
    };

    ws.current.onclose = () => {
      console.log(`Connection to ${ticker} closed`);
    };
  };

  useEffect(() => {
    //console.log("SETTING UP SOCKET WITH:", props.ticker);
    setupSocket(props.ticker);

    return () => {
      if (ws.current) {
        ws.current.send(JSON.stringify({ ticker: props.ticker, status: 'delete' }));
        ws.current.close(1000, 'Closing websocket connection due to page being closed');
        //console.log('Closed websocket connection due to page closing');
        ws.current = null;  // Ensure the reference is cleared
      }
    };
  }, [props.ticker]);

  /*useEffect(() => {
    if (livePrice) {
      console.log("live price", livePrice[0]?.op)
      pointData[pointData.length-1].normalizedValue = livePrice[0]?.op - pointData[0].value
    }
  }, [livePrice])*/


  const [trackingTimeStamp, setTrackingTimeStamp] = useState<any>(null)
  const [lastInterval, setLastInterval] = useState<any>(null);
  const [isFirstAnimation, setIsFirstAnimation] = useState(true)

  useEffect(() => {
    if (timeFrameSelected == "1D") {
    if (livePrice && pointData.length > 0) {
      const livePriceTime = new Date(livePrice[0]?.e);
      const livePriceMinutes = livePriceTime.getMinutes();
      const livePriceSeconds = livePriceTime.getSeconds();

      const formattedLivePriceTime = livePriceTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Function to check if the timestamp is close to a 5-minute interval
      const isCloseToFiveMinuteInterval = (minutes:any, seconds:any) => {
        const remainder = minutes % 5;
        return (
          (remainder === 0 && seconds < 30) //|| // Close to the start of a 5-minute interval
          //(remainder === 4 && seconds > 30)    // Close to the end of a 5-minute interval
        );
      };

      const currentInterval = Math.floor(livePriceMinutes / 5);

      if (isCloseToFiveMinuteInterval(livePriceMinutes, livePriceSeconds) && currentInterval !== lastInterval) {
        console.log("ADDING DATA POINT");
        setPointData((prevPointData) => {
          const newPointData = [...prevPointData];
          // Update the last point with the current live price
          newPointData[newPointData.length - 1] = {
            ...newPointData[newPointData.length - 1],
            normalizedValue: livePrice[0]?.c - prevPointData[0].value,
            value: livePrice[0]?.c,
            date: formattedLivePriceTime,
          };
          // Add a new point with the live price
          newPointData.push({
            value: livePrice[0]?.c,
            normalizedValue: livePrice[0]?.c - prevPointData[0].value,
            date: formattedLivePriceTime,
          });
          setTrackingTimeStamp(livePrice[0]?.e);
          return newPointData;
        });
        setLastInterval(currentInterval); // Update the last interval
      } else {
        console.log("animated point");
        if (isFirstAnimation == true) {
        setPointData((prevPointData) => {
          const newPointData = [...prevPointData, {}];
          // Update only the last point with the current live price and date
          newPointData[newPointData.length - 1] = {
            //...newPointData[newPointData.length - 1],
            date: formattedLivePriceTime,
            normalizedValue: livePrice[0]?.c - prevPointData[0].value,
            value: livePrice[0]?.c,
          };
          //console.log(newPointData[newPointData.length - 1].date);
          return newPointData;
        });
        setIsFirstAnimation(false)
        } else {
          setPointData((prevPointData) => {
            const newPointData = [...prevPointData];
            // Update only the last point with the current live price and date
            newPointData[newPointData.length - 1] = {
              //...newPointData[newPointData.length - 1],
              date: formattedLivePriceTime,
              normalizedValue: livePrice[0]?.c - prevPointData[0].value,
              value: livePrice[0]?.c,
            };
            //console.log(newPointData[newPointData.length - 1].date);
            return newPointData;
          });
        }
      }
    }
  }
  }, [livePrice]);
  
  return (
    <View>
      {!dataLoading && pointData ? (
        <View>
          <View style={{marginHorizontal: 20, marginTop: 10, flexDirection:'row'}}>
            <View style={{flexDirection: 'row', gap: 10}}>
              {props.logoUrl != "logoUrlError" && <Image source={{ uri: props.logoUrl }} style={{ aspectRatio: 1, borderRadius: 50}} />}
              <View style={{marginVertical: 1}}>
                <Text style={styles.stockDetailsTickerText}>{props.ticker}</Text>
                <Text style={[styles.stockDetailsNameText, {width: width/3}]} numberOfLines={1} ellipsizeMode='tail'>{props.name}</Text>
              </View>
            </View>
            <View style={{flex: 1}}/>
            {isActive ? 
            <View>
              <Text style={styles.stockPriceText}>${pointData[currentIndex.value].value.toFixed(2).split(".")[0]}
                <Text style={{fontSize: 15}}>.{pointData[currentIndex.value].value.toFixed(2).split(".")[1]}</Text>
              </Text>
              <Text style={[styles.stockPercentText, {color: currentAccentColorValue}]}>{animatedValueDiff.value + " (" + animatedPercentDiff.value + "%)" + currentDate.value}</Text>
            </View> : 
            <View>
              <Text style={styles.stockPriceText}>${pointData[pointData.length-1].value.toFixed(2).split(".")[0]}
                <Text style={{fontSize: 15}}>.{pointData[pointData.length-1].value.toFixed(2).split(".")[1]}</Text>
              </Text>
              <Text style={[styles.stockPercentText, {color: currentAccentColorValue}]}>{onLoadValueDiff + " (" + onloadPercentDiff + "%)" + lastDate.value}</Text>
            </View>
            }
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
                {/*reference line*/}
                <CartesianChart data={pointData} xKey="index" yKeys={["normalizedValue"]}
                  domain={{ y: 
                  [
                    Math.min(...pointData.map(item => item.normalizedValue)),
                    Math.max(...pointData.map(item => item.normalizedValue))
                  ], 
                    }} chartPressState={state}>
                    {({ points }) => {
                    
                    // lowkey a little ragtag to make reference line, but had to decompose type formate of pointArray and makeshift it
                    const firstNormalizedPoint = points.normalizedValue[0]; // Extract the first normalized point
                    const repeatedPoints = points.normalizedValue.map((point) => ({
                      x: point.x, // Keep x as it is
                      y: firstNormalizedPoint.y, // Set y to the first normalized point's y value
                      xValue: 0,
                      yValue: 0
                    }));
                    return (
                    <>
                      <Group>
                      <Line points={repeatedPoints} color={theme.colors.tertiary} 
                      strokeWidth={1} animate={{ type: "timing", duration: 300 }} curveType='linear'></Line>
                      </Group>
                    </>
                    )
                  
                  }}
                </CartesianChart>
              </View>
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
                      Math.min(...pointData.map(item => item.normalizedValue)),
                      Math.max(...pointData.map(item => item.normalizedValue))
                    ], 
                      x: [0, timeFrameSelected == "1D" ? (pointData.length-1)/getMarketFraction(new Date(Date.now()-90000)) : pointData.length-1]}} chartPressState={state}>
                      {({ points }) => {
                      
                      // lowkey a little ragtag to make reference line, but had to decompose type formate of pointArray and makeshift it
                      const firstNormalizedPoint = points.normalizedValue[0]; // Extract the first normalized point
                      const repeatedPoints = points.normalizedValue.map((point) => ({
                        x: point.x, // Keep x as it is
                        y: firstNormalizedPoint.y, // Set y to the first normalized point's y value
                        xValue: 0,
                        yValue: 0
                      }));

                      const circlePositions = [];
                      for (let i = 0; i <= 1; i += 0.0125) {
                        circlePositions.push(parseFloat(i.toFixed(3)));
                      }

                      return (
                      <>
                        <Group>
                        {/*<SkiaText 
                          text={isActive ? "$" + (normalizedPriceValue.value.value + pointData[0].value).toFixed(2) : "$" + (livePrice[0]?.c ?? pointData[pointData.length-1].value).toFixed(2)}
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
                          
                        ></SkiaText>*/}
                        </Group>
                        <Group>
            
                          {/*(circlePositions.map((fraction, index) => {
                            const positionIndex = parseFloat((fraction * (points.normalizedValue.length - 1)).toPrecision(2));
                            const posX = points.normalizedValue[positionIndex]?.x || 0;
                            const posY = points.normalizedValue[positionIndex]?.y || -400;

                            return (
                              <Circle key={index} c={vec(posX, posY)} r={12} color={currentGradientAccent}>
                                <BlurMask blur={20} style="normal" />
                              </Circle>
                            );
                          })*/}

                          <Line points={repeatedPoints} color={theme.colors.tertiary} 
                          strokeWidth={1} animate={{ type: "timing", duration: 300 }} curveType='linear'></Line>
                          <Line points={points.normalizedValue} color={currentAccentColorValue} 
                          strokeWidth={2} animate={{ type: "timing", duration: 300 }} curveType='linear'></Line>
                          {isActive && <ToolTip x={state.x.position} y={state.y.normalizedValue.position} 
                          color={currentAccentColorValue}/>}
                          {timeFrameSelected == "1D" && <LiveIndicator x={points.normalizedValue[points.normalizedValue.length-1].x}
                          y={points.normalizedValue[points.normalizedValue.length-1].y!}
                          color={currentAccentColorValue}
                          />}
                        </Group>
                      </>
                      )
                    
                    }}
                  </CartesianChart>
                </View>

                </>
             }
            
          </View>
        </View>
      ) : <View>
            <View style={{ height: 445}}>
            <Skeleton animation={"wave"} width={100} height={30} style={{marginLeft: 20, marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 10}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}/>
            <Skeleton animation={"wave"} width={200} height={15} style={{marginLeft: 20, marginTop: 5, backgroundColor: theme.colors.primary, borderRadius: 10}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}/>
            <Skeleton animation={"wave"} width={width-40} height={370} style={{marginLeft: 20, marginTop: 10, backgroundColor: theme.colors.primary, borderRadius: 10}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}/>
            </View>
          </View>}
        
        
        <View style={styles.timeCardContainer}>
          <FlatList
            horizontal
            data={['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'MAX']}
            renderItem={({ item }) => <TimeButton timeFrame={item} color={currentAccentColorValue}/>}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            style={{paddingLeft: 20}}
            />
        </View>
    </View>
  );
  };

export default StockDetailGraph;
