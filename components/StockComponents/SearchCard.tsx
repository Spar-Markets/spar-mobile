import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useNavigation } from '@react-navigation/native';

const SearchCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createStockSearchStyles(theme, width);
    const navigation = useNavigation<any>()
    
    return (
        <TouchableOpacity onPress={() =>
            navigation.navigate('StockDetails', {
              matchID: props.matchID,
              buyingPower: props.buyingPower,
              ticker: props.ticker,
              tradable: props.tradable,
              inGame: props.inGame
            })
          } style={styles.searchCard}>
            <Text style={styles.searchTickerText}>{props.ticker}</Text>
            <Text style={styles.searchCompanyText}>{props.name}</Text>
            <View style={styles.searchCardGap}></View>
        </TouchableOpacity>
    )
}

export default SearchCard

const styles = StyleSheet.create({})