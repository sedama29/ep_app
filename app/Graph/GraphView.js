import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import axios from 'axios';
import * as d3 from 'd3';
import { styles } from '../style/style_graph_view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomZoomBackgroundContainer from './CustomZoomBackgroundContainer';
import { Svg, Line, Path, G, Text as SvgText, Rect, Circle } from 'react-native-svg';

const chartPadding = { top: 10, bottom: 50, left: 50, right: 50 };
const configIcon = require('../../assets/images/map_images/configuration_icon.jpg');

const GraphView = ({ siteId }) => {
  const [data, setData] = useState({});
  const [visiblePlots, setVisiblePlots] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [maxYValue, setMaxYValue] = useState(0);

  const screenWidth = 500;
  const screenHeight = 400;
  const today = new Date();
  const fiveHoursInMs = 7 * 60 * 60 * 1000; // milliseconds in 7 hours
  const earlierToday = new Date(today - fiveHoursInMs);
  const laterToday = new Date(today.getTime() + fiveHoursInMs);

  const formatDate_2 = d3.timeFormat("%Y-%m-%d %H:%M:%S");
  const earlierTodayFormatted = formatDate_2(earlierToday);
  const laterTodayFormatted = formatDate_2(laterToday);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 }); // NEW
  useEffect(() => {
  }, [tooltipData]);
  
  useEffect(() => {
  }, [tooltipPos]);
  
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handlePlotToggle = (key, group = false) => {
    if (group) {
      // Toggle visibility for the group of Probability Space plots
      const isVisible = !(visiblePlots['Probability_Space_high'] && visiblePlots['Probability_Space_low'] && visiblePlots['Probability_Space']);
      setVisiblePlots(prevState => ({
        ...prevState,
        'Probability_Space_high': isVisible,
        'Probability_Space_low': isVisible,
        'Probability_Space': isVisible,
      }));
    } else {
      // Toggle visibility for individual plots
      setVisiblePlots(prevState => ({
        ...prevState,
        [key]: !prevState[key],
      }));
    }
  };

  useEffect(() => {
    if (!siteId) return;
  
    fetchData(); // initial fetch
  
    const interval = setInterval(() => {
      fetchData(); // re-fetch every 30 minutes
    }, 30 * 60 * 1000); // every 30 minutes
  
    return () => clearInterval(interval);
  }, [siteId]);
  
  
  const handleZoom = (domain) => {
    if (domain.x) {
      // Check if domain.x is within the data range
      const [minDate, maxDate] = [startDate, endDate]; // Your data's start and end dates
      if (domain.x[0] >= minDate && domain.x[1] <= maxDate) {
        setXDomain(domain.x);
      }
    }
  };

  const fetchData = async () => {
    if (siteId) {
      try {
        const response = await axios.get(`https://enterococcus.today/waf/TX/others/eCount_stat_app/${siteId}.csv?ts=${new Date().getTime()}`);
        console.log(response)

        // Parse the CSV data
        const parseDate = d3.timeParse("%Y-%m-%d");
        const parsedData = d3.csvParse(response.data, (row) => {
          const newRow = { date: parseDate(row.date) };
          Object.keys(row).forEach(key => {
            if (key !== 'date' && row[key] !== '') {
              const value = parseFloat(row[key]);
              if (!isNaN(value)) {
                newRow[key] = value;
              }
            }
          });
          return newRow;
        });

        const filteredData = parsedData.filter(d =>
          d.date &&
          Object.keys(d)
            .filter(k => k !== 'date')
            .some(k => !isNaN(d[k])) // ✅ at least one usable value in the row
        );
        console.log('Parsed rows:', parsedData.length, '→ Filtered:', filteredData.length);

        const minDate = d3.min(filteredData, d => d.date);
        let maxDate = d3.max(filteredData, d => d.date);
        maxDate = new Date(maxDate.getTime() + 2 * 24 * 60 * 60 * 1000); // add 2 days padding
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

        const allValues = filteredData.flatMap(row =>
          Object.keys(row).filter(key => key !== 'date').map(key => row[key])
        );
        const dataMax = Math.max(...allValues);
        const maxValue = dataMax > 140 ? 250 : 150;
        setMaxYValue(maxValue);
        

        setData(transformedData);

        const initialVisibility = {};
        Object.keys(transformedData).forEach((key, index) => {
          initialVisibility[key] = index < 4; // Adjust as needed
        });
        setVisiblePlots(initialVisibility);

        // Update the last fetched date in AsyncStorage
        const today = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem(`lastFetchDate-${siteId}`, today);

      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    }
  };

  useEffect(() => {
    const checkDataAndUpdate = async () => {
      const lastFetchKey = `lastFetchDate-${siteId}`;
      const lastFetchDate = await AsyncStorage.getItem(lastFetchKey);
      const today = new Date().toISOString().split('T')[0];
      await fetchData();
      await AsyncStorage.setItem(lastFetchKey, today);
    };
  
    if (siteId) {
      checkDataAndUpdate();
    }
  }, [siteId]);
  
  const formatDate = d3.timeFormat("%d %b");
  
  // Generate areaPlotData conditionally based on the visibility of the grouped plots
  let areaPlotData = [];
  if (visiblePlots['Probality_Space_high'] && visiblePlots['Probality_Space_low'] && data['Probality_Space_high'] && data['Probality_Space_low']) {
    areaPlotData = data['Probality_Space_high'].map((high, index) => {
      const low = data['Probality_Space_low'][index];
      return { date: high.date, y: high.value, y0: low.value };
    });
  }
  
  // Calculate tick values
  let tickValues = [];
  if (Object.keys(data).length > 0) {
    // Calculate the maximum date across all sites
    const allDates = Object.values(data).flatMap(dataset => dataset.map(d => new Date(d.date)));
    const minDate = d3.min(allDates);
    const maxDate = d3.max(allDates);
  
    // Calculate tick values for each week from the current minimum date until the end of the next month of the maximum date
    tickValues = [new Date(minDate)];
    
    // Calculate the last day of the next month of the maximum date
    const lastDayOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);
  
    // Add extra tick values with a gap of one week until the end of the next month
    while (tickValues[tickValues.length - 1] <= lastDayOfMonth) {
      tickValues.push(new Date(tickValues[tickValues.length - 1].getTime() + 7 * 24 * 60 * 60 * 1000));
    }
  }
  
  // Scale functions
  const xScale = (date) => {
    const dateObj = new Date(date);
    return (dateObj - new Date(startDate)) / (new Date(endDate) - new Date(startDate)) * (screenWidth - chartPadding.left - chartPadding.right) + chartPadding.left;
  };
  
  const yScale = (value) => {
    return screenHeight - chartPadding.bottom - ((value / (maxYValue + 10)) * (screenHeight - chartPadding.top - chartPadding.bottom));
  };
  
  // Function to create path for area
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
  
  // Function to create line paths
  const createLinePath = (dataPoints) => {
    if (!dataPoints || dataPoints.length === 0) return '';
    
    let path = `M ${xScale(dataPoints[0].date)} ${yScale(dataPoints[0].value)} `;
    
    for (let i = 1; i < dataPoints.length; i++) {
      path += `L ${xScale(dataPoints[i].date)} ${yScale(dataPoints[i].value)} `;
    }
    
    return path;
  };
  
  // Create array of colors for the lines
const colors = [
  '#0B6623', // dark green
  '#FF5733', // orange-red
  '#D7AC00', // mustard
  '#FF6600', // orange
  '#FFC928', // yellow
  '#FF2868', // pink-red
  '#EE4B2B', // vibrant red
  '#300000', // dark maroon
  '#E67E22'  // pumpkin
];
  
  // Function to handle zoom
  const handleSvgZoom = (event) => {
    // Implement zoom functionality here if needed
    // You might need to use PanResponder or Gesture handlers
    console.log("Zoom event received");
    
  };
  
  return (
    <View style={{ flex: 1, position: 'relative' }}>
    <ScrollView horizontal style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.legendToggleButton}>
        <TouchableOpacity onPress={toggleDropdown}>
          <Image
            source={configIcon}
            style={{
              width: 25,
              height: 25,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
  
        {dropdownVisible && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={dropdownVisible}
            onRequestClose={() => setDropdownVisible(false)}
          >
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
                      style={[
                        styles.dropdownItem,
                        visiblePlots[key] ? styles.dropdownItemSelected : null,
                      ]}
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
      </View>
  
      {Object.keys(data).length > 0 && (
        <CustomZoomBackgroundContainer
          width={400}
          height={500}
          yScale={yScale} // ✅ Add this!
          onZoom={handleSvgZoom}
        >


        <Svg style={{ position: 'absolute', top: 0, left: 0 }}>
          <Rect
            x={chartPadding.left}
            y={yScale(104)}
            width={screenWidth - chartPadding.left - chartPadding.right}
            height={yScale(35) - yScale(104)}
            fill="#FFFFE5" // yellow zone
          />
          <Rect
            x={chartPadding.left}
            y={yScale(35)}
            width={screenWidth - chartPadding.left - chartPadding.right}
            height={yScale(0) - yScale(35)}
            fill="#E5FFE5" // green zone
          />
          <Rect
            x={chartPadding.left}
            y={yScale(300)} // high limit (adjust as needed)
            width={screenWidth - chartPadding.left - chartPadding.right}
            height={yScale(104) - yScale(300)}
            fill="#FFE5E5" // red zone
          />
        </Svg>
        <Svg
          width={screenWidth}
          height={screenHeight}
          onPress={(e) => {
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
                  if (item?.date) dateSet.add(item.date.toISOString()); // store as ISO string for consistency
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
              
                // ✅ Only allow if the closest value is on the *same* date (or within 12 hours tolerance)
                const maxAllowedDiff = 1000 * 60 * 60 * 12; // 12 hours in milliseconds
                if (closest.value === null || isNaN(closest.value) || closest.diff > maxAllowedDiff) return null;
              
                return {
                  name: key,
                  value: closest.value.toFixed(2),
                };
              })
              
              .filter(item => item !== null); // ✅ Remove nulls entirely
          
            const dateStr = dates[closestIndex]?.toLocaleDateString() ?? '';
          
            // ✅ Always reset the state cleanly with only fresh values
            setTooltipData({ date: dateStr, values });
            setTooltipPos({ x: pageX, y: pageY });

          }}
          
          
          
          // onTouchEnd={() => setTooltipData(null)}
        >


          
          {/* X-Axis */}
          <Line 
            x1={chartPadding.left} 
            y1={screenHeight - chartPadding.bottom} 
            x2={screenWidth - chartPadding.right} 
            y2={screenHeight - chartPadding.bottom} 
            stroke="black" 
            strokeWidth={1} 
          />
          
          {/* Y-Axis */}
          <Line 
            x1={chartPadding.left} 
            y1={chartPadding.top} 
            x2={chartPadding.left} 
            y2={screenHeight - chartPadding.bottom} 
            stroke="black" 
            strokeWidth={1} 
          />
          
          {/* X-Axis Ticks and Labels */}
          {tickValues.map((tick, index) => (
            <G key={`x-tick-${index}`}>
              {/* Full vertical grid line */}
              <Line 
                x1={xScale(tick)} 
                y1={chartPadding.top}
                x2={xScale(tick)} 
                y2={screenHeight - chartPadding.bottom}
                stroke="#ddd" 
                strokeWidth={1}
              />

              {/* X-axis tick label */}
              <SvgText 
                x={xScale(tick)} 
                y={screenHeight - chartPadding.bottom + 20} 
                textAnchor="middle" 
                fontSize={12}
                fill="black"
              >
                {formatDate(tick)}
              </SvgText>
            </G>
          ))}

          
          {/* Y-Axis Ticks and Labels */}
          {Array.from({ length: 6 }, (_, i) => i * (maxYValue / 5)).map((tick, index) => (
            <G key={`grid-y-${index}`}>
              {/* Full horizontal grid line */}
              <Line 
                x1={chartPadding.left}
                y1={yScale(tick)}
                x2={screenWidth - chartPadding.right}
                y2={yScale(tick)}
                stroke="#ddd"
                strokeWidth={1}
                // strokeDasharray="4,2" // Dashed style
              />

              {/* Y-axis tick label */}
              <SvgText 
                x={chartPadding.left - 10}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize={12}
                fill="black"
              >
                {tick}
              </SvgText>
            </G>
          ))}

          
          {/* X-Axis Label */}
          <SvgText 
            x={screenWidth / 2} 
            y={screenHeight - 10} 
            textAnchor="middle" 
            fontSize={14} 
            fontWeight="bold"
          >
            Date
          </SvgText>
          
          {/* Y-Axis Label */}
          <SvgText 
            x={-screenHeight / 2} 
            y={20} 
            textAnchor="middle" 
            fontSize={14} 
            fontWeight="bold" 
            rotation={-90} 
            originX={0} 
            originY={0}
          >
            Highest Count (cfu/100 ml)
          </SvgText>
          
          {/* Area Plot */}
          {areaPlotData.length > 0 && (
            <Path 
              d={createAreaPath(areaPlotData)} 
              fill="#ECD0B7" 
              opacity={0.8} 
            />
          )}
          
          {/* Vertical today lines */}
          <Line 
            x1={xScale(earlierTodayFormatted)} 
            y1={chartPadding.top} 
            x2={xScale(earlierTodayFormatted)} 
            y2={screenHeight - chartPadding.bottom} 
            stroke="black" 
            strokeWidth={1} 
          />
          
          <Line 
            x1={xScale(laterTodayFormatted)} 
            y1={chartPadding.top} 
            x2={xScale(laterTodayFormatted)} 
            y2={screenHeight - chartPadding.bottom} 
            stroke="black" 
            strokeWidth={1} 
          />
          
          {/* Plot Lines */}
          {Object.keys(data).map((key, index) => {
            if (!visiblePlots[key] || !data[key] || data[key].length === 0) return null;
            
            // Skip rendering certain lines that should be hidden
            if (key === 'Probality_Space_high' || key === 'Probality_Space_low') {
              return null;
            }
            
            const color = colors[index % colors.length];
            const isDashed = key === 'Probality_Space';
            
            return (
              <Path 
                key={key} 
                d={createLinePath(data[key])} 
                stroke={color} 
                strokeWidth={2} 
                fill="none" 
                strokeDasharray={isDashed ? "0,0" : "0"} 
              />
            );
          })}
          

        </Svg>
        </CustomZoomBackgroundContainer>
      )}
    </ScrollView>

      {tooltipData && (
      <View
        pointerEvents="none" // 👈 ensures it doesn't interfere with touch
        style={{
          position: 'absolute',
          top: 10,
          right:50,
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
        <Text style={{ fontWeight: 'bold' }}>
          Date: {tooltipData.date}
        </Text>
        {tooltipData.values.map((item, idx) => (
          <Text key={idx}>{item.name}: {item.value}</Text>
        ))}
      </View>
    )}

    </View>
  );
};

export default GraphView;
