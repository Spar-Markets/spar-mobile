import React, { useEffect, useRef } from 'react';
import { Animated, View, Easing, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import { Text } from 'react-native';

const CustomActivityIndicator = ({ size = 50, color = '#000', text="", hasCancel=false }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const { theme } = useTheme();
  const { width, height } = useDimensions();

  useEffect(() => {
    const animate = () => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => animate());
    };

    animate();
  }, [animatedValue]);

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary, padding: 30, borderRadius: 15}}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg height={size} width={size} viewBox="0 0 100 100">
          <Circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="75"
            fill="none"
          />
        </Svg>
      </Animated.View>
      {text != "" && <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Black', marginTop: 10}}>{text}</Text>}
    </View>
  );
};

export default CustomActivityIndicator;