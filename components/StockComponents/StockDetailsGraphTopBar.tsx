import { Image, StyleSheet, Text, View } from 'react-native'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import { runOnJS, useDerivedValue } from 'react-native-reanimated';
import { Skeleton } from '@rneui/base';
import { websocketUrl } from '../../constants/global';
import { updateStockPrice } from '../../GlobalDataManagment/stockSlice';

interface StockDetailsGraphTopBarProps {
    allPointData: any
    pointData: any;
    setPointData: (data: any) => void
    dataLoading: boolean;
    isActive: boolean;
    currentAccentColorValue: string
    setCurrentAccentColorValue: (color: string) => void
    oneDayClose: number
    timeFrameSelected: string
    state: any
    logoUrl: string
    ticker: string
    name: string
    currentIndex: any
}

const StockDetailsGraphTopBar: FC<StockDetailsGraphTopBarProps> = ({ allPointData, pointData, setPointData, currentIndex, dataLoading, isActive, timeFrameSelected, oneDayClose, currentAccentColorValue, setCurrentAccentColorValue, state, logoUrl, ticker, name }) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createStockSearchStyles(theme, width);

    const stockPrice = useSelector((state: RootState) => state.stock.stockPrice);

    const [onloadPercentDiff, setOnLoadPercentDiff] = useState('0.00');
    const [onLoadValueDiff, setOnLoadValueDiff] = useState('0.00');

    const calculatePercentAndValueDiffAndColor = useCallback(() => {
        let percentDiff;
        if (pointData.length > 0) {
            if (timeFrameSelected != '1D') {
                percentDiff =
                    ((pointData[pointData.length - 1]?.value || 0) - pointData[0].value) /
                    Math.abs(pointData[0].value);
            } else {
                percentDiff =
                    ((pointData[pointData.length - 1]?.value || 0) - oneDayClose) /
                    Math.abs(oneDayClose);
            }
            const percentDiffValue = (100 * percentDiff).toFixed(2);
            setOnLoadPercentDiff(percentDiffValue);
            let valueDiff;

            if (timeFrameSelected != '1D') {
                valueDiff =
                    (pointData[pointData.length - 1]?.value || 0) - pointData[0].value;
            } else {
                valueDiff = (pointData[pointData.length - 1]?.value || 0) - oneDayClose;
            }
            if (pointData) {
                if (valueDiff < 0) {
                    setOnLoadValueDiff('-$' + Math.abs(valueDiff).toFixed(2));
                    setCurrentAccentColorValue(theme.colors.stockDownAccent);
                } else {
                    setOnLoadValueDiff('$' + Math.abs(valueDiff).toFixed(2));
                    setCurrentAccentColorValue(theme.colors.stockUpAccent);
                }
            }
        } else {
            setOnLoadPercentDiff('0.00');
            setOnLoadValueDiff('0.00');
        }
    }, [pointData]);

    useEffect(() => {
        calculatePercentAndValueDiffAndColor();
    }, [pointData, stockPrice]);

    const animatedPercentDiff = useDerivedValue(() => {
        let percentDiff;
        if (pointData.length > 0) {
            if (timeFrameSelected != '1D') {
                percentDiff =
                    (pointData[currentIndex.value]?.value - pointData[0].value) /
                    Math.abs(pointData[0].value);
            } else {
                percentDiff =
                    (pointData[currentIndex.value]?.value - oneDayClose) /
                    Math.abs(oneDayClose);
            }

            return (100 * percentDiff).toFixed(2);
        }
        return '0.00';
    }, [pointData]);

    const animatedValueDiff = useDerivedValue(() => {
        let valueDiff;
        if (pointData.length > 0) {
            if (timeFrameSelected != '1D') {
                valueDiff = pointData[currentIndex.value]?.value - pointData[0].value;
            } else {
                valueDiff = pointData[currentIndex.value]?.value - oneDayClose;
            }
            if (valueDiff < 0) {
                return '-$' + Math.abs(valueDiff).toFixed(2); //formatting negative differences
            }
            return '$' + Math.abs(valueDiff).toFixed(2);
        }
        return '0.00';
    }, [pointData]);

    const currentDate = useDerivedValue(() => {
        if (pointData.length > 0) {
            //console.log(currentIndex.value, pointData[currentIndex.value]?.date)
            return ' • ' + pointData[currentIndex.value]?.date;
        }
        return '';
    }, [pointData, state]);

    const lastDate = useDerivedValue(() => {
        if (pointData.length > 0) {
            return ' • ' + pointData[pointData.length - 1]?.date;
        }
        return '';
    }, [pointData, state]);

    const ws = useRef<WebSocket | null>(null);

    const [retries, setRetries] = useState(0);

    const dispatch = useDispatch()

    const MAX_RETRIES = 5; // Maximum number of retry attempts
    const RETRY_DELAY = 2000; // Delay between retries in milliseconds

    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

    function uint8ArrayToString(array: any) {
        return array.reduce(
            (data: any, byte: any) => data + String.fromCharCode(byte),
            '',
        );
    }

    const sendHeartbeat = () => {
        if (ws.current) {
            // console.log('SENDING WS HEARTBEAT ON STOCK DETAILS');
            // console.log('FROM STOCK DETAILS', ws.current);
            const heartbeat = { type: 'heartbeat' };
            ws.current.send(JSON.stringify(heartbeat));
        }
    };

    useEffect(() => {
        heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // 30 seconds interval

        // Clear the interval when the component unmounts
        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
        };
    }, []);

    const [livePrice, setLivePrice] = useState<any>(null)

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
            console.log(`Connected to ${ticker}, but not ready for messages...`);
            if (ws.current!) {
                console.log(`Connection for ${ticker} is open and ready for messages`);
                ws.current!.send(JSON.stringify({ ticker: ticker, status: 'add' }));
            } else {
                console.log('WebSocket is not open:', ws.current!.readyState);
            }
        };

        ws.current.onmessage = event => {
            const buffer = new Uint8Array(event.data);
            const message = uint8ArrayToString(buffer);

            //console.log(`Websocket Received message: ${message}`);
            if (message != '') {
                try {
                    const jsonMessage = JSON.parse(message);
                    //runOnJS(setPassingLivePrice)(jsonMessage);
                    //console.log(getMarketFraction(new Date(Date.now() - 90000)))
                    setLivePrice(jsonMessage)
                    if (!isActive) {
                        runOnJS(dispatch)(updateStockPrice(jsonMessage[0]?.c)); //close live price for aggregate
                    }
                } catch (error) {
                    console.error('stock graph live data error', error);
                }
            }
        };

        ws.current.onerror = error => {
            console.log('WebSocket error:', error || JSON.stringify(error));
            if (retries < MAX_RETRIES) {
                console.log(`Retrying connection (${retries + 1}/${MAX_RETRIES})...`);
                setRetries(retries + 1);
                setTimeout(() => {
                    setupSocket(ticker);
                }, RETRY_DELAY);
            } else {
                console.error(
                    'Maximum retry attempts reached. Unable to connect to WebSocket.',
                );
            }
        };

        ws.current.onclose = () => {
            console.log(`Connection to ${ticker} closed`);
        };
    };

    useEffect(() => {
        //console.log("SETTING UP SOCKET WITH:", props.ticker);
        if (allPointData) {
            setupSocket(ticker);

            return () => {
                if (ws.current) {
                    ws.current.send(
                        JSON.stringify({ ticker: ticker, status: 'delete' }),
                    );
                    ws.current.close(
                        1000,
                        'Closing websocket connection due to page being closed',
                    );
                    //console.log('Closed websocket connection due to page closing');
                    ws.current = null; // Ensure the reference is cleared
                }
            };
        }
    }, [allPointData]);

    const [trackingTimeStamp, setTrackingTimeStamp] = useState<any>(null);
    const [lastInterval, setLastInterval] = useState<any>(null);
    const [isFirstAnimation, setIsFirstAnimation] = useState(true);

    useEffect(() => {
        if (timeFrameSelected == '1D') {
            if (livePrice && pointData.length > 0) {
                const livePriceTime = new Date(livePrice[0]?.e);
                const livePriceMinutes = livePriceTime.getMinutes();
                const livePriceSeconds = livePriceTime.getSeconds();

                const formattedLivePriceTime = livePriceTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                // Function to check if the timestamp is close to a 5-minute interval
                const isCloseToFiveMinuteInterval = (minutes: any, seconds: any) => {
                    const remainder = minutes % 5;
                    return (
                        remainder === 0 && seconds < 30 //|| // Close to the start of a 5-minute interval
                        //(remainder === 4 && seconds > 30)    // Close to the end of a 5-minute interval
                    );
                };

                const currentInterval = Math.floor(livePriceMinutes / 5);

                if (
                    isCloseToFiveMinuteInterval(livePriceMinutes, livePriceSeconds) &&
                    currentInterval !== lastInterval
                ) {
                    //console.log("ADDING DATA POINT");
                    runOnJS(setPointData)((prevPointData: any) => {
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
                    //console.log("animated point");
                    if (isFirstAnimation == true) {
                        runOnJS(setPointData)((prevPointData: any) => {
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
                        setIsFirstAnimation(false);
                    } else {
                        runOnJS(setPointData)((prevPointData: any) => {
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
        <View
            style={{ marginHorizontal: 20, marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>

                {logoUrl && logoUrl != 'logoUrlError' ? (
                    <>
                        <Image
                            source={{ uri: logoUrl }}
                            style={{ aspectRatio: 1, borderRadius: 50, height: 50, width: 50 }}
                        />
                    </>
                ) : logoUrl != 'logoUrlError' ? <Skeleton animation={"pulse"} height={50} width={50} style={{ backgroundColor: theme.colors.primary, borderRadius: 50 }} skeletonStyle={{ backgroundColor: theme.colors.secondary }}></Skeleton> : <View />}



                <View style={{ marginVertical: 1 }}>
                    <Text style={styles.stockDetailsTickerText}>
                        {ticker}
                    </Text>
                    <Text
                        style={[styles.stockDetailsNameText, { width: width / 3 }]}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {name}
                    </Text>
                </View>
            </View>
            <View style={{ flex: 1 }} />
            {pointData && !dataLoading ?
                <>
                    {isActive ? (
                        <View>
                            <Text style={styles.stockPriceText}>
                                $
                                {pointData[currentIndex.value].value.toFixed(2).split('.')[0]}
                                <Text style={{ fontSize: 15 }}>
                                    .
                                    {
                                        pointData[currentIndex.value].value
                                            .toFixed(2)
                                            .split('.')[1]
                                    }
                                </Text>
                            </Text>
                            <Text
                                style={[
                                    styles.stockPercentText,
                                    { color: currentAccentColorValue },
                                ]}>
                                {animatedValueDiff.value +
                                    ' (' +
                                    animatedPercentDiff.value +
                                    '%)' +
                                    currentDate.value}
                            </Text>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.stockPriceText}>
                                $
                                {
                                    stockPrice != null && stockPrice //pointData[pointData.length - 1].value
                                        .toFixed(2)
                                        .split('.')[0]
                                }
                                <Text style={{ fontSize: 15 }}>
                                    .
                                    {
                                        stockPrice != null && stockPrice //pointData[pointData.length - 1].value
                                            .toFixed(2)
                                            .split('.')[1]
                                    }
                                </Text>
                            </Text>
                            <Text
                                style={[
                                    styles.stockPercentText,
                                    { color: currentAccentColorValue },
                                ]}>
                                {onLoadValueDiff +
                                    ' (' +
                                    onloadPercentDiff +
                                    '%)' +
                                    lastDate.value}
                            </Text>
                        </View>
                    )}
                </> :
                <View style={{ alignItems: 'flex-end' }}>
                    <Skeleton animation={"pulse"} height={25} width={70} style={{ backgroundColor: theme.colors.primary, borderRadius: 50, }} skeletonStyle={{ backgroundColor: theme.colors.secondary }}></Skeleton>
                    <Skeleton animation={"pulse"} height={17} width={140} style={{ backgroundColor: theme.colors.primary, borderRadius: 50, marginTop: 5 }} skeletonStyle={{ backgroundColor: theme.colors.secondary }}></Skeleton>
                </View>}
        </View>
    )
}

export default StockDetailsGraphTopBar
