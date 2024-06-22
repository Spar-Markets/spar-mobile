import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Timer from '../HomeComponents/Timer';

const HTHPageHeader = (props:any) => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createGlobalStyles(theme, width)

    const navigation = useNavigation<any>();

    return (
    <View style={styles.headerContainer}>
        {props.canGoBack != false && <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Icon name="chevron-left" style={{marginRight: 20, color: theme.colors.opposite}} size={24}/>
        </TouchableOpacity>}
        <Text style={styles.headerText}>{props.text}</Text>
        <View style={styles.headerRightBtn}>
            <Timer endDate={props.endAt} timeFrame={props.timeFrame} />
        </View>
        
    </View>
    )
}

export default HTHPageHeader;