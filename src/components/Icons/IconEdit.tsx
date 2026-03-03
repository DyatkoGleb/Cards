import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export function IconEdit({ size = 24, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="translate(12, 12) scale(1.16) translate(-14.75, -9.25)">
        <Path
          d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}