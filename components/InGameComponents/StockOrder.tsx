import React, {useState, useRef, useEffect} from 'react';
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
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {serverUrl} from '../../constants/global';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import createGlobalStyles from '../../styles/createGlobalStyles';
import HTHPageHeader from '../GlobalComponents/HTHPageHeader';
import StockOrderToggleButton from './StockOrderToggleButton';
import {TextInput} from 'react-native-gesture-handler';
import HapticFeedback from 'react-native-haptic-feedback';
import Sound from 'react-native-sound';
import {Image} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';

interface stockOrderParams {
  ticker: string;
  matchID: string;
  tradeType: string;
  buyingPower: number;
  isBuying: boolean;
  isSelling: boolean;
  qty: number;
  endAt: Date;
}

const StockOrder = (props: any) => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();

  const route = useRoute();
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createStockSearchStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);

  const [shareQuantity, setShareQuantity] = useState('0');
  const [marketPrice, setMarketPrice] = useState(124.34);
  const [inReview, setInReview] = useState(false);

  const goBack = () => {
    navigation.goBack();
  };
  Icon.loadFont();

  const params = route.params as stockOrderParams | undefined;
  //console.log('StockOrder params:', params);
  if (params == undefined) {
    console.error('STOCKORDER: params undefined');
    throw new Error(
      'params passed when navigating to Stock Order are in incorrect format.',
    );
  }

  const ws = useSelector((state: RootState) => state.websockets[params?.ticker]);

  useEffect(() => {
    console.log(ws)
  }, [ws])

  const purchaseStock = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const buyResponse = await axios.post(serverUrl + '/purchaseStock', {
        userID: userID,
        matchID: params?.matchID,
        ticker: params?.ticker,
        shares: shareQuantity,
      });
      console.log('Buy Response:', buyResponse.data);
      if (buyResponse) {
        navigation.pop(2);
        navigation.replace('OrderSummary', {
          ticker: params?.ticker,
          shares: shareQuantity,
        });
      }
    } catch (error) {
      console.log('Buy Error', error);
    }
  };

  const sellingStock = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const sellResponse = await axios.post(serverUrl + '/sellStock', {
        userID: userID,
        matchID: params?.matchID,
        ticker: params?.ticker,
        shares: shareQuantity,
      });
      console.log('Sell Response:', sellResponse.data);
      if (sellResponse) {
        navigation.pop(2);
        navigation.replace('OrderSummary', {
          ticker: params?.ticker,
          shares: shareQuantity,
        });
      }
    } catch (error) {
      console.log('Sell Error', error);
    }
  };

  const handlePress = (value: string) => {
    HapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    if (
      shareQuantity.includes('.') &&
      shareQuantity.split('.')[1].length >= 6
    ) {
      return;
    }
    if (shareQuantity.length === 5 && !shareQuantity.includes('.')) {
      return;
    }
    if (shareQuantity !== '0') {
      setShareQuantity(prevInput => prevInput + value);
    } else {
      setShareQuantity(value);
    }
  };

  const handleDelete = () => {
    HapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    if (shareQuantity.length > 1) {
      setShareQuantity(prevInput => prevInput.slice(0, -1));
    } else {
      setShareQuantity('0');
    }
  };

  const handleDecimal = () => {
    HapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    if (!shareQuantity.includes('.')) {
      setShareQuantity(prevInput => prevInput + '.');
    }
  };

  const animation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  const handleToggle = (option: any) => {
    const toValue = option === 'shares' ? 0 : -screenWidth;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const formatShareQuantity = (quantity: string) => {
    const [integerPart, decimalPart] = quantity.split('.');
    const formattedIntegerPart = Number(integerPart).toLocaleString();
    return decimalPart !== undefined
      ? `${formattedIntegerPart}.${decimalPart}`
      : formattedIntegerPart;
  };

  const formattedShareQuantity = formatShareQuantity(shareQuantity);

  const estimatedCost = (
    marketPrice * parseFloat(shareQuantity)
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const keypadAnimation = useRef(new Animated.Value(0)).current;

  const handleReview = () => {
    setInReview(true);
    Animated.timing(keypadAnimation, {
      toValue: 335,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const handleEditOrder = () => {
    setInReview(false);
    Animated.timing(keypadAnimation, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const radius = useRef(new Animated.Value(0)).current;

  const handleSubmitPress = () => {
    // Trigger haptic feedback multiple times in succession
    const interval = setInterval(() => {
      HapticFeedback.trigger('impactHeavy', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }, 50); // Adjust the interval as needed (e.g., 100ms)

    // Stop the haptic feedback after a short duration
    setTimeout(() => {
      clearInterval(interval);
    }, 800); // Adjust the duration as needed (e.g., 800ms)

    // Start the expansion and color change animations
    Animated.parallel([
      Animated.timing(radius, {
        toValue: 2 * Math.sqrt(width * width + height * height),
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start(() => {
      //navigation.navigate('EmailScreen'); // Replace 'Home' with your desired route
      if (params?.isBuying == true) {
        purchaseStock();
      } else if (params?.isSelling == true) {
        sellingStock();
      }
    });
  };

  const [circlePosition, setCirclePosition] = useState({x: width / 2, y: 130});

  const handlePressIn = (event: GestureResponderEvent) => {
    setCirclePosition({x: event.nativeEvent.pageX, y: event.nativeEvent.pageY});
  };

  return (
    <View style={styles.container}>
      {params?.isBuying == true && (
        <HTHPageHeader
          text={'Buying ' + params?.ticker}
          endAt={params?.endAt}
        />
      )}
      {params?.isSelling == true && (
        <HTHPageHeader
          text={'Selling ' + params?.ticker}
          endAt={params?.endAt}
        />
      )}
      <View style={{alignItems: 'center'}}>
        {params?.isBuying && (
          <Text
            style={{
              color: theme.colors.secondaryText,
              fontFamily: 'InterTight-Bold',
            }}>
            ${params?.buyingPower.toFixed(2)} Available
          </Text>
        )}
        {params?.isSelling && (
          <Text
            style={{
              color: theme.colors.secondaryText,
              fontFamily: 'InterTight-Bold',
            }}>
            {params?.qty} Shares Available
          </Text>
        )}
      </View>
      <StockOrderToggleButton onToggle={handleToggle} />
      <View style={{marginHorizontal: 20}}>
        <View style={{flexDirection: 'row', marginVertical: 20}}>
          <Text style={styles.orderFieldText}>Quantity</Text>
          <View style={{flex: 1}}></View>
          <Text style={styles.orderTextInput}>{formattedShareQuantity}</Text>
        </View>
        <View style={{height: 1, backgroundColor: theme.colors.primary}}></View>
      </View>
      <View style={{marginHorizontal: 20}}>
        <View style={{flexDirection: 'row', marginVertical: 20}}>
          <Text style={styles.orderFieldText}>Market Price</Text>
          <View style={{flex: 1}}></View>
          <Text style={styles.orderFieldText}>${props.currentPrice}</Text>
        </View>
        <View style={{height: 1, backgroundColor: theme.colors.primary}}></View>
      </View>
      <View style={{marginHorizontal: 20}}>
        <View style={{flexDirection: 'row', marginVertical: 20}}>
          {params?.isBuying && (
            <Text style={styles.orderFieldText}>Est. Cost</Text>
          )}
          {params?.isSelling && (
            <Text style={styles.orderFieldText}>Est. Credit</Text>
          )}
          <View style={{flex: 1}}></View>
          <Text style={styles.orderFieldText}>${estimatedCost}</Text>
        </View>
        <View style={{height: 1, backgroundColor: theme.colors.primary}}></View>
      </View>
      {inReview && (
        <TouchableOpacity
          onPress={handleEditOrder}
          style={{
            paddingVertical: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{color: theme.colors.accent, fontFamily: 'InterTight-Bold'}}>
            Edit Order
          </Text>
        </TouchableOpacity>
      )}
      <View style={{flex: 1}}></View>
      <View style={{marginBottom: 50}}>
        <Animated.View style={{transform: [{translateY: keypadAnimation}]}}>
          {shareQuantity != '0' ? (
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPress={() => {
                if (inReview) {
                  handleSubmitPress();
                } else {
                  handleReview();
                }
              }}
              style={[globalStyles.primaryBtn, {marginBottom: 50}]}>
              <Text style={globalStyles.primaryBtnText}>
                {inReview ? 'Submit' : 'Review'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                globalStyles.primaryBtn,
                {marginBottom: 50, backgroundColor: theme.colors.primary},
              ]}>
              <Text style={globalStyles.primaryBtnText}>Review</Text>
            </View>
          )}
        </Animated.View>
        <Animated.View
          style={[
            styles.expandingCircle,
            {
              transform: [{scale: radius}],
              top: circlePosition.y - 500,
              left: circlePosition.x,
            },
          ]}
        />
        <Animated.View style={{transform: [{translateY: keypadAnimation}]}}>
          <View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('1')}>
                <Text style={[styles.buttonText, {textAlign: 'left'}]}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('2')}>
                <Text style={[styles.buttonText, {textAlign: 'center'}]}>
                  2
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('3')}>
                <Text style={[styles.buttonText, {textAlign: 'right'}]}>3</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('4')}>
                <Text style={[styles.buttonText, {textAlign: 'left'}]}>4</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('5')}>
                <Text style={[styles.buttonText, {textAlign: 'center'}]}>
                  5
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('6')}>
                <Text style={[styles.buttonText, {textAlign: 'right'}]}>6</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('7')}>
                <Text style={[styles.buttonText, {textAlign: 'left'}]}>7</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('8')}>
                <Text style={[styles.buttonText, {textAlign: 'center'}]}>
                  8
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('9')}>
                <Text style={[styles.buttonText, {textAlign: 'right'}]}>9</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress('0')}>
                <Text style={[styles.buttonText, {textAlign: 'left'}]}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleDecimal}>
                <Text style={[styles.buttonText, {textAlign: 'center'}]}>
                  .
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {justifyContent: 'center', alignItems: 'center'},
                ]}
                onPress={handleDelete}>
                <Icon
                  name="long-arrow-left"
                  size={24}
                  color={theme.colors.text}
                  style={{}}></Icon>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

export default StockOrder;
