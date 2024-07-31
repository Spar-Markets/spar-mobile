import React, {useState, useEffect, useRef} from 'react';
import { Text, TouchableOpacity, View, useColorScheme} from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { Svg, Circle } from 'react-native-svg';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import { Animated } from 'react-native';

const Timer = (props: any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width)

    const calculateTimeRemaining = (endDate:Date) => {
      const endDateTime = new Date(endDate).getTime();
      const currentTime = new Date().getTime();
    
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
    
    const [timeRemaining, setTimeRemaining] = useState(
        calculateTimeRemaining(props.endDate)
    );

    useEffect(() => {
        const timer = setInterval(() => {
          setTimeRemaining(calculateTimeRemaining(props.endDate));
          if (timeRemaining == '0:0:0') {
            //fix format of time
            //run axios post to remove match from matches and distribute winnings. add to past matches collection
          }
        }, 1000);
        return () => clearInterval(timer);
    }, [props.endDate]);

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
                  <Circle
                      cx="5"
                      cy="5"
                      r="4"
                      fill={theme.colors.stockDownAccent}
                  />
              </Svg>
            </Animated.View>
            <Text style={styles.timeText}>{timeRemaining}</Text>
        </View>
    )
}

export default Timer;