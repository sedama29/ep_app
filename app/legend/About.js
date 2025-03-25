import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const APP_VERSION = '0.0.1';
const RELEASE_DATE = '2023-11';

export default function TermsAndConditions({ navigation }) {

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.text2}>
            The Enterococcus Predictor (or ep), an AI-enabled system to predict the level or counts of enterococcus
            bacteria for a geographical area, is currently in development. If you are a registered user, please use your Google account to log in. If you are having issues logging in, please contact info@enterococcus.today.
            </Text>
            <Text style={styles.text1}>
                Version: {APP_VERSION}, Release date: {RELEASE_DATE}
            </Text>
            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,       
    },
    text1: {
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'left',
        marginBottom: 5,
        fontStyle: 'italic', 

    },
    text2: {
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'left',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',    
        justifyContent: 'center', 
        width: '100%',            
    },
    button: {
        backgroundColor: 'blue',
        padding: 7,
        borderRadius: 4,
        alignItems: 'center',
        marginVertical: 20,
        width:100,
        height:40
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});