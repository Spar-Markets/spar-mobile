import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import createHomeStyles from '../../styles/createHomeStyles';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';

const DiscoverCard = ({title, message, image }:any) => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width)
    
    return (
        <TouchableOpacity style={styles.discoverCardContainer}>
            <View style={styles.discoverCardTextContainer}>
                <Text style={styles.discoverCardTitle}>{title}</Text>
                <Text style={styles.discoverCardMessage}>{message}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default DiscoverCard;