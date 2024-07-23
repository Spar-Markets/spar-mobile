import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, Skia, Paint, Text as SkiaText, useFont } from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');

interface TrapezoidViewProps {
  backgroundColor: string;
  height: number;
  width: number;
  text: string;
}


const TrapezoidView: React.FC<TrapezoidViewProps> = ({ backgroundColor, height, width, text }) => {
  const topWidth = width * 0.8;
  const bottomWidth = width * 0.6;
  const leftOffset = (topWidth - bottomWidth) / 2;

  const path = Skia.Path.Make();
  path.moveTo(0, 0); // Top left
  path.lineTo(topWidth, 0); // Top right
  path.lineTo(topWidth - leftOffset, height); // Bottom right
  path.lineTo(leftOffset, height); // Bottom left
  path.close();

  const paint = Skia.Paint();
  paint.setColor(Skia.Color(backgroundColor));

  // Center text within the trapezoid
  const textPaint = Skia.Paint();
  textPaint.setColor(Skia.Color('white'));

  // Calculate text position
  const textX = topWidth / 2;
  const textY = height / 2;

  return (
    <View style={styles.container}>
      <Canvas style={{ width: topWidth, height }}>
        <Path path={path} paint={paint} />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TrapezoidView;
