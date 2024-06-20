import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useNavigation } from '@react-navigation/native';
import { CartesianChart, Line } from 'victory-native';
import getPrices from '../../utility/getPrices';

//TEST DATA NOT REAL
const generateData = (length:number) => {
    const data = [];
    let baseValue = 118;
  
    for (let i = 0; i < length; i++) {
      // Increment the base value slightly for an upward trend
      baseValue += Math.random() * 0.2;
      
      // Add a random value to introduce variability within the range
      const value = Math.min(Math.max(baseValue + (Math.random() - 0.5), 118), 126);
      
      data.push({
        index: i,
        value: parseFloat(value.toFixed(2)) // Fix to two decimal places
      });
    }
  
    return data;
};

const DATA = generateData(50)


const StockCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createStockSearchStyles(theme, width);
    const navigation = useNavigation<any>();
    const [pointData, setPointData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const getPricesForSelectedTime = async () => {
            const allPoints = await getPrices(props.ticker, true);
            if (allPoints) {
            //console.log("ALL POINT DATA:", allPoints["3M"])
            setPointData(allPoints["1D"])
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
            <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', marginHorizontal: 10, marginTop: 10}}>
                    <View>
                        <Text style={styles.stockCardTicker}>{props.ticker}</Text>
                    </View>
                    <View style={{flex: 1}}></View>
                    <View>
                        <Text style={styles.stockCardValue}>${(pointData[pointData.length-1].value).toFixed(2)}</Text>
                        <Text style={[styles.stockCardDiff, {color: currentAccentColor}]}>{valueDiff} ({percentDiff}%)</Text>
                    </View>
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
            </View>
        </TouchableOpacity>
    )
}

export default StockCard

