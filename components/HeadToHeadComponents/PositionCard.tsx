import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useNavigation } from '@react-navigation/native';
import { Area, CartesianChart, Line } from 'victory-native';
import getPrices from '../../utility/getPrices';
import axios from 'axios'
import { polygonKey, serverUrl } from '../../constants/global';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import fuzzysort from 'fuzzysort';
import { Group, RoundedRect } from '@shopify/react-native-skia';
import { Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { Skeleton } from '@rneui/base';


const PositionCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createStockSearchStyles(theme, width);
    const navigation = useNavigation<any>();
    const [pointData, setPointData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true)

    const [name, setName] = useState("")


    const matches = useSelector((state: RootState) => state.matches);
    const { yourTickerPrices } = matches[props.matchID]

    const [tickerData, setTickerData] = useState<any>(null)

    useEffect(() => {
      const getStockCardData = async () => {
        try {
          const response = await axios.post(serverUrl + "/getStockCardData", {ticker: props.ticker})
          if (response.status === 200) {
            console.log("branding", response.data.branding.icon_url + '?apikey=' + polygonKey)
            setTickerData(response.data)
          }
        } catch (error) {
          console.error("stock card", error)
        }

      }
      getStockCardData()
    }, [])





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
                setIsLoading(false)
              }
        }
        getPricesForSelectedTime()
    }, [props.ticker]);

    useEffect(() => {
        if (pointData.length > 0 && tickerData) {
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }
    }, [pointData, tickerData]);

    const [percentDiff, setPercentDiff] = useState("")
    const [valueDiff, setValueDiff] = useState("")
    const [currentAccentColor, setCurrentAccentColor] = useState("")


    //FIX CALCULATE PERCENT DIFFERENCE MAYBE MAKE PERCENRT DIFF A UTILITY SINCE ELSEWHERE
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
          } else {
            setValueDiff("$" + Math.abs(valueDiff).toFixed(2));
            setCurrentAccentColor(theme.colors.stockUpAccent)
          }
        } else {
          setPercentDiff("0.00");
          setValueDiff("0.00");
        }
      }, [pointData]);
    
      useEffect(() => {
        calculatePercentAndValueDiffAndColor();
      }, [pointData]);

      const hexToRGBA = (hex:any, alpha = 1) => {
        let r = 0, g = 0, b = 0;
      
        // Check if hex is in shorthand format (e.g., #fff)
        if (hex.length === 4) {
          r = parseInt(hex[1] + hex[1], 16);
          g = parseInt(hex[2] + hex[2], 16);
          b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
          r = parseInt(hex[1] + hex[2], 16);
          g = parseInt(hex[3] + hex[4], 16);
          b = parseInt(hex[5] + hex[6], 16);
        }
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    if (isLoading) {
      return <Skeleton animation={"pulse"} height={132} width={width-40} style={{ backgroundColor: '#050505', borderRadius: 5, marginBottom: 10}} skeletonStyle={{backgroundColor: theme.colors.primary}}></Skeleton>
    }

    return (
        <TouchableOpacity style={styles.positionCardContainer} onPress={() =>
            navigation.navigate('StockDetails', {

              ticker: props.ticker,
              matchID: props.matchID,
              buyingPower: props.buyingPower,
              inGame: true,
              owns: true,
              assets: props.assets,
              qty: props.qty,
              endAt: props.endAt
          
            })}>
              
                <View style={{flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 20}}>
                    <View style={{flex: 1, flexDirection: 'row', gap: 10}}>
                      <View>
                        {tickerData != null && <Image source={{uri: tickerData.branding.icon_url + '?apiKey=' + polygonKey}} height={40} width={40} style={{borderRadius: 500}}/>}
                      </View>
                      <View style={{justifyContent: 'center'}}>
                          <Text style={styles.stockCardTicker}>{props.ticker}</Text>
                          {tickerData != null && <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.stockCardName, {maxWidth: 150}]}>{tickerData!.name}</Text>}
                      </View>
                    </View>
                    <View style={{justifyContent: 'center'}}>
                        {yourTickerPrices[props.ticker] && <Text style={styles.stockCardValue}>${(yourTickerPrices[props.ticker]).toFixed(2)}</Text>}
                        <Text style={[styles.stockCardDiff, {color: currentAccentColor}]}>{valueDiff} ({percentDiff}%)</Text>
                        <Text style={[styles.stockCardDiff, {color: theme.colors.text}]}>{props.qty} Shares</Text>
                    </View>
                </View>
                {/*<View style={{backgroundColor: theme.colors.tertiary, width: '50%', borderBottomLeftRadius: 9, borderTopRightRadius: 9, alignItems: 'center', paddingVertical: 4, marginTop: 2}}>
                  <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>QTY: {props.qty}</Text>
                </View>*/}
                <View style={{height: 50}}>
                {pointData && 
                <CartesianChart data={pointData} xKey="index" yKeys={["value"]} 
                >
                {({ points, chartBounds }) => (
                <>
                  <Line points={points.value} color={currentAccentColor} strokeWidth={1.5} />
                  {/*<Area points={points.value} y0={chartBounds.bottom} color={hexToRGBA(currentAccentColor, 0.2)} />*/}
                </>
                )}
                </CartesianChart>}   
                <View style={{height: 10, width: '100%'}}></View>
                </View>
                
        </TouchableOpacity>
    )
}

export default PositionCard

