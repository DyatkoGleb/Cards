import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  /** Цвет с плейсхолдером ALPHA для альфа (например rgba(16,185,129,ALPHA)) */
  color: string;
  /** Количество слоёв градиента */
  steps?: number;
};

export function FakeGradient({ color, steps = 100 }: Props) {
  const layers = [];

  for (let i = 0; i < steps; i++) {
    const alpha = (i + 1) / steps;
    layers.push(
      <View
        key={i}
        style={{
          flex: 1,
          backgroundColor: color.replace('ALPHA', alpha.toFixed(2)),
        }}
      />
    );
  }

  return <View style={StyleSheet.absoluteFillObject}>{layers}</View>;
}
