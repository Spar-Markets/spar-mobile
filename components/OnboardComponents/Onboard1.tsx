import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Button, TextInput, Alert, NativeSyntheticEvent, NativeScrollEvent, StatusBar, GestureResponderEvent } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createOnboardStyles from '../../styles/createOnboardStyles';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { signInWithEmailAndPassword } from 'firebase/auth';
import useUserDetails from '../../hooks/useUserDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import Swiper from 'react-native-swiper';
import { ScrollView } from 'react-native';
import HapticFeedback from "react-native-haptic-feedback";
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const images = [
    { source: require("../../assets/images/onboard1.png"), label: "Trade & win real money", text: "Pay to enter timed competitions, get a higher return than your opponents, win the prize pool" },
    { source: require("../../assets/images/onboard2.png"), label: "Increase your rank & Earn More", text: "Increasing rank gets you access to higher stakes matches and higher potential payouts"},
    { source: require("../../assets/images/onboard3.png"), label: "Trading just got a lot more fun", text: "Play head-to-head matches and tournaments"},
  ];

const backgroundColors = ['#3357FF', '#ffa733', '#08a677'];

type RootStackParamList = {
    Onboard1: { reverseAnimation?: boolean };
    EmailScreen: undefined;
  };

const Onboard1 = () => {

    // Layour and Style Initilization
    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createOnboardStyles(theme, width)
    const { userData } = useUserDetails();

    const navigation = useNavigation<any>();

    const route = useRoute<RouteProp<RootStackParamList, 'Onboard1'>>();

    const scrollX = useRef(new Animated.Value(0)).current;
    const radius = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const colorInterpolation = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
    const circleOpacity = useRef(new Animated.Value(1)).current;

    const clampedScrollX = scrollX.interpolate({
        inputRange: [0, images.length * width],
        outputRange: [0, images.length * width],
        extrapolate: 'clamp',
    });

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })(event);
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.floor(contentOffsetX / (width - 40));
    
        if (index !== currentIndex) {
          setCurrentIndex(index);
          HapticFeedback.trigger("impactHeavy", {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false
          });
        }
      };

    // Animated value for the button position
    const buttonTranslateY = scrollX.interpolate({
        inputRange: [(images.length - 2) * (width-40), (images.length - 1) * (width-40)],
        outputRange: [200, 0], // Slide up to visible position
        extrapolate: 'clamp',
    });

    const [circlePosition, setCirclePosition] = useState({ x: width / 2, y: 130 });

    const handleGetStartedPress = () => {
        // Trigger haptic feedback multiple times in succession
        const interval = setInterval(() => {
            HapticFeedback.trigger("impactHeavy", {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false
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
            Animated.timing(colorInterpolation, {
                toValue: 1,
                duration: 800,
                useNativeDriver: false,
            }),
        ]).start(() => {
            navigation.navigate('EmailScreen'); // Replace 'Home' with your desired route
        });
    };

    const handlePressIn = (event: GestureResponderEvent) => {
        setCirclePosition({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    };

    const handleSignInPress = () => {
        // Trigger haptic feedback multiple times in succession
        const interval = setInterval(() => {
            HapticFeedback.trigger("impactHeavy", {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false
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
            Animated.timing(colorInterpolation, {
                toValue: 1,
                duration: 800,
                useNativeDriver: false,
            }),
        ]).start(() => {
            navigation.navigate('SignInScreen'); // Replace 'Home' with your desired route
        });
    };


    useEffect(() => {
        // Trigger the fade-in animation when the component mounts
        Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (route.params?.reverseAnimation) {
            radius.setValue(2 * Math.sqrt(width * width + height * height)); // Reset the radius
            colorInterpolation.setValue(1); // Reset the colorInterpolation
            circleOpacity.setValue(0); // Reset the opacity
          Animated.parallel([
            Animated.timing(radius, {
              toValue: 0,
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(colorInterpolation, {
              toValue: 0,
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(circleOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
              delay: 800,
            }),
          ]).start(() => {
            navigation.setParams({ reverseAnimation: false });
          });
          const interval = setInterval(() => {
            HapticFeedback.trigger("impactHeavy", {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false
            });
        }, 50); // Adjust the interval as needed (e.g., 100ms)
    
            // Stop the haptic feedback after a short duration
        setTimeout(() => {
            clearInterval(interval);
        }, 800); // Adjust the duration as needed (e.g., 800ms)
        
        }
      }, [route.params?.reverseAnimation]);

    // Interpolate the color value from theme accent to black
    const expandingCircleColor = colorInterpolation.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.accent, theme.colors.background]
    });   

    // Interpolate the background color based on the scroll position
    const backgroundColor = clampedScrollX.interpolate({
        inputRange: images.map((_, index) => index * width),
        outputRange: backgroundColors,
        extrapolate: 'clamp', // Ensure it doesn't extrapolate beyond the defined range
    });

    
    const translateY = images.map((_, index) => scrollX.interpolate({
        inputRange: [(index - 1) * width, index * width, (index + 1) * width],
        outputRange: [-0.5*height, 0, -0.5*height], // Slide down from off-screen and up to off-screen
        extrapolate: 'clamp',
      }));
    

    return (
        
        <Animated.View style={[styles.onboardContainer, { opacity }]}>
          <Text style={styles.sparText}>Spar</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            style={styles.onboardScroll}
          > 
            {images.map((item, index) => {
              const translateX = scrollX.interpolate({
                inputRange: [
                  (index - 1) * (width),
                  index * (width),
                  (index + 1) * (width),
                ],
                outputRange: [(width), 0, -(width)],
              });
    
              const opacity = scrollX.interpolate({
                inputRange: [
                  (index - 1) * (width),
                  index * (width),
                  (index + 1) * (width),
                ],
                outputRange: [0, 1, 0],
              });
    
              return (
                <View style={styles.slide} key={index}>
                  <Animated.View style={[styles.onboardImageContainer ]}>
                    <Animated.Image style={[styles.onboardImage, { transform: [{ translateY: translateY[index] }]}]} source={item.source} />
                  </Animated.View>
                  <View style={styles.textContainer}>
                    <Animated.Text
                      style={[styles.labelText, { transform: [{ translateX }], opacity }]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      >
                      {item.label}
                    </Animated.Text>
                    <Animated.Text
                      style={[styles.text, { transform: [{ translateX }], opacity }]}
                      >
                      {item.text}
                    </Animated.Text>
                </View>
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.pagination}>
            {images.map((_, index) => {
              const dotOpacity = scrollX.interpolate({
                inputRange: [
                  (index - 1) * (width),
                  index * (width),
                  (index + 1) * (width),
                ],
                outputRange: [0.5, 1, 0.5],
                extrapolate: 'clamp',
              });
              const backgroundColor = scrollX.interpolate({
                inputRange: [
                  (index - 1) * (width),
                  index * (width),
                  (index + 1) * (width),
                ],
                outputRange: [theme.colors.opposite, theme.colors.opposite, theme.colors.opposite],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={index}
                  style={[styles.dot, {opacity: dotOpacity, backgroundColor }]}
                />
              );
            })}
          </View>
          <Animated.View style={[styles.buttonContainer, /*{ transform: [{ translateY: buttonTranslateY }] }*/]}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleGetStartedPress}
              onPressIn={handlePressIn}
            >
              <Text style={[styles.buttonText, {color: theme.colors.background}]}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {backgroundColor: 'transparent'}]}
            onPress={handleSignInPress} onPressIn={handlePressIn}>
                <Text style={[styles.buttonText, {color: theme.colors.text}]}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.expandingCircle, { backgroundColor: expandingCircleColor, transform: [{ scale: radius }], 
          top: circlePosition.y,
          left: circlePosition.x, }]} />
        </Animated.View>

      );
    };


export default Onboard1;