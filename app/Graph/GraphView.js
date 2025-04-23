import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import axios from 'axios';
import * as d3 from 'd3';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Svg, Line, Path, G, Text as SvgText, Rect } from 'react-native-svg';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { styles } from '../style/style_graph_view';

const chartPadding = { top: 10, bottom: 45, left: 50, right: 10 };
const configIcon = require('../../assets/images/map_images/configuration_icon.jpg');

const GraphView = ({ siteId }) => {
  const [data, setData] = useState({});
  const [visiblePlots, setVisiblePlots] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [maxYValue, setMaxYValue] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
  }, [tooltipData]);
  useEffect(() => {
  }, [tooltipPos]);
  
  const screenWidth = 450;
  const screenHeight = 400;
  const formatDate = d3.timeFormat("%d %b");
  const formatDateFull = d3.timeFormat("%Y-%m-%d %H:%M:%S");

  const today = new Date();
  const earlierToday = new Date(today.getTime() - 7 * 60 * 60 * 1000);
  const laterToday = new Date(today.getTime() + 7 * 60 * 60 * 1000);
  const earlierTodayFormatted = formatDateFull(earlierToday);
  const laterTodayFormatted = formatDateFull(laterToday);

  const colors = ['#0B6623', '#FF5733', '#D7AC00', '#FF6600', '#FFC928', '#FF2868', '#EE4B2B', '#300000', '#E67E22'];

  const scale = useSharedValue(1);
  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      scale.value = event.scale;
    },
    onEnd: () => {
      scale.value = withTiming(1);
    }
  });
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const toggleDropdown = () => {
    try {
      setDropdownVisible(prev => !prev);
    } catch (e) {
      console.error("Dropdown toggle error:", e);
    }
  };

  const handlePlotToggle = (key, group = false) => {
    if (group) {
      setVisiblePlots(prev => ({
        ...prev,
        'Probability_Space_high': !prev['Probability_Space_high'],
        'Probability_Space_low': !prev['Probability_Space_low'],
        'Probability_Space': !prev['Probability_Space'],
      }));
    } else if (key) {
      setVisiblePlots(prev => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`https://enterococcus.today/waf/TX/others/eCount_stat_app/${siteId}.csv?ts=${new Date().getTime()}`);
      const parseDate = d3.timeParse("%Y-%m-%d");
      const parsedData = d3.csvParse(response.data, (row) => {
        const newRow = { date: parseDate(row.date) };
        Object.keys(row).forEach(key => {
          if (key !== 'date' && row[key] !== '') {
            const value = parseFloat(row[key]);
            if (!isNaN(value)) newRow[key] = value;
          }
        });
        return newRow;
      });

      if (!parsedData.length) return;

      const filteredData = parsedData.filter(d => d.date && Object.keys(d).some(k => k !== 'date' && !isNaN(d[k])));
      const allDates = filteredData.map(d => d.date).filter(Boolean);

      const minDate = d3.min(allDates);
      const maxDate = new Date(d3.max(allDates).getTime());
      setStartDate(minDate);
      setEndDate(maxDate);

      const transformedData = filteredData.reduce((acc, row) => {
        Object.keys(row).forEach(key => {
          if (key !== 'date') {
            if (!acc[key]) acc[key] = [];
            acc[key].push({ date: row.date, value: row[key] });
          }
        });
        return acc;
      }, {});

      const allValues = filteredData.flatMap(row => Object.keys(row).filter(k => k !== 'date').map(k => row[k]));
      const dataMax = Math.max(...allValues);
      setMaxYValue(dataMax > 140 ? 250 : 150);
      setData(transformedData);

      const initialVisibility = {};
      Object.keys(transformedData).forEach((key, index) => {
        initialVisibility[key] = index < 4;
      });
      setVisiblePlots(initialVisibility);

      await AsyncStorage.setItem(`lastFetchDate-${siteId}`, new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };

  useEffect(() => {
    if (siteId) fetchData();
  }, [siteId]);

  if (!startDate || !endDate || Object.keys(data).length === 0) {
    return <Text style={{ padding: 20 }}>Loading graph data...</Text>;
  }

  const xScale = (date) => {
    const d = new Date(date);
    return (d - new Date(startDate)) / (new Date(endDate) - new Date(startDate)) * (screenWidth - chartPadding.left - chartPadding.right) + chartPadding.left;
  };
  const yScale = (value) => {
    return screenHeight - chartPadding.bottom - ((value / (maxYValue + 10)) * (screenHeight - chartPadding.top - chartPadding.bottom));
  };
  const createAreaPath = (data) => {
    if (!data || data.length === 0) return '';
    
    let path = `M ${xScale(data[0].date)} ${yScale(data[0].y)} `;
    
    // Add points for the top line
    for (let i = 1; i < data.length; i++) {
      path += `L ${xScale(data[i].date)} ${yScale(data[i].y)} `;
    }
    
    // From the last point to the bottom
    path += `L ${xScale(data[data.length - 1].date)} ${yScale(data[data.length - 1].y0)} `;
    
    // Add points for the bottom line in reverse
    for (let i = data.length - 2; i >= 0; i--) {
      path += `L ${xScale(data[i].date)} ${yScale(data[i].y0)} `;
    }
    
    // Close the path
    path += 'Z';
    
    return path;
  };
  const createLinePath = (dataPoints) => {
    if (!dataPoints.length) return '';
    return dataPoints.reduce((path, point, i) => {
      return path + `${i === 0 ? 'M' : 'L'} ${xScale(point.date)} ${yScale(point.value)} `;
    }, '');
  };
  const handleTooltipPress = (e) => {
    if (!startDate || !endDate || Object.keys(data).length === 0) return;
  
    const touchX = e.nativeEvent.locationX;
    const pageX = e.nativeEvent.pageX;
    const pageY = e.nativeEvent.pageY;
  
    const domainSpan = new Date(endDate) - new Date(startDate);
    const graphWidth = screenWidth - chartPadding.left - chartPadding.right;
    const xFraction = Math.min(Math.max((touchX - chartPadding.left) / graphWidth, 0), 1);
    const estimatedDate = new Date(new Date(startDate).getTime() + xFraction * domainSpan);
  
    const dateSet = new Set();
    Object.entries(data).forEach(([key, series]) => {
      if (visiblePlots[key]) {
        series.forEach(item => {
          if (item?.date) dateSet.add(new Date(item.date).toISOString());
        });
      }
    });
    const dates = Array.from(dateSet).map(d => new Date(d)).sort((a, b) => a - b);
  
    let closestIndex = 0;
    let smallestDiff = Infinity;
    dates.forEach((d, i) => {
      const diff = Math.abs(d - estimatedDate);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = i;
      }
    });
  
    const values = Object.entries(data)
      .filter(([key]) =>
        visiblePlots[key] &&
        key !== 'Probality_Space_high' &&
        key !== 'Probality_Space_low'
      )
      .map(([key, series]) => {
        if (!series?.length) return null;
        const closest = series.reduce((acc, point) => {
          const diff = Math.abs(new Date(point.date) - estimatedDate);
          return diff < acc.diff ? { ...point, diff, originalDate: point.date } : acc;
        }, { value: null, diff: Infinity, originalDate: null });
  
        const maxAllowedDiff = 1000 * 60 * 60 * 12; // 12 hours
        if (closest.value === null || isNaN(closest.value) || closest.diff > maxAllowedDiff) return null;
  
        return {
          name: key,
          value: closest.value.toFixed(2),
        };
      })
      .filter(item => item !== null);
  
    const dateStr = formatDateFull(dates[closestIndex] ?? new Date());
    setTooltipData({ date: dateStr, values });
    setTooltipPos({ x: pageX, y: pageY });
    
  };

  let areaPlotData = [];
  if (visiblePlots['Probality_Space_high'] && visiblePlots['Probality_Space_low'] && data['Probality_Space_high'] && data['Probality_Space_low']) {
    areaPlotData = data['Probality_Space_high'].map((high, index) => {
      const low = data['Probality_Space_low'][index];
      return { date: high.date, y: high.value, y0: low.value };
    });
  }
  
  
  let tickValues = [];
  if (startDate && endDate) {
    const current = new Date(startDate);
    const endLimit = new Date(endDate);
  
    // Optional: Extend to end of next month
    // endLimit = new Date(endLimit.getFullYear(), endLimit.getMonth() + 2, 0);
  
    while (current <= endLimit) {
      tickValues.push(new Date(current));
      current.setDate(current.getDate() + 7); // move forward by 7 days
    }
  }
  
  return (
      <View style={{ flex: 1, position: 'relative', backgroundColor: '#f4f4f4' }}>
        <View style={styles.legendToggleButton}>
          <TouchableOpacity onPress={toggleDropdown}>
            <Image source={configIcon} style={{ width: 25, height: 25, resizeMode: 'contain' }} />
          </TouchableOpacity>
        </View>

        

        {dropdownVisible && (
          <Modal transparent={true} animationType="fade" visible={dropdownVisible} onRequestClose={() => setDropdownVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
              <View style={styles.dropdownOverlay}>
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      (visiblePlots['Probality_Space_high'] && visiblePlots['Probality_Space_low'] && visiblePlots['Probality_Space']) ? styles.dropdownItemSelected : null,
                    ]}
                    onPress={() => handlePlotToggle(null, true)}
                  >
                    <Text style={styles.dropdownItemText}>Probality Space</Text>
                  </TouchableOpacity>
                  {Object.keys(data).filter(key => !['Probality_Space_high', 'Probality_Space_low', 'Probality_Space'].includes(key)).map(key => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.dropdownItem, visiblePlots[key] ? styles.dropdownItemSelected : null]}
                      onPress={() => handlePlotToggle(key)}
                    >
                      <Text style={styles.dropdownItemText}>{key}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

        <ScrollView horizontal style={styles.container} contentContainerStyle={styles.contentContainer}>
          {Object.keys(data).length > 0 && (
            <PinchGestureHandler onGestureEvent={pinchHandler}>
              <Animated.View style={[{ width: screenWidth, height: screenHeight }, animatedStyle]}>
                <Svg width={screenWidth} height={screenHeight}   onTouchStart={handleTooltipPress} onTouchEnd={() => { setTimeout(() => setTooltipData(null), 800);}}>

                  {/* Background Ranges */}
                  <Rect x={xScale(startDate)} y={yScale(104)} width={xScale(endDate) - xScale(startDate)} height={yScale(35) - yScale(104)} fill="#FFFFE5" />
                  <Rect x={xScale(startDate)} y={yScale(35)} width={xScale(endDate) - xScale(startDate)} height={yScale(0) - yScale(35)} fill="#E5FFE5" />
                  <Rect x={xScale(startDate)} y={yScale(300)} width={xScale(endDate) - xScale(startDate)} height={yScale(104) - yScale(300)} fill="#FFE5E5" />

                  {/* Gridlines and Axes */}
                  {/* X Axis */}
                  <Line x1={chartPadding.left} y1={screenHeight - chartPadding.bottom} x2={screenWidth - chartPadding.right} y2={screenHeight - chartPadding.bottom} stroke="black" strokeWidth={1} />
                  {/* Y Axis */}
                  <Line x1={chartPadding.left} y1={chartPadding.top} x2={chartPadding.left} y2={screenHeight - chartPadding.bottom} stroke="black" strokeWidth={1} />

                  {/* X Axis Ticks */}
                  {tickValues.map((tick, index) => (
                    <G key={`tick-x-${index}`}>
                      <Line x1={xScale(tick)} y1={chartPadding.top} x2={xScale(tick)} y2={screenHeight - chartPadding.bottom} stroke="#ddd" />
                      <SvgText x={xScale(tick)} y={screenHeight - chartPadding.bottom + 20} textAnchor="middle" fontSize={12}>{formatDate(tick)}</SvgText>
                    </G>
                  ))}

                  {/* Y Axis Ticks */}
                  {Array.from({ length: 6 }, (_, i) => i * (maxYValue / 5)).map((tick, index) => (
                    <G key={`tick-y-${index}`}>
                      <Line x1={chartPadding.left} y1={yScale(tick)} x2={screenWidth - chartPadding.right} y2={yScale(tick)} stroke="#ddd" />
                      <SvgText x={chartPadding.left - 10} y={yScale(tick) + 4} textAnchor="end" fontSize={12}>{tick}</SvgText>
                    </G>
                  ))}

                  {/* Axis Labels */}
                  <SvgText x={screenWidth / 2} y={screenHeight - 10} textAnchor="middle" fontSize={14} fontWeight="bold">Date</SvgText>
                  <SvgText x={-screenHeight / 2} y={20} textAnchor="middle" fontSize={14} fontWeight="bold" rotation={-90}>Highest Count (cfu/100 ml)</SvgText>

                  {/* Area Plot */}
                  {areaPlotData?.length > 0 && (
                    <Path d={createAreaPath(areaPlotData)} fill="#ECD0B7" opacity={0.8} />
                  )}

                  {/* Plot Lines */}
                  {Object.keys(data).map((key, index) => {
                    if (!visiblePlots[key] || !data[key]?.length) return null;
                    if (['Probality_Space_high', 'Probality_Space_low'].includes(key)) return null;

                    const color = colors[index % colors.length];
                    return (
                      <Path key={key} d={createLinePath(data[key])} stroke={color} strokeWidth={2} fill="none" />
                    );
                  })}

                  {/* Vertical Today Markers */}
                  <Line x1={xScale(earlierTodayFormatted)} y1={chartPadding.top} x2={xScale(earlierTodayFormatted)} y2={screenHeight - chartPadding.bottom} stroke="black" strokeWidth={1} />
                  <Line x1={xScale(laterTodayFormatted)} y1={chartPadding.top} x2={xScale(laterTodayFormatted)} y2={screenHeight - chartPadding.bottom} stroke="black" strokeWidth={1} />
                </Svg>
              </Animated.View>
            </PinchGestureHandler>
          )}
        </ScrollView>

        {/* Tooltip */}
        {tooltipData && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 10,
              right: 50,
              backgroundColor: 'white',
              borderColor: '#999',
              borderWidth: 1,
              padding: 10,
              borderRadius: 6,
              zIndex: 9999,
              elevation: 20,
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>Date: {tooltipData.date}</Text>
            {tooltipData.values.map((item, idx) => (
              <Text key={idx}>{item.name}: {item.value}</Text>
            ))}
          </View>
        )}
      </View>

  );
};

export default GraphView;