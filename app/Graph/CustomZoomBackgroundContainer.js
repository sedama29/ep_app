import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CustomBackground from './CustomBackground'; // Ensure path is correct
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

const CustomZoomBackgroundContainer = ({ children, width, height, zoomDimension, onZoom }) => {
  const [scale, setScale] = useState(1);

  const handlePinch = (event) => {
    if (event.nativeEvent.scale) {
      setScale(event.nativeEvent.scale);
      if (onZoom) {
        onZoom(event.nativeEvent.scale); // Call the onZoom callback if provided
      }
    }
  };

  const handlePinchStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      // Optional: Reset scale or handle the end of the pinch gesture
    }
  };

  return (
    <CustomBackground width={width} height={height}>
      <PinchGestureHandler
        onGestureEvent={handlePinch}
        onHandlerStateChange={handlePinchStateChange}
      >
        <View style={[styles.container, { width, height, transform: [{ scale }] }]}>
          {children}
        </View>
      </PinchGestureHandler>
    </CustomBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CustomZoomBackgroundContainer;
