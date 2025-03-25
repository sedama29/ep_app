// TermsAndConditions.js
import React from 'react';
import { SafeAreaView, Text, ScrollView, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function TermsAndConditions() {
    const navigation = useNavigation();

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.text1}>
                General Disclaimer
            </Text>
            <Text style={styles.text2}>
                This web application is intended for general informational purposes only and is provided as a public service for a user's personal use. While the GLO will regularly review, update, and expand this application, information may not be complete or may have been
                modified or changed since the latest update of the application. The enterococcus bacteria levels (fecal bacteria) at sites listed on this website depend upon the season, site conditions, and weather conditions, which change over time and are outside of the control of the GLO.
                GLO does not test for any other bacteria, including the vulnificus bacteria (flesh eating).
                The timeliness of the information on this website depends on the accessibility of the sites tested for bacteria, weather conditions, and other factors and should not be the sole basis for determining the water quality and safety of the water at Texas recreational beaches.
            </Text>
            <Text style={styles.text2}>
                The GLO makes no representations or warranties or conditions of merchantability and fitness for a particular purpose, either express or implied, regarding the accuracy, completeness, currency or suitability of the information or data depicted on this application.
                GLO specifically disclaims any and all responsibility and liability for any claims or damages that may result from the use of information or the inaccessibility of the information on this application.
            </Text>
            <Text style={styles.text1}>
                Disclaimer for Third Party Links
            </Text>
            <Text style={styles.text2}>
                GLO does not endorse, exercise oversight, or assume responsibility or liability for any third-party contributor to this web application or any website that links to or from this web application.
                GLO disclaims any and all liability for any use or inability to access or use websites maintained by third parties that are linked to or from this website. GLO does not endorse the content, viewpoints, or comments posted to this website or linked to other websites
                by users of this web application.
            </Text>
            <Text style={styles.text1}>
                Copyright Disclaimer
            </Text>
            <Text style={styles.text2}>
                Certain content may be owned by the GLO, jointly owned with a third party, or be provided under lease by a third party and may be subject to copyright and other intellectual property rights. GLO does not authorize reproduction,
                distribution, display of, or the creation of derivative works from any part of this web application without approval from the holder of the intellectual property right. You may be liable for any unauthorized copying or disclosure of
                any copyrighted content on this web application. If you believe that any content on this web application has been used in a way that constitutes copyright infringement, or if you have copyright inquiries, please contact beachwatch@glo.texas.gov.
                If you believe that copyright infringement has occurred, provide a name and contact information for the complaint, a written description of the alleged infringement, and materials that show the existence of a copyright.
                If GLO determines that a copyright infringement exists, it will remove the infringing material in accordance with the Millennium Copy Right Act.
            </Text>
            <Text style={styles.text1}>
                Privacy
            </Text>
            <Text style={styles.text2}>
                The Texas General Land Office analyzes server logs for statistical purposes only and makes no attempt to personally identify Web site visitors. Statistics such as time, date, or pages requested are used for assessing the information of most interest to
                users and identifying system performance or problem areas. The GLO Web site does not use "cookies" (small text files created by the web server that reside on the user's hard drive) to track specific information and does not collect information through other
                technological processes. Information collected by electronic mail and by web forms may be subject to the Public Information Act; however, email addresses of those who correspond with the GLO are confidential and may not be disclosed unless the sender agrees to such.
            </Text>
            <SafeAreaView style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
            </SafeAreaView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        padding: 10,
    },
    text1: {
        fontSize: 14,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    text2: {
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',    
        justifyContent: 'center', 
        width: '100%',  
        marginBottom: 10          
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
        marginVertical: 20,
        width:150
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
    },
});