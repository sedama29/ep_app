// dropdownUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const dropdownStateKey = 'dropdownState';

export const resetDropdownState = async () => {
  try {
    await AsyncStorage.setItem(dropdownStateKey, JSON.stringify({ dropdownVisible: false }));
  } catch (error) {
    console.error('Error resetting dropdown state:', error);
  }
};
