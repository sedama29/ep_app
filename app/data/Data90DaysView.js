import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import axios from 'axios';
import Papa from 'papaparse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../style/style_home'; // Adjust the path as needed

const Data90DaysView = ({ siteId }) => {
    const [data, setData] = useState([]);

    const handleLinkPress = () => {
        Linking.openURL('https://enterococcus.today/home.php');
    };

    const storeData = async (data) => {
        try {
            const jsonData = JSON.stringify(data);
            await AsyncStorage.setItem(`data-${siteId}`, jsonData);
        } catch (error) {
            console.error('Error storing data:', error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`https://enterococcus.today/waf/TX/others/data_90_days/${siteId}.csv`);
    
            Papa.parse(response.data, {
                header: true,
                complete: async (results) => {
                    if (results.data.length > 0) {
                        setData(results.data);
                        storeData(results.data);
                        // Update last fetch date after successful data fetch
                        const today = new Date().toISOString().split('T')[0];
                        await AsyncStorage.setItem(`lastFetchDate-${siteId}`, today);
                    } else {
                        // If fetched data is empty, use stored data
                        const storedData = await AsyncStorage.getItem(`data-${siteId}`);
                        if (storedData) {
                            setData(JSON.parse(storedData));
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching CSV data:', error);
            // If there's an error in fetching, use stored data
            const storedData = await AsyncStorage.getItem(`data-${siteId}`);
            if (storedData) {
                setData(JSON.parse(storedData));
            }
        }
    };

    const checkAndFetchData = async () => {
        const lastFetchKey = `lastFetchDate-${siteId}`;
        const lastFetchDate = await AsyncStorage.getItem(lastFetchKey);
        const today = new Date().toISOString().split('T')[0];
    
        if (!lastFetchDate || lastFetchDate !== today) {
            await fetchData();
        } else {
            // Use stored data if it's not time to fetch new data
            const storedData = await AsyncStorage.getItem(`data-${siteId}`);
            if (storedData) {
                setData(JSON.parse(storedData));
            }
        }
    };
    
    useEffect(() => {
        if (siteId) {
            checkAndFetchData();
        }
    }, [siteId]);


    const getColorForLevel = (level) => {
        switch (level) {
            case 'Low':
                return 'green';
            case 'Medium':
                return 'orange';
            case 'High':
                return 'red';
            default:
                return 'black'; // Default color
        }
    };

    return (
        <View>
            <Text style={{ fontWeight: 'bold', fontSize: 11 }}>Last 90 days </Text>
            <Text style={styles.descriptionText}>
                For more detailed information and to download the data, visit {' '}
                <Text style={styles.linkText} onPress={handleLinkPress}>
                    https://enterococcus.today/home.php.
                </Text>
            </Text>
            <View style={styles.tableHeader}>
                <Text style={[styles.headerText, styles.column]}>Date</Text>
                <Text style={[styles.headerText, styles.column]}>Time</Text>
                <Text style={[styles.headerText, styles.column]}>Count</Text>
                <Text style={[styles.headerText, styles.column]}>Level</Text>
            </View>
            <ScrollView>
                {data.map((row, index) => (
                    <View key={index} style={styles.dataRow}>
                        <Text style={styles.column}>{row.Date}</Text>
                        <Text style={styles.column}>{row.Time}</Text>
                        <Text style={styles.column}>{row.Count}</Text>
                        <Text style={[styles.column, { color: getColorForLevel(row.Level) }]}>
                            {row.Level}
                        </Text>                    
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default Data90DaysView;
