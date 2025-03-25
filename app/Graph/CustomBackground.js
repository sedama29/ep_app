import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

export const chartPadding = { top: 10, bottom: 50, left: 50, right: 50 };

const CustomBackground = ({ children, width, height, yScale }) => {
  if (!yScale) return <View>{children}</View>; // Use View if no yScale

  const plotAreaBottom = yScale(0);
  const yYellow = yScale(104);
  const yGreen = yScale(35);
  const yRed = yScale(104);

  const heightLightYellow = yGreen - yYellow;
  const heightLightGreen = plotAreaBottom - yGreen;
  const heightLightCoral = yScale(300) - yRed;

  return (
    <View style={{ position: 'relative', width, height }}>
      <Svg style={{ position: 'absolute', top: 0, left: 0 }}>
        <Rect
          x={chartPadding.left}
          y={yYellow}
          width={width - chartPadding.left - chartPadding.right}
          height={heightLightYellow}
          fill="#FFFFE5"
        />
        <Rect
          x={chartPadding.left}
          y={yGreen}
          width={width - chartPadding.left - chartPadding.right}
          height={heightLightGreen}
          fill="#E5FFE5"
        />
        <Rect
          x={chartPadding.left}
          y={yRed}
          width={width - chartPadding.left - chartPadding.right}
          height={heightLightCoral}
          fill="#FFE5E5"
        />
      </Svg>
      {children}
    </View>
  );
};

export default CustomBackground;
