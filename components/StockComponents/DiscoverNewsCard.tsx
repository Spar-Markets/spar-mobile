import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import axios from 'axios'
import { polygonKey } from '../../constants/global';

const DiscoverNewsCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createStockSearchStyles(theme, width);
    const navigation = useNavigation<any>();

    const handlePress = async (url: string) => {
        // Checking if the link is supported for links with custom schemes (e.g., "https")
        const supported = await Linking.canOpenURL(url);
    
        if (supported) {
          // Opening the link
          await Linking.openURL(url);
        } else {
          console.error("Don't know how to open URI: " + url);
        }
        console.log(url)
        //navigation.navigate('WebViewScreen', {url: url});
    };

    const [percentDiffs, setPercentDiffs] = useState<{ [key: string]: string }>({});
    const [percentDiffColors, setPercentDiffColors] = useState<{ [key: string]: string }>({});
    const relatedTickers = props.relatedTickers

    useEffect(() => {
        const fetchTickerData = async () => {
          const newPercentDiffs: { [key: string]: string } = {};
          const newPercentDiffColors: { [key: string]: string } = {};
          for (const item of relatedTickers) {
            try {
              const priceResponse = await axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${item}?apiKey=${polygonKey}`);
              if (priceResponse) {
                const currentPrice = priceResponse.data.ticker.day.c;
                const prevPrice = priceResponse.data.ticker.prevDay.c;
                if (currentPrice && prevPrice) {
                    const percentDiff = (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2);
                    newPercentDiffs[item] = percentDiff;
                    if (parseFloat(percentDiff) > 0) {
                        newPercentDiffColors[item] = theme.colors.stockUpAccent
                    } else if (parseFloat(percentDiff) < 0) {
                        newPercentDiffColors[item] = theme.colors.stockDownAccent
                    } else {
                        newPercentDiffColors[item] = theme.colors.text
                    }
                } else {
                    newPercentDiffColors[item] = theme.colors.text
                }
              } else {
                newPercentDiffColors[item] = theme.colors.text
              }
            } catch (err) {
              console.log("NEWS CARD ERR:", err);
            }
          }
          setPercentDiffs(newPercentDiffs);
          setPercentDiffColors(newPercentDiffColors)
        };
    
        if (relatedTickers) {
          fetchTickerData();
        }
      }, [relatedTickers]);
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


    return (
        <TouchableOpacity
            onPress={() => handlePress(props.article_url)} style={styles.discoverNewsCardContainer}>
            <View style={{marginVertical: 20}}>
                <View style={{flexDirection: 'row', width: width-40 ,marginHorizontal: 20, gap: 10, alignItems: 'center'}}>
                    <View style={{marginTop: 5, flex: 1}}>
                        <Text style={styles.bottomText}>{props.publisherName} • {props.timePublished}</Text>
                        <Text style={styles.discoverNewsTitle}>{props.title}</Text> 
                    </View>
                    {props.image_url && <Image
                    style={{height: 60, width: 60, borderRadius: 10}}
                    source={{uri: props.image_url}}
                    />}  
                </View> 
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingLeft: 20, paddingVertical: 15, width: width}}>
                    {relatedTickers && relatedTickers.map((item:any, index:number) => {

                        return (
                        <TouchableOpacity onPress={() =>
                            navigation.navigate('StockDetails', {
                              ticker: item,
                            })
                          } key={index} style={[percentDiffColors[item] !== undefined && {backgroundColor: hexToRGBA(percentDiffColors[item], 0.3)}, {paddingHorizontal: 30, paddingVertical: 5, borderRadius: 5, marginRight: 10}]}>
                            <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>
                                {item} <Text style={{ color: percentDiffColors[item] }}>{percentDiffs[item] !== undefined ? `${percentDiffs[item]}%` : ''}</Text>
                            </Text>
                        </TouchableOpacity>)
                        })}
                </ScrollView>       
            </View>
        </TouchableOpacity>
    )
}

export default DiscoverNewsCard

