import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import createHomeStyles from '../../styles/createHomeStyles';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';

const ToggleButton = ({onToggle, animation}:any) => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width)
    const [active, setActive] = useState('head-to-head');
    //const animation = useRef(new Animated.Value(0)).current;

    const toggleWidth = (Dimensions.get('window').width) //account for margin

    useEffect(() => {
        Animated.timing(animation, {
          toValue: active === 'head-to-head' ? 0 : toggleWidth/2,
          duration: 300,
          useNativeDriver: false,
        }).start();
    }, [active]);

    const handleToggle = (value: string) => {
        setActive(value)
        onToggle(value)
    }

    const headToHeadColor = animation.interpolate({
        inputRange: [0, toggleWidth / 2],
        outputRange: [theme.colors.text, theme.colors.tertiary],
    });
    
    const tournamentsColor = animation.interpolate({
        inputRange: [0, toggleWidth / 2],
        outputRange: [theme.colors.tertiary, theme.colors.text],
    });

    return (
        <View style={styles.toggleContainer}>
            <View style={[styles.animatedBackground, {backgroundColor: theme.colors.tertiary, height: 2, width: '100%', marginTop: 39}]}/>
            <Animated.View style={[styles.animatedBackground, {left: animation}]}/>
            <TouchableOpacity style={styles.toggleButton} onPress={() => handleToggle('head-to-head')}>
                <Animated.Text style={[styles.toggleText, {color: headToHeadColor}]}>Head-to-Head</Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleButton} onPress={() => handleToggle('tournaments')}>
                <Animated.Text style={[styles.toggleText, {color: tournamentsColor}]}>Tournaments</Animated.Text>
            </TouchableOpacity>
        </View>
    )
}

export default ToggleButton;