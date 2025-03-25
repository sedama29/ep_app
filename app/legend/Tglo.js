import React, { useEffect } from 'react';
import { Linking } from 'react-native';

export default function Tglo({ navigation }) {
  useEffect(() => {
    const openTgloLink = async () => {
      await Linking.openURL('https://cgis.glo.texas.gov/Beachwatch/');
      navigation.goBack();
    };
    openTgloLink();
  }, [navigation]);

  return null;
}