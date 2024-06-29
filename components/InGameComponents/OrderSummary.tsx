import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Animated,
  Dimensions,
  Easing,
  GestureResponderEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import createGlobalStyles from '../../styles/createGlobalStyles';
import HTHPageHeader from '../GlobalComponents/HTHPageHeader';
import StockOrderToggleButton from './StockOrderToggleButton';
import { TextInput } from 'react-native-gesture-handler';
import HapticFeedback from "react-native-haptic-feedback";
import Sound from 'react-native-sound';
import { Image } from 'react-native';


const OrderSummary = (props: any) => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();

  const route = useRoute();
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);




  Icon.loadFont();

  const params = route.params as any
  //console.log('StockOrder params:', params);

  const goBack = () => {
    navigation.goBack()
  }

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: theme.colors.background, fontFamily: 'InterTight-Bold', fontSize: 50}}>Order Filled!</Text>
        <Text style={{color: theme.colors.background, fontFamily: 'InterTight-Bold', fontSize: 35}}>{params?.shares} shares of {params?.ticker}</Text>
        <TouchableOpacity onPress={goBack} style={{marginTop: 30, backgroundColor: theme.colors.background, paddingHorizontal: 15, paddingVertical: 7, borderRadius: 50}} >
          <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18}}>Return to Match</Text>
        </TouchableOpacity>
    </View>
  );
};

export default OrderSummary;
