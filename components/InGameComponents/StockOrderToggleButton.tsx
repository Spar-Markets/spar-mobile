import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, Animated, Dimensions} from 'react-native';
import createHomeStyles from '../../styles/createHomeStyles';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';

const StockOrderToggleButton = ({onToggle}: any) => {
  // Layour and Style Initilization
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createHomeStyles(theme, width);
  const [active, setActive] = useState('shares');
  const animation = useRef(new Animated.Value(0)).current;

  const toggleWidth = Dimensions.get('window').width; //account for margin

  useEffect(() => {
    Animated.timing(animation, {
      toValue: active === 'shares' ? 0 : toggleWidth / 2,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [active]);

  const handleToggle = (value: string) => {
    setActive(value);
    onToggle(value);
  };

  const headToHeadColor = animation.interpolate({
    inputRange: [0, toggleWidth / 2],
    outputRange: [theme.colors.text, theme.colors.tertiary],
  });

  const tournamentsColor = animation.interpolate({
    inputRange: [0, toggleWidth / 2],
    outputRange: [theme.colors.tertiary, theme.colors.text],
  });

  return (
    <View style={[styles.toggleContainer, {marginBottom: 0}]}>
      <Animated.View style={[styles.animatedBackground, {left: animation}]} />
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => handleToggle('shares')}>
        <Animated.Text style={[styles.toggleText, {color: headToHeadColor}]}>
          Shares
        </Animated.Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => handleToggle('dollars')}>
        <Animated.Text style={[styles.toggleText, {color: tournamentsColor}]}>
          Dollars
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

export default StockOrderToggleButton;
