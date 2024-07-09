import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useNavigation } from '@react-navigation/native';
import { CartesianChart, Line } from 'victory-native';
import getPrices from '../../utility/getPrices';
import axios from 'axios'
import {serverUrl, websocketUrl} from '../../constants/global';
import getMarketFraction from '../../utility/getMarketFraction'
import { Skeleton } from '@rneui/base';
import Icon from 'react-native-vector-icons/FontAwesome';



const StockCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createStockSearchStyles(theme, width);
    const navigation = useNavigation<any>();
    const [pointData, setPointData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true)

    const [name, setName] = useState("")

    const [currentIcon, setCurrentIcon] = useState("")


    useEffect(() => {
        const getPricesForSelectedTime = async () => {
            const allPoints = await getPrices(props.ticker, true);
            if (allPoints) {
                //console.log("ALL POINT DATA:", allPoints["3M"])
                setPointData(allPoints["1D"])
                }
            try {
                const tickerResponse = await axios.post(serverUrl + '/getTickerDetails', {
                  ticker: props.ticker,
                });
                if (tickerResponse) {
                  setName(tickerResponse.data.detailsResponse.results.name);
                }
              } catch {
                console.error('Error getting details in StockDetails.tsx');
              } finally {
                //setIsLoading(false)
              }
        }

    getPricesForSelectedTime()  
    
    }, [props.ticker]);


    //ALL SOCKET STUFF ---------------------------------------
    const [livePrice, setPassingLivePrice] = useState<any>(null)

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
    
    const socket = new WebSocket(websocketUrl);

    ws.current = socket;
    
    ws.current.onopen = () => {
        //console.log(`Connected to ${ticker}, but not ready for messages...`);
        if (ws.current!.readyState === WebSocket.OPEN) {
        //console.log(`Connection for ${ticker} is open and ready for messages`);
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
    //--------------------------------------------------------
    
    const { onDataFetched } = props;

    useEffect(() => {
        if (pointData.length > 0 && name) {
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }
    }, [pointData, name]);

    const [percentDiff, setPercentDiff] = useState("")
    const [valueDiff, setValueDiff] = useState("")
    const [currentAccentColor, setCurrentAccentColor] = useState("")

    const calculatePercentAndValueDiffAndColor = useCallback(() => {
        if (pointData.length > 0) {
          const percentDiff =
            ((pointData[pointData.length - 1]?.value || 0) - pointData[0].value) /
            Math.abs(pointData[0].value);
          const percentDiffValue = (100 * percentDiff).toFixed(2);
          setPercentDiff(percentDiffValue);
      
          const valueDiff =
            (pointData[pointData.length - 1]?.value || 0) - pointData[0].value;
      
          if (valueDiff < 0) {
            setValueDiff("$" + Math.abs(valueDiff).toFixed(2));
            setCurrentAccentColor(theme.colors.stockDownAccent)
            setCurrentIcon("arrow-circle-down")
          } else {
            setValueDiff("$" + Math.abs(valueDiff).toFixed(2));
            setCurrentAccentColor(theme.colors.stockUpAccent)
            setCurrentIcon("arrow-circle-up")
          }
        } else {
          setPercentDiff("0.00");
          setValueDiff("0.00");
        }
    }, [pointData]);

    const [lastInterval, setLastInterval] = useState<any>(null);
    const [isFirstAnimation, setIsFirstAnimation] = useState(true)
    
    const [marketFraction, setMarketFraction] = useState(1);
    
    useEffect(() => {
        setMarketFraction(getMarketFraction(new Date(Date.now() - 90000)));
    }, [pointData]);

    useEffect(() => {
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
            //console.log("ADDING DATA POINT");
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
              return newPointData;
            });
            setLastInterval(currentInterval); // Update the last interval
          } else {
            //console.log("animated point");
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
    }, [livePrice]);
    
    useEffect(() => {
        calculatePercentAndValueDiffAndColor();
    }, [pointData]);

    const hexToRGBA = (hex:any, alpha = 1) => {
      let r = 0, g = 0, b = 0;
    
      // Remove the hash at the start if it's there
      hex = hex.replace(/^#/, '');
    
      // Parse r, g, b values
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex[0] + hex[1], 16);
        g = parseInt(hex[2] + hex[3], 16);
        b = parseInt(hex[4] + hex[5], 16);
      }
    
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    if (isLoading) {
        return (
        <View>
        <View style={{marginVertical: 10, height: 40, width: width-70}}>
          <View style={{flexDirection: 'row'}}>
            <View>
              <Skeleton animation={"pulse"} height={20} style={{backgroundColor: theme.colors.primary, borderRadius: 10, marginTop: 5, width: 45}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
              <Skeleton animation={"pulse"} height={10} width={90} style={{backgroundColor: theme.colors.primary, borderRadius: 10, marginTop: 5}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
            </View>
            <View style={{flex: 1, marginHorizontal: 30}}>
              <Skeleton animation={"pulse"} height={35} style={{backgroundColor: theme.colors.primary, borderRadius: 10, marginTop: 5}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Skeleton animation={"pulse"} height={20} width={45} style={{backgroundColor: theme.colors.primary, borderRadius: 10, marginTop: 5}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
              <Skeleton animation={"pulse"} height={10} width={90} style={{backgroundColor: theme.colors.primary, borderRadius: 10, marginTop: 5}} skeletonStyle={{backgroundColor: theme.colors.tertiary}}></Skeleton>
            </View>
          </View>
        </View>
        </View>)
    }

    return (
        <TouchableOpacity onPress={() =>
            navigation.navigate('StockDetails', {

              ticker: props.ticker,
          
            })}>

                <View style={{flexDirection: 'row', marginVertical: 10, gap: 20, justifyContent: 'center', height: 40}}>
                    <View style={{justifyContent: 'center'}}>
                        <Text style={styles.stockCardTicker}>{props.ticker}</Text>
                        <Text style={[styles.stockCardName, {width: width/4}]} numberOfLines={1} ellipsizeMode='tail'>{name}</Text>
                    </View>
                    {pointData && 
                    <CartesianChart data={pointData} xKey="index" yKeys={["value"]} 
                    domain={{x: [0, (pointData.length-1)/getMarketFraction(new Date(Date.now()-90000))]}}
                    >
                    {({ points }) => (
                        <>
                        <Line points={points.value} color={currentAccentColor} 
                        strokeWidth={1} animate={{ type: "timing", duration: 300 }}/>
                        </>
                    )}
                    </CartesianChart>}
                    <View style={{justifyContent: 'center'}}>
                        <Text style={styles.stockCardValue}>${(pointData[pointData.length-1].value).toFixed(2)}</Text>
                        <View style={{backgroundColor: hexToRGBA(currentAccentColor, 0.3), paddingHorizontal: 10, paddingVertical: 3, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flexDirection: 'row', gap: 5}}>
                          <Icon name={currentIcon} color={currentAccentColor}/>
                          <Text style={[styles.stockCardDiff, {color: currentAccentColor}]}>{valueDiff} ({percentDiff}%)</Text>
                        </View>
                    </View>
                </View>
        </TouchableOpacity>
    )
}

export default StockCard

