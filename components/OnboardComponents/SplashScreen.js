import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
} from 'react-native';
import createOnboardStyles from '../../styles/createOnboardStyles';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import Svg, {Path} from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SplashScreen = () => {
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createOnboardStyles(theme, width);

  return (
    <View style={styles.splashContainer}>
      <Image
        style={{height: 100, width: 56}}
        source={require('../../assets/images/logo.png')}
      />
    </View>
  );
};

export default SplashScreen;
