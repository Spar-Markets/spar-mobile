import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useNavigation } from '@react-navigation/native';
import { CartesianChart, Line } from 'victory-native';
import getPrices from '../../utility/getPrices';
import axios from 'axios'
import { serverUrl } from '../../constants/global';


const PositionCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createStockSearchStyles(theme, width);
    const navigation = useNavigation<any>();
    const [pointData, setPointData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true)

    const [name, setName] = useState("")

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
        if (pointData.length > 0) {
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }
    }, [pointData]);

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
            setValueDiff("-$" + Math.abs(valueDiff).toFixed(2));
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

    if (isLoading) {
        return <View></View>
    }

    return (
        <TouchableOpacity style={styles.stockCardContainer} onPress={() =>
            navigation.navigate('StockDetails', {

              ticker: props.ticker,
          
            })}>

                <View style={{flexDirection: 'row', marginVertical: 10, gap: 40, justifyContent: 'center'}}>
                    <View style={{justifyContent: 'center', width: (width-40)/4}}>
                        <Text style={styles.stockCardTicker}>{props.ticker}</Text>
                        <Text style={styles.stockCardName}>35 Shares</Text>
                    </View>
                    {pointData && 
                    <CartesianChart data={pointData} xKey="index" yKeys={["value"]} 
                    >
                    {({ points }) => (
                        <>
                        <Line points={points.value} color={currentAccentColor} 
                        strokeWidth={2} animate={{ type: "timing", duration: 300 }}/>
                        </>
                    )}
                    </CartesianChart>}
                    <View style={{justifyContent: 'center'}}>
                        <Text style={styles.stockCardValue}>${(pointData[pointData.length-1].value).toFixed(2)}</Text>
                        <Text style={[styles.stockCardDiff, {color: currentAccentColor}]}>{valueDiff} ({percentDiff}%)</Text>
                    </View>
                </View>
            
        </TouchableOpacity>
    )
}

export default PositionCard

