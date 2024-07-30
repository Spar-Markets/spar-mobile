import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
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
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('StockDetails', {
            matchID: props.matchID,
            buyingPower: props.buyingPower,
            ticker: props.ticker,
            assets: props.assets,
            inGame: props.inGame,
            endAt: props.endAt,
            name: props.name
          })
        }
        style={styles.searchCard}
      >
        {props.username ? (
          <>
            <Text style={styles.searchCompanyText}>{props.username}</Text>
            <Text style={styles.searchTickerText}>User Profile</Text>
          </>
        ) : (
          <>
            <Text style={styles.searchTickerText}>{props.ticker}</Text>
            <Text style={styles.searchCompanyText}>{props.name}</Text>

            <View style={styles.searchCardGap}></View>
          </>
        )}
      </TouchableOpacity>
    );
    
}

export default SearchCard

const styles = StyleSheet.create({})