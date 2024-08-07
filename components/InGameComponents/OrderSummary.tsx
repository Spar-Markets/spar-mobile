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
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import { Skeleton } from '@rneui/base';


const OrderSummary = (props: any) => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();

  const route = useRoute();
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);

  const [buyPrice, setBuyPrice] = useState<any>(null)

  const params = route.params as any

  const price = params.isBuying ? params?.buyData.buyPrice : params?.sellData.sellPrice;

  const costOrCredit = params.isBuying ? "Cost" : "Credit";

  const updatedTotalshares = params.isBuying ? params?.buyData.updatedTotalshares : params?.sellData.updatedTotalShares
 
  /* useEffect(() => {
    if (params?.ticker && params?.matchID) {
      console.log("Hello", params?.ticker, params?.matchID, matches[params?.matchID].yourAssets)
      yourShares.current = matches[params?.matchID].yourAssets[params?.ticker]
      //console.log("poppo", matches[params?.matchID].yourAssets[params?.ticker])
    }
  }, [params?.ticker, params?.matchID])*/

  Icon.loadFont();
  
  useEffect(() => {
    if (params?.buyData) {
      console.log(params?.buyData, params?.buyData.buyPrice, params?.logoUrl)
    }
  }, [params?.buyData])

  //console.log('StockOrder params:', params);

  const goBack = () => {
    navigation.popToTop()
  }

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', gap: 10}}>
        <View style={{backgroundColor: theme.colors.secondary, height: height/2, width: width -40, borderRadius: 10, alignItems: 'center', padding: 15}}>
          <Text style={{color: theme.colors.text, fontFamily: 'InterTight-SemiBold', fontSize: 24, marginTop: 10}}>{params?.isBuying ? "Buy" : "Sell"} Order Executed</Text>
            <View style={{flex: 1, width: '100%', marginVertical: 10}}>
            <View style={{flexDirection: 'row', marginVertical: 10, alignItems: 'center'}}>
              <Text style={{color: theme.colors.text, fontFamily: 'intertight-semiBold'}}>Ticker</Text>
              <View style={{flex: 1}}></View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Text style={{color: theme.colors.text, fontFamily: 'intertight-semibold'}}>{params?.ticker}</Text>
                {params?.logoUrl && params?.logoUrl != 'logoUrlError' ? (
                <>
                  <Image
                    source={{uri: params?.logoUrl}}
                    style={{aspectRatio: 1, borderRadius: 50, height: 35, width: 35}}
                  />
                </>
              ): <Skeleton animation={"pulse"} height={50} width={50} style={{backgroundColor: theme.colors.primary, borderRadius: 50}} skeletonStyle={{backgroundColor: theme.colors.secondary}}></Skeleton>}
              </View>
            </View>
            <View style={{width: '100%', height: 1, backgroundColor: theme.colors.tertiary}}></View>
            <View style={{flexDirection: 'row', marginVertical: 10}}>
              <Text style={{color: theme.colors.text, fontFamily: 'intertight-semiBold'}}>Shares</Text>
              <View style={{flex: 1}}></View>
              <Text style={{color: theme.colors.text, fontFamily: 'intertight-semibold'}}>{params?.shares} Shares</Text>
            </View>
            <View style={{width: '100%', height: 1, backgroundColor: theme.colors.tertiary}}></View>
            <View style={{flexDirection: 'row', marginVertical: 10}}>
              <Text style={{color: theme.colors.text, fontFamily: 'intertight-semiBold'}}>Price</Text>
              <View style={{flex: 1}}></View>
              <Text style={{color: theme.colors.text, fontFamily: 'intertight-semibold'}}>${(price).toFixed(2)}</Text>
            </View>
            <View style={{width: '100%', height: 1, backgroundColor: theme.colors.tertiary}}></View>
            <View style={{flexDirection: 'row', marginVertical: 10}}>
              <Text style={{color: theme.colors.text, fontFamily: 'intertight-semiBold'}}>Total {costOrCredit}</Text>
              <View style={{flex: 1}}></View>
              <Text style={{color: theme.colors.text, fontFamily: 'intertight-semibold'}}>${(parseFloat(params?.shares) * price).toFixed(2)}</Text>
            </View>
            <View style={{width: '100%', height: 1, backgroundColor: theme.colors.tertiary}}></View>
            <View style={{flexDirection: 'row', marginVertical: 10}}>
              <Text style={{color: theme.colors.text, fontFamily: 'intertight-semiBold'}}>Total Match Position</Text>
              <View style={{flex: 1}}></View>
              <Text style={{color: theme.colors.text, fontFamily: 'intertight-semibold'}}>{updatedTotalshares} Shares</Text>
            </View>
          </View>
          <TouchableOpacity onPress={goBack} style={{backgroundColor: theme.colors.accent, width: '100%', alignItems: 'center',paddingVertical: 12, borderRadius: 5}} >
            <Text style={{color: theme.colors.background, fontFamily: 'InterTight-Bold', fontSize: 18}}>Return to Match</Text>
          </TouchableOpacity>
        </View>
        
        {/*<Text style={{color: theme.colors.background, fontFamily: 'InterTight-Bold', fontSize: 50}}>Order Filled!</Text>
        <Text style={{color: theme.colors.background, fontFamily: 'InterTight-Bold', fontSize: 35}}>{params?.shares} shares of {params?.ticker}</Text>
        <TouchableOpacity onPress={goBack} style={{marginTop: 30, backgroundColor: theme.colors.background, paddingHorizontal: 15, paddingVertical: 7, borderRadius: 50}} >
          <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18}}>Return to Match</Text>
        </TouchableOpacity>*/}
    
    </View>
  );
};

export default OrderSummary;
