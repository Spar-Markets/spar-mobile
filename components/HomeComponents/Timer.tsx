import React, {useState, useEffect} from 'react';
import { Text, TouchableOpacity, View, useColorScheme} from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { Svg, Circle } from 'react-native-svg';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';

const Timer = (props: any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width)

    const calculateTimeRemaining = (endDate: Date) => {
        const endDateTime = new Date(endDate).getTime();
        const currentTime = new Date().getTime();
    
        const timeRemaining = Math.max(0, endDateTime - currentTime); // Ensure time remaining doesn't go negative
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
        const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    
        if (hours > 0) {
          return `${formattedHours}:${formattedMinutes}`;
        } else {
          return `${formattedMinutes}:${formattedSeconds}`;
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
    

    return (
        <View style={styles.timerContainer}>
            <Text style={styles.timeText}>{timeRemaining}</Text>
        </View>
    )
}

export default Timer;