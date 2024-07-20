import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createGlobalStyles from '../../styles/createGlobalStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Timer from '../HomeComponents/Timer';
import FeatherIcons from 'react-native-vector-icons/Feather'

const HTHPageHeader = (props:any) => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createGlobalStyles(theme, width)

    const navigation = useNavigation<any>();

    FeatherIcons.loadFont()

    return (
    <View style={styles.headerContainer}>
        {props.canGoBack != false && <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
        <FeatherIcons name="arrow-left" style={{color: theme.colors.opposite}} size={20}/>
        <Text style={styles.headerText}>{props.text}</Text>
        </TouchableOpacity>}
        <View style={styles.headerRightBtn}>
            <Timer endDate={props.endAt} timeFrame={props.timeFrame} />
        </View>
        
    </View>
    )
}

export default HTHPageHeader;