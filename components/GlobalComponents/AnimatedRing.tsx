import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import Animated, { Easing, useSharedValue, useAnimatedProps, withRepeat, withTiming } from 'react-native-reanimated';

interface AnimatedRingProps {
  width: number;
  height: number;
  style?: ViewStyle;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedRing: React.FC<AnimatedRingProps> = ({ width, height, style }) => {
  const SIZE = Math.min(width, height);
  const STROKE_WIDTH = SIZE * 0.1;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const offset = progress.value * 100;
    return {
      strokeDashoffset: 0,
    };
  });

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={`hsl(${progress.value * 360}, 100%, 50%)`} />
            <Stop offset="25%" stopColor={`hsl(${(progress.value * 360 + 90) % 360}, 100%, 50%)`} />
            <Stop offset="50%" stopColor={`hsl(${(progress.value * 360 + 180) % 360}, 100%, 50%)`} />
            <Stop offset="75%" stopColor={`hsl(${(progress.value * 360 + 270) % 360}, 100%, 50%)`} />
            <Stop offset="100%" stopColor={`hsl(${progress.value * 360}, 100%, 50%)`} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="gray"
          strokeWidth={STROKE_WIDTH}
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeDasharray={`${RADIUS * 2 * Math.PI}`}
          strokeWidth={STROKE_WIDTH}
          stroke="url(#gradient)"
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedRing;
