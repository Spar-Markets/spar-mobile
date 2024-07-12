import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import createOnboardStyles from '../../styles/createOnboardStyles';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';

const SplashScreen = () => {
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createOnboardStyles(theme, width);

  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default SplashScreen;
