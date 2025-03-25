import React from 'react';
import { View } from 'react-native';
import CustomBackground from './CustomBackground'; // Ensure path is correct

const CustomZoomBackgroundContainer = ({ children, width, height, zoomDimension, onZoom }) => {
  // Optional zoom logic can be implemented here if needed
  return (
    <CustomBackground width={width} height={height}>
      <View style={{ width, height }}>
        {children}
      </View>
    </CustomBackground>
  );
};

export default CustomZoomBackgroundContainer;
