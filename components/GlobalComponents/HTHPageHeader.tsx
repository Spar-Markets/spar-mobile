import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Timer from '../HomeComponents/Timer';
import FeatherIcons from 'react-native-vector-icons/Feather'
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import { updateStockPrice } from '../../GlobalDataManagment/stockSlice';

const HTHPageHeader = (props: any) => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createGlobalStyles(theme, width)

    const navigation = useNavigation<any>();

    FeatherIcons.loadFont()

    const stockPrice = useSelector((state: RootState) => state.stock);

    const handleBack = () => {
        navigation.goBack()
        updateStockPrice(null)
    }

    return (
        <View style={styles.headerContainer}>
            {props.canGoBack != false &&
                <TouchableOpacity onPress={handleBack} style={styles.headerBackBtn}>
                    <FeatherIcons name="arrow-left" style={{ color: theme.colors.opposite }} size={20} />
                    <Text style={styles.headerText}>{props.text}</Text>
                </TouchableOpacity>}
            <View style={{ flex: 1 }}></View>
            <View style={{ marginRight: 20, backgroundColor: theme.colors.gameCardGrayAccent, borderColor: theme.colors.gameCardGrayBorder, borderWidth: 1, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Timer endDate={props.endAt} timeFrame={props.timeFrame} yourColor={props.yourColor} />
            </View>

        </View>
    )
}

export default HTHPageHeader;