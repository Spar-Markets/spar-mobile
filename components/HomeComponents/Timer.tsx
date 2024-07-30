import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, View, Animated } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';

const Timer = (props:any) => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width);

  const timeRemainingInMS = useRef(new Date(props.endDate).getTime() - new Date().getTime());

  const calculateTimeRemaining = (endDate:any) => {
    const endDateTime = new Date(endDate).getTime();
    const currentTime = new Date().getTime();

    timeRemainingInMS.current = endDateTime - currentTime;

    const timeRemaining = Math.max(0, endDateTime - currentTime); // Ensure time remaining doesn't go negative
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    const milliseconds = Math.floor((timeRemaining % 1000) / 10); // Showing two digits for milliseconds

    const formattedMilliseconds = milliseconds < 10 ? `0${milliseconds}` : `${milliseconds}`;

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    } else if (minutes > 0) {
      const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${minutes}:${formattedSeconds}`;
    } else {
      return `${seconds}.${formattedMilliseconds}`;
    }
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(props.endDate));

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(props.endDate));
    };

    let timer;
    if (timeRemainingInMS.current >= 60000) {
      timer = setInterval(updateTimer, 1000);
    } else {
      timer = setInterval(updateTimer, 100);
    }

    return () => clearInterval(timer);
  }, [props.endDate]);

  useEffect(() => {
    if (timeRemainingInMS.current < 60000) {
      const updateTimer = () => {
        setTimeRemaining(calculateTimeRemaining(props.endDate));
      };

      const timer = setInterval(updateTimer, 100);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Create an animated value
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const flashAnimation = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => flashAnimation());
    };

    flashAnimation();
  }, [fadeAnim]);

  return (
    <View style={styles.timerContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Svg height="10" width="10">
          <Circle cx="5" cy="5" r="4" fill={theme.colors.stockDownAccent} />
        </Svg>
      </Animated.View>
      <Text style={styles.timeText}>{timeRemaining}</Text>
    </View>
  );
};

export default Timer;
