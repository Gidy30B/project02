import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_SECTIONS = ['personalInfo', 'professionalDetails', 'practiceInfo'];

export const getProfileCompletion = async () => {
  try {
    const completedSections = await AsyncStorage.multiGet(PROFILE_SECTIONS);
    const completedCount = completedSections.filter(([key, value]) => value === 'true').length;
    return (completedCount / PROFILE_SECTIONS.length) * 100;
  } catch (error) {
    console.error('Error getting profile completion:', error);
    return 0;
  }
};

export const setProfileSectionComplete = async (section: string) => {
  try {
    await AsyncStorage.setItem(section, 'true');
  } catch (error) {
    console.error('Error setting profile section complete:', error);
  }
};
