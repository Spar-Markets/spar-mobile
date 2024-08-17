import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

const ModeToggleButton = ({ theme }: any) => {
  const [activeMode, setActiveMode] = useState("Head-to-Head");
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handleModePress = (mode: string) => {
    setActiveMode(mode);
    Animated.timing(animatedValue, {
      toValue: mode === "Head-to-Head" ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColorInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background, theme.colors.background] // Customize as needed
  });

  const headToHeadTranslate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100] // Adjust this based on your layout, width of each button
  });

  return (
    <View style={{ height: 45, marginTop: 10 }}>
      <View style={{
        flex: 1,
        marginHorizontal: 20,
        backgroundColor: theme.colors.secondary,
        borderRadius: 10,
        height: 10,
        flexDirection: 'row',
        gap: 5
      }}>
        <Animated.View
          style={{
            position: 'absolute',
            height: '100%',
            width: '50%',
            borderRadius: 7,
            backgroundColor: backgroundColorInterpolation,
            transform: [{ translateX: headToHeadTranslate }],
          }}
        />
        <TouchableOpacity onPress={() => handleModePress("Head-to-Head")} style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 5,
          marginLeft: 5,
          borderRadius: 7,
          zIndex: 1
        }}>
          <Text style={{ color: theme.colors.opposite, fontFamily: 'intertight-bold' }}>Head-to-Head</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleModePress("Tournaments")} style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 5,
          marginRight: 5,
          borderRadius: 7,
          zIndex: 1
        }}>
          <Text style={{ color: theme.colors.opposite, fontFamily: 'intertight-bold' }}>Tournaments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ModeToggleButton;
