import React from 'react';
import Svg, { Rect } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export function IconCards({ size = 24, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="2"
        y="5"
        width="14"
        height="10"
        rx="1.5"
        stroke={color}
        strokeWidth={2}
      />
      <Rect
        x="6"
        y="9"
        width="14"
        height="10"
        rx="1.5"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}
