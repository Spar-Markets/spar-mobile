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
import HapticFeedback from 'react-native-haptic-feedback';
import Sound from 'react-native-sound';
import { Image } from 'react-native';

// imports to access userID
import { RootState } from '../../GlobalDataManagment/store';
import { useDispatch, useSelector } from 'react-redux';
import { updateYourTickerPrices } from '../../GlobalDataManagment/matchesSlice';

interface stockOrderParams {
  ticker: string;
  matchID: string;
  buyingPower: number;
  isBuying: boolean;
  isSelling: boolean;
  qty: number;
  endAt: Date;
  logoUrl: string;
}

const StockOrder = (props: any) => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();

  const route = useRoute();

  const params = route.params as stockOrderParams | undefined;
  const { ticker } = params!;

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);

  const userID = useSelector((state: RootState) => state.user.userID);

  const [shareQuantity, setShareQuantity] = useState('0');
  const [dollarAmount, setDollarAmount] = useState('0');
  const [inReview, setInReview] = useState(false);

  const stockPrice = useSelector((state: RootState) => state.stock.stockPrice);
  const formattedShareQuantity = shareQuantity;
  const formattedDollarAmount = dollarAmount;

  const [selectedMode, setSelectedMode] = useState('shares');

  const goBack = () => {
    navigation.goBack();
  };
  Icon.loadFont();

  if (params == undefined) {
    console.error('STOCKORDER: params undefined');
    throw new Error(
      'params passed when navigating to Stock Order are in incorrect format.',
    );
  }

  const ws = useSelector(
    (state: RootState) => state.websockets[params?.ticker],
  );

  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    console.log(ws);
  }, [ws]);

  const purchaseStock = async () => {
    try {
      let buyResponse;
      if (selectedMode == "shares") {
        buyResponse = await axios.post(serverUrl + '/purchaseStock', {
          userID: userID,
          matchID: params?.matchID,
          ticker: params?.ticker,
          shares: shareQuantity,
          type: "shares"
        });
      } else {
        // dollar logic
        buyResponse = await axios.post(serverUrl + '/purchaseStock', {
          userID: userID,
          matchID: params?.matchID,
          ticker: params?.ticker,
          dollars: dollarAmount,
          type: "dollars"
        });
      }

      console.log('Buy Response:', buyResponse.data);
      if (buyResponse) {
        navigation.replace('OrderSummary', {
          ticker: params?.ticker,
          shares: shareQuantity,
          isBuying: params?.isBuying,
          isSelling: params?.isSelling,
          matchID: params?.matchID,
          buyData: buyResponse.data,
          logoUrl: params?.logoUrl,
        });
      }
    } catch (error) {
      console.log('Buy Error', error);
    }
  };

  const sellingStock = async () => {
    try {
      const sellResponse = await axios.post(serverUrl + '/sellStock', {
        userID: user.userID,
        matchID: params?.matchID,
        ticker: params?.ticker,
        shares: shareQuantity,
      });
      // TODO: handle error if order is invalid

      console.log('Sell Response:', sellResponse.data);
      if (sellResponse) {
        navigation.pop(2);
        navigation.replace('OrderSummary', {
          ticker: params?.ticker,
          shares: shareQuantity,
          isBuying: params?.isBuying,
          isSelling: params?.isSelling,
          matchID: params?.matchID,
          sellData: sellResponse.data,
          logoUrl: params?.logoUrl,
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
    if (selectedMode == 'shares') {
      if (
        shareQuantity.includes('.') &&
        shareQuantity.split('.')[1].length >= 6
      ) {
        return;
      }
      if (shareQuantity.length === 6 && !shareQuantity.includes('.')) {
        return;
      }
      if (shareQuantity !== '0') {
        setShareQuantity(prevInput => prevInput + value);
      } else {
        setShareQuantity(value);
      }
    }
    if (selectedMode == 'dollars') {
      if (
        dollarAmount.includes('.') &&
        dollarAmount.split('.')[1].length >= 2
      ) {
        return;
      }
      if (dollarAmount.length === 6 && !dollarAmount.includes('.')) {
        return;
      }
      if (dollarAmount !== '0') {
        setDollarAmount(prevInput => prevInput + value);
      } else {
        setDollarAmount(value);
      }
    }
  };

  const handleDelete = () => {
    HapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    if (selectedMode == 'shares') {
      if (shareQuantity.length > 1) {
        setShareQuantity(prevInput => prevInput.slice(0, -1));
      } else {
        setShareQuantity('0');
      }
    } else {
      if (dollarAmount.length > 1) {
        setDollarAmount(prevInput => prevInput.slice(0, -1));
      } else {
        setDollarAmount('0');
      }
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
    if (!dollarAmount.includes('.')) {
      setDollarAmount(prevInput => prevInput + '.');
    }
  };

  const animation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  const handleToggle = (option: any) => {
    console.log('toggled');
    const toValue = option === 'shares' ? 0 : -screenWidth;
    if (option) {
      setSelectedMode(option);
      console.log(option);
      setShareQuantity('0');
      setDollarAmount('0');
      if (inReview) {
        setInReview(false);
        Animated.timing(keypadAnimation, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    }
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const estimatedCost = stockPrice! * parseFloat(shareQuantity);
  const estimatedCostString = estimatedCost.toLocaleString(undefined, {
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

  const [circlePosition, setCirclePosition] = useState({ x: width / 2, y: 130 });

  const handlePressIn = (event: GestureResponderEvent) => {
    setCirclePosition({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
  };

  /**
   * Function to determine whether the currently inputted order is valid.
   * Works for both buy and sell orders.
   */
  const isOrderValid = () => {
    if (params.isBuying) {
      // CASE 1: Check buying validity conditions
      if (selectedMode == 'shares') {
        return shareQuantity != '0' && estimatedCost <= params?.buyingPower;
      } else if (selectedMode == 'dollars') {
        return (
          dollarAmount != '0' && parseFloat(dollarAmount) <= params?.buyingPower
        );
      } else {
        return false;
      }
    } else {
      // CASE 2: Check selling validity conditions
      if (selectedMode == 'shares') {
        // shares selling conditions
        // share quantity != 0
        // they own enough shares
        return shareQuantity != '0' && params?.qty >= Number(shareQuantity);
      } else if (selectedMode == 'dollars') {
        // dollars selling conditions
        // dollar amount != 0
        // dollar value of their shares is less than or equal to dollar amount
        return (
          dollarAmount != '0' &&
          params?.qty * stockPrice! <= Number(dollarAmount)
        );
      } else {
        return false;
      }
    }
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
      {/* <View style={{alignItems: 'center'}}>
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
      </View> */}
      <StockOrderToggleButton onToggle={handleToggle} />
      {selectedMode == 'shares' ? (
        <View>
          <View style={{ marginHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', marginVertical: 20 }}>
              <Text style={styles.orderFieldText}>Quantity</Text>
              <View style={{ flex: 1 }}></View>
              <Text style={styles.orderTextInput}>
                {formattedShareQuantity}
              </Text>
            </View>
            <View
              style={{ height: 1, backgroundColor: theme.colors.primary }}></View>
          </View>
          <View style={{ marginHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', marginVertical: 20 }}>
              <Text style={styles.orderFieldText}>Market Price</Text>
              <View style={{ flex: 1 }}></View>
              <Text style={styles.orderFieldText}>${stockPrice}</Text>
            </View>
            <View
              style={{ height: 1, backgroundColor: theme.colors.primary }}></View>
          </View>
          <View style={{ marginHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', marginVertical: 20 }}>
              {params?.isBuying && (
                <Text style={styles.orderFieldText}>Est. Cost</Text>
              )}
              {params?.isSelling && (
                <Text style={styles.orderFieldText}>Est. Credit</Text>
              )}
              <View style={{ flex: 1 }}></View>
              <Text style={styles.orderFieldText}>${estimatedCostString}</Text>
            </View>
            <View
              style={{ height: 1, backgroundColor: theme.colors.primary }}></View>
          </View>
        </View>
      ) : (
        <>
          <View style={{ flex: 1 }}></View>
          <View
            style={{ justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <Text
              style={[
                styles.orderTextInput,
                selectedMode == 'dollars' && { fontSize: 40 },
              ]}>
              ${formattedDollarAmount}
            </Text>
            <Text
              style={[
                styles.orderTextInput,
                selectedMode == 'dollars' && {
                  fontSize: 20,
                  color: theme.colors.tertiary,
                },
              ]}>
              {(parseFloat(formattedDollarAmount) / stockPrice!).toFixed(4)}{' '}
              Shares
            </Text>
          </View>
        </>
      )}
      <View style={{ flex: 1 }}></View>

      {inReview ? (
        <TouchableOpacity
          onPress={handleEditOrder}
          style={{
            paddingVertical: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{ color: theme.colors.accent, fontFamily: 'InterTight-Bold' }}>
            Edit Order
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 15 }}>
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
      )}
      <View>
        <View style={{ marginBottom: 50 }}>
          <Animated.View style={{ transform: [{ translateY: keypadAnimation }] }}>
            {isOrderValid() ? (
              <>
                <TouchableOpacity
                  onPressIn={handlePressIn}
                  onPress={() => {
                    if (inReview) {
                      handleSubmitPress();
                    } else {
                      handleReview();
                    }
                  }}
                  style={[globalStyles.primaryBtn, { marginBottom: 50 }]}>
                  <Text style={globalStyles.primaryBtnText}>
                    {inReview ? 'Submit' : 'Review'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View
                style={[
                  globalStyles.primaryBtn,
                  { marginBottom: 50, backgroundColor: theme.colors.primary },
                ]}>
                <Text style={globalStyles.primaryBtnText}>Review</Text>
              </View>
            )}
          </Animated.View>
          <Animated.View
            style={[
              styles.expandingCircle,
              {
                transform: [{ scale: radius }],
                top: circlePosition.y - 500,
                left: circlePosition.x,
              },
            ]}
          />

          <Animated.View style={{ transform: [{ translateY: keypadAnimation }] }}>
            <View>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('1')}>
                  <Text style={[styles.buttonText, { textAlign: 'left' }]}>
                    1
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('2')}>
                  <Text style={[styles.buttonText, { textAlign: 'center' }]}>
                    2
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('3')}>
                  <Text style={[styles.buttonText, { textAlign: 'right' }]}>
                    3
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('4')}>
                  <Text style={[styles.buttonText, { textAlign: 'left' }]}>
                    4
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('5')}>
                  <Text style={[styles.buttonText, { textAlign: 'center' }]}>
                    5
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('6')}>
                  <Text style={[styles.buttonText, { textAlign: 'right' }]}>
                    6
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('7')}>
                  <Text style={[styles.buttonText, { textAlign: 'left' }]}>
                    7
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('8')}>
                  <Text style={[styles.buttonText, { textAlign: 'center' }]}>
                    8
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('9')}>
                  <Text style={[styles.buttonText, { textAlign: 'right' }]}>
                    9
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePress('0')}>
                  <Text style={[styles.buttonText, { textAlign: 'left' }]}>
                    0
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleDecimal}>
                  <Text style={[styles.buttonText, { textAlign: 'center' }]}>
                    .
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { justifyContent: 'center', alignItems: 'center' },
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
    </View>
  );
};

export default StockOrder;
