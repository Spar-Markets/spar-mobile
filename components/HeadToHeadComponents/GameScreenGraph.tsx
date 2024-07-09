import React, {useState, useEffect, useCallback, useRef} from 'react';
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
import {serverUrl, websocketUrl} from '../../constants/global';
import Icon from 'react-native-vector-icons/FontAwesome';
import {LineChart} from 'react-native-gifted-charts';
import PositionCard from '../HeadToHeadComponents/PositionCard';
import LinearGradient from 'react-native-linear-gradient';
import {act} from 'react-test-renderer';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHTHStyles from '../../styles/createHTHStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import HTHPageHeader from '../GlobalComponents/HTHPageHeader';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { SharedValue, runOnJS, useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';
import { Canvas, Rect, Text as SkiaText, useFont, TextAlign, Group, Circle, Paint, RadialGradient, vec, BlurMask } from '@shopify/react-native-skia';
import { ActivityIndicator } from 'react-native';

// const ws = useRef<WebSocket | null>(null);

/*interface RouteParams {
  matchID: string
  yourFormattedData: Array<any>
  oppFormattedData: Array<any>
}*/

const GameScreenGraph = (props:any) => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const { theme } = useTheme();
  const { width } = useDimensions();
  const styles = createHTHStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);

  //const params = route.params as RouteParams | undefined;
  const matchID = props?.matchID

  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [userNumber, setUserNumber] = useState<string>('');
  const [buyingPower, setBuyingPower] = useState(0);
  const [userPortfolioValue, setUserPortfolioValue] = useState(0);
  const [opponentPortfolioValue, setOpponentPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(true)
  const [yourFormattedData, setYourFormattedData] = useState<any[]>(props.yourFormattedData)
  const [oppFormattedData, setOppFormattedData] = useState<any[]>(props.oppFormattedData)

  const goBack = () => {
    navigation.goBack();
  };


  const [maxY, setMaxY] = useState<any>()
  const [minY, setMinY] = useState<any>()

  useEffect(() => {
    const yourDataMax = Math.max(...(yourFormattedData).map((item:any) => item.normalizedValue))
    const oppDataMax = Math.max(...(oppFormattedData).map((item:any) => item.normalizedValue))
    const youDataMin = Math.min(...(yourFormattedData).map((item:any) => item.normalizedValue))
    const oppDataMin = Math.min(...(oppFormattedData).map((item:any) => item.normalizedValue))

    if (oppDataMax > yourDataMax) {
      setMaxY(oppDataMax)
    } else {
      setMaxY(yourDataMax)
    }

    if (oppDataMin > youDataMin) {
      setMinY(youDataMin)
    } else {
      setMinY(oppDataMin)
    }

  }, []);

  // this is to get the live portfolio value
  const [livePortfolioValue, setLivePortfolioValue] = useState("")

  const { state, isActive } = useChartPressState({ x: 0, y: { normalizedValue: 0 } });

/**
 * Websocket stuff
 */

// const setupSocket = async () => {    
//   console.log("Opening socket with url:", websocketUrl);  
//   const socket = new WebSocket(websocketUrl);

//   ws.current = socket;
  
//   ws.current.onopen = () => {
//       console.log(`Connected to GameCard Asset Websocket, but not ready for messages...`);
//       if (ws.current! && yourAssets && opponentAssets) {
//         console.log(`Connection for GameCard Asset Websocket is open and ready for messages`);
//         // first send match ID
//         ws.current!.send(JSON.stringify({ matchID: match.matchID }))
//         yourAssets.forEach((asset:any) => {
//           ws.current!.send(JSON.stringify({ ticker: asset.ticker}));
//         })
//         opponentAssets.forEach((asset:any) => {
//           ws.current!.send(JSON.stringify({ ticker: asset.ticker}));
//         })
//       } else {
//         console.log('WebSocket is not open');
//       }
//   };

//     // WebSocket message handling
//     ws.current.onmessage = (event) => {
//       const buffer = new Uint8Array(event.data);

//       if (event.data == "Websocket connected successfully") {
//         return;
//       }

      

//       const message = uint8ArrayToString(buffer); 

//       try {
//         const JSONMessage = JSON.parse(message);
//         //console.log(JSONMessage)
//         if (JSONMessage.type == "updatedAssets") {
//           // Handle updated assets
//           console.log("INSIDE UPDATED ASSETS!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
//           const yourUpdatedAssets = JSONMessage[`${you}Assets`];
//           const oppUpdatedAssets = JSONMessage[`${opp}Assets`];

//           const yourNewAsset = getNewTickerObject(yourUpdatedAssets, yourAssets);
//           const oppNewAsset = getNewTickerObject(oppUpdatedAssets, opponentAssets);
          
//           // both cases
//           setYourAssets(yourUpdatedAssets);
//           setOpponentAssets(oppUpdatedAssets);

//           if (yourNewAsset) {
//             console.log("YOUR NEW ASSET JUST BOUGHT:", yourNewAsset)
//             if (ws.current) {
//               console.log("SUBSCRIBING TO YOUR NEW ASSET:", yourNewAsset.ticker)
//               ws.current.send(JSON.stringify({ ticker: yourNewAsset.ticker }));
//             }
//           }

//           if (oppNewAsset) {
//             console.log("OPP NEW ASSET JUST BOUGHT:", oppNewAsset)
//             if (ws.current) {
//               console.log("SUBSCRIBING TO OPP NEW ASSET:", oppNewAsset.ticker)
//               ws.current.send(JSON.stringify({ ticker: oppNewAsset.ticker }));
//             }
//           }

   
//           console.log("Updated your assets state:", yourUpdatedAssets);

//           console.log("Updated opp assets state:", oppUpdatedAssets);;

//         } else if (message != "" && gotInitialPrices && yourAssets && opponentAssets) {
//           //console.log(JSONMessage)
//           const { sym, c: currentPrice } = JSONMessage[0];
//           const isTickerInYourAssets = yourAssets.some(stock => stock.ticker === sym);
//           const isTickerInOppAssets = opponentAssets.some(stock => stock.ticker === sym);
//           //console.log(yourAssets)
//           if (isTickerInYourAssets) {
//             setYourTickerPrices(prevPrices => ({
//               ...prevPrices,
//               [sym]: currentPrice,
//             }));
//           }

//           if (isTickerInOppAssets) {
//             setOppTickerPrices(prevPrices => ({
//               ...prevPrices,
//               [sym]: currentPrice,
//             }));
//           }
//         }
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };


//   ws.current.onerror = (error) => {
//       console.log('WebSocket error:', error || JSON.stringify(error));
//       if (retries < MAX_RETRIES) {
//         console.log(`Retrying connection (${retries + 1}/${MAX_RETRIES})...`);
//         setRetries(retries + 1);
//         setTimeout(() => {
//             setupSocket();
//         }, RETRY_DELAY);
//       } else {
//         console.error('Maximum retry attempts reached. Unable to connect to WebSocket.');
//       }
//   };

//   ws.current.onclose = () => {
//       console.log(`Connection to GameCard Asset Websocket closed`);
//   };
// };
  
  function ToolTip({ x, y}: { x: SharedValue<number>, y: SharedValue<number>}) {
    return (
      <Rect x={x} y={0} width={2} height={400} color={theme.colors.secondaryText}/>
    );
  }

  const currentIndex = useDerivedValue(() => {
    const index = Math.round(state.x.position.value / width * yourFormattedData.length);
    return Math.min(Math.max(index, 0), yourFormattedData.length - 1);
  }, [state]);

  const yourPriceValue = useDerivedValue(() => {
    console.log(yourFormattedData[currentIndex.value].value)
    return yourFormattedData[currentIndex.value].value
  }, [state])  

  const oppPriceValue = useDerivedValue(() => {
    return oppFormattedData[currentIndex.value].value
  }, [state])  

    //gets percent difference based on array data
  const yourPercentDiff = useDerivedValue(() => {
    if (yourFormattedData.length > 0) {
        const percentDiff = ((yourFormattedData[currentIndex.value]?.value) - 
        yourFormattedData[0].value) / Math.abs(yourFormattedData[0].value);
        
        return (100*percentDiff).toFixed(2)
    }
  return "0.00"
  }, [yourFormattedData, state]);

  const oppPercentDiff = useDerivedValue(() => {
        if (oppFormattedData.length > 0) {
            const percentDiff = ((oppFormattedData[currentIndex.value]?.value) - 
            oppFormattedData[0].value) / Math.abs(oppFormattedData[0].value);
            
            return (100*percentDiff).toFixed(2)
        }
        return "0.00"
  }, [oppFormattedData, state]);

  const [yourInitialPercentDiff, setYourInitialPercentDiff] = useState("")
  const [oppInitialPercentDiff, setOppInitialPercentDiff] = useState("")
  
  const calculateInitialPercentDiffAndColor = useCallback(() => {
    if (yourFormattedData.length > 0) {
        const yourPercentDiff = ((yourFormattedData[yourFormattedData.length-1]?.value) - 
        yourFormattedData[0].value) / Math.abs(yourFormattedData[0].value) ?? 0;
        setYourInitialPercentDiff((100*yourPercentDiff).toFixed(2))
    }
    if (oppFormattedData.length > 0) {
        const oppPercentDiff = ((oppFormattedData[oppFormattedData.length-1]?.value) - 
        oppFormattedData[0].value) / Math.abs(oppFormattedData[0].value) ?? 0;
        setOppInitialPercentDiff((100*oppPercentDiff).toFixed(2))
    }
  }, [yourFormattedData, oppFormattedData])

  useEffect(() => {
    calculateInitialPercentDiffAndColor();
  }, [yourFormattedData, oppFormattedData]);

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

  

  

  return (

    <View style={{ height: 400}}>
        <View style={{flexDirection: 'row', marginTop: 20, height: 80}}>
          <View style={{marginLeft: 20}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <View style={[styles.hthGameIndicator, {backgroundColor: props.yourColor}]}></View>
              <Text style={styles.userText}>You</Text>
              <View style={styles.percentIndicator}>
                <Text style={[styles.percentText, {color: props.yourColor}]}>{isActive ? yourPercentDiff.value : yourInitialPercentDiff}%</Text>
              </View>
            </View>
            <Text style={styles.portText}>${ isActive ? yourPriceValue.value.toFixed(2) : (yourFormattedData[yourFormattedData.length - 1].value).toFixed(2)}</Text>
          </View>
          <View style={{flex: 1}}></View>
          <View style={{marginRight: 20}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <View style={styles.percentIndicator}>
                <Text style={[styles.percentText, {color: theme.colors.opposite}]}>{isActive ? oppPercentDiff.value : oppInitialPercentDiff}%</Text>
              </View>
              <Text style={styles.userText}>{props.oppName}</Text>
              <View style={[styles.hthGameIndicator, {backgroundColor: theme.colors.opposite}]}></View>
            </View>
            <Text style={[styles.portText, {textAlign: 'right'}]}>${isActive ? oppPriceValue.value.toFixed(2) : (oppFormattedData[oppFormattedData.length - 1].value).toFixed(2)}</Text>
          </View>
        </View>
        <View style={{
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        bottom: 10,
        }}>
        <CartesianChart data={Array.from({ length: 50 }, (_, i) => ({
                index: i,
                value: 0
            }))} xKey="index" yKeys={["value"]}
                domain={{y: [minY, maxY]}}>
            {({ points, chartBounds }) => (
            // Store the points for later use
            <>
            <Group>
                <Line points={points.value} color={theme.colors.opposite} 
                strokeWidth={1} animate={{ type: "timing", duration: 300 }}/>
            </Group>
            </>
        )}
        </CartesianChart>
        </View>
        <View style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            bottom: 10,
            }}>
        <CartesianChart data={yourFormattedData} xKey="index" yKeys={["normalizedValue"]} 
            domain={{y: [minY, maxY],
            
            }} chartPressState={state}> 
            {({ points }) => (
            // 👇 and we'll use the Line component to render a line path.
            <>
            
            <Group>
            {isActive && <ToolTip x={state.x.position} y={state.y.normalizedValue.position}/>}
            <Line points={points.normalizedValue} color={props.yourColor} 
            strokeWidth={2} animate={{ type: "timing", duration: 300 }}/>
            </Group>
            </>
            )}
        </CartesianChart>
        </View>
        <View style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            bottom: 10,
            }}>
        <CartesianChart data={oppFormattedData} xKey="index" yKeys={["normalizedValue"]}
            domain={{y: [minY, maxY],
            
            }} chartPressState={state}>
            {({ points }) => (
            // 👇 and we'll use the Line component to render a line path.
            <>
            <Group>
            <Line points={points.normalizedValue} color={theme.colors.text} 
            strokeWidth={2} animate={{ type: "timing", duration: 300 }}/>
            </Group>
            </>
            )}
        </CartesianChart>
        </View>
    </View>
 
  );
};


export default GameScreenGraph;
