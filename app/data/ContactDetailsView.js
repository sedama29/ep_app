import React from 'react';
import { ScrollView, View, Text, Linking } from 'react-native';
import { styles } from '../style/style_contact';

const ContactDetailsView = ({ details }) => {
    if (!details) return <Text style={styles.noDetailsText}>No contact details available.</Text>;

    const displayValueOrNA = (value) => value ? value : 'N/A';

    const renderLink = (url) => {
        return url ? (
            <Text style={styles.linkText} onPress={() => Linking.openURL(url)}>{url}</Text>
        ) : 'N/A';
    };

    return (
        <ScrollView>
            <View>
                <Text style={styles.sectionHeader}>Entity:</Text>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Name:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.l_entity_name)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Address:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.l_entity_address)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Phone:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.l_entity_phone)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>URL:</Text>
                    <Text style={styles.value_contact}>{renderLink(details.l_entity_url)}</Text>
                </View>

                <Text style={styles.sectionHeader}>Government Contact:</Text>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Name:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.l_gov_contact1_name)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Email:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.l_gov_contact1_email)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Address:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.l_gov_contact1_address)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Phone:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.l_gov_contact1_phone)}</Text>
                </View>

                <Text style={styles.sectionHeader}>Laboratory:</Text>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Office:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.lab_office)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Email:</Text>
                    <Text style={styles.value_contact}>{renderLink(details.lab_email)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Address:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.lab_address)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Phone:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.lab_phone)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>URL:</Text>
                    <Text style={styles.value_contact}>{renderLink(details.lab_url)}</Text>
                </View>

                <Text style={styles.sectionHeader}>Project Manager:</Text>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Name:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.pm_name)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Position:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.pm_position)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Division:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.pm_division)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Office:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.pm_office)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Address:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.pm_address)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Phone:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.pm_phone)}</Text>
                </View>
                <View style={styles.row_contact}>
                    <Text style={styles.column_contact}>Email:</Text>
                    <Text style={styles.value_contact}>{displayValueOrNA(details.pm_email)}</Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default ContactDetailsView;