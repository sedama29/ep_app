import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import axios from 'axios';
import * as d3 from 'd3';
import { styles } from '../style/style_graph_view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomZoomBackgroundContainer from './CustomZoomBackgroundContainer';
import { Svg, Line, Path, G, Text as SvgText } from 'react-native-svg';

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
        const response = await axios.get(`https://enterococcus.today/waf/TX/others/eCount_stat_app/${siteId}.csv`);

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

        const filteredData = parsedData.filter(d => d.date && Object.keys(d).every(k => !isNaN(d[k])));

        const minDate = d3.min(filteredData, d => d.date);
        const maxDate = d3.max(filteredData, d => d.date);
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

        const maxValue = 100;
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
      await fetchData();
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(lastFetchKey, today);
    };

    if (siteId) {
      checkDataAndUpdate();
    }
  }, [siteId]);

  const xScale = (date) => (new Date(date) - new Date(startDate)) / (new Date(endDate) - new Date(startDate)) * screenWidth;
  const yScale = (value) => screenHeight - (value / maxYValue * screenHeight);

  const formatDate = d3.timeFormat("%d %b");

  // Generate areaPlotData conditionally based on the visibility of the grouped plots
  let areaPlotData = [];
  if (visiblePlots['Probability_Space_high'] && visiblePlots['Probability_Space_low'] && data['Probability_Space_high'] && data['Probability_Space_low']) {
    areaPlotData = data['Probability_Space_high'].map((high, index) => {
      const low = data['Probability_Space_low'][index];
      return { date: high.date, y: high.value, y0: low.value };
    });
  }

  let tickValues = [];
  if (Object.keys(data).length > 0) {
    // Calculate the maximum date across all sites
    const allDates = Object.values(data).flatMap(dataset => dataset.map(d => d.date));
    const maxDate = d3.max(allDates);

    // Calculate tick values for each week from the current minimum date until the end of the next month of the maximum date
    tickValues = [new Date(d3.min(allDates))];

    // Calculate the last day of the next month of the maximum date
    const lastDayOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);

    // Add extra tick values with a gap of one week until the end of the next month
    while (tickValues[tickValues.length - 1] <= lastDayOfMonth) {
      tickValues.push(new Date(tickValues[tickValues.length - 1].getTime() + 7 * 24 * 60 * 60 * 1000));
    }
  }

  return (
    <ScrollView horizontal style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.legendToggleButton}>
        <TouchableOpacity onPress={toggleDropdown}>
          <Image
            source={configIcon}
            style={{ width: 25, height: 25, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
        {dropdownVisible && (
          <Modal transparent animationType="fade" visible={dropdownVisible} onRequestClose={() => setDropdownVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
              <View style={styles.dropdownOverlay}>
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, (visiblePlots['Probability_Space_high'] && visiblePlots['Probability_Space_low'] && visiblePlots['Probability_Space']) ? styles.dropdownItemSelected : null]}
                    onPress={() => handlePlotToggle(null, true)}
                  >
                    <Text style={styles.dropdownItemText}>Probability Space</Text>
                  </TouchableOpacity>
                  {Object.keys(data).filter(key => !['Probability_Space_high', 'Probability_Space_low', 'Probability_Space'].includes(key)).map(key => (
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
      </View>


      <Svg width={screenWidth} height={screenHeight}>
        {/* X and Y Axes */}
        {tickValues.map((tick, index) => (
          <SvgText key={index} x={xScale(tick)} y={screenHeight + 15} fontSize="12" textAnchor="middle">
            {formatDate(tick)}
          </SvgText>
        ))}
        {/* <CustomZoomBackgroundContainer 
          zoomDimension="x"
          onZoom={handleZoom}
        /> */}

        <SvgText x={screenWidth / 2} y={screenHeight + 40} fontSize="14" fontWeight="bold" textAnchor="middle">
          Date
        </SvgText>

        {/* Y-Axis Label (Rotated) */}
        <SvgText
          x={-screenHeight / 2}
          y={-40}
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          transform="rotate(-90)"
        >
          Highest Count (cfu/100 ml)
        </SvgText>
        
        {/* Area Plot */}
        {/* <Path
          d={`M ${areaPlotData.map(d => `${xScale(d.date)},${yScale(d.y)}`).join(' L ')} L ${xScale(areaPlotData[areaPlotData.length - 1].date)},${screenHeight} L ${xScale(areaPlotData[0].date)},${screenHeight} Z`}
          fill="lightblue"
          opacity={0.5}
        /> */}

        {/* Vertical Lines */}
        <Line x1={xScale(earlierTodayFormatted)} y1={0} x2={xScale(earlierTodayFormatted)} y2={screenHeight} stroke="black" strokeWidth={1} />
        <Line x1={xScale(laterTodayFormatted)} y1={0} x2={xScale(laterTodayFormatted)} y2={screenHeight} stroke="black" strokeWidth={1} />

        {/* Plots */}
        {Object.keys(data).map((key) => (
          visiblePlots[key] && Array.isArray(data[key]) && data[key].length > 0 && (
            <G key={key}>
              {data[key].map((point, index) => {
                const nextPoint = data[key][index + 1];
                return (
                  <Line
                    key={index}
                    x1={xScale(point.date)}
                    y1={yScale(point.value)}
                    x2={nextPoint ? xScale(nextPoint.date) : xScale(point.date)}
                    y2={nextPoint ? yScale(nextPoint.value) : yScale(point.value)}
                    stroke={key.includes('Probability') ? 'green' : 'blue'}
                    strokeWidth={1.5}
                  />
                );
              })}
            </G>
          )
        ))}
      </Svg>
    </ScrollView>
  );
};

export default GraphView;
