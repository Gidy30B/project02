import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClinics,
  filterClinics,
  selectClinics,
  setSelectedClinic,
} from '../../app/store/clinicSlice';
import SubHeading from '../../components/client/SubHeading';
import Colors from '../Shared/Colors';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';
import {
  Poppins_600SemiBold,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_700Bold,
  Poppins_500Medium,
  useFonts,
} from "@expo-google-fonts/poppins";

SplashScreen.preventAutoHideAsync();

const Clinics = ({ searchQuery, onViewAll }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const clinics = useSelector(selectClinics);

  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_300Light,
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const loading = useSelector((state) => state.clinics.loading);
  const error = useSelector((state) => state.clinics.error);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    console.log("Initial Fetch of Clinics");
    if (clinics.length === 0) {
      dispatch(fetchClinics());
    }
  }, [dispatch, clinics.length]);

  useEffect(() => {
    console.log("Search Query Updated:", searchQuery);
    if (searchQuery) {
      dispatch(filterClinics({ searchQuery }));
    } else {
      dispatch(fetchClinics());
    }
  }, [searchQuery, dispatch]);

  useEffect(() => {
    console.log("Filtered Clinic List:", clinics);
    if (!loading && clinics.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, clinics]);

  const handlePress = (item) => {
    console.log("Navigating to clinic with ID:", item._id);
    dispatch(setSelectedClinic(item));

    router.push({
      pathname: `/hospital/book-appointment/${item._id}`,
    });
  };

  const ClinicItem = ({ item }) => {
    const [currentImage, setCurrentImage] = useState(null);
    const imageFadeAnim = useRef(new Animated.Value(1)).current;
    const clinicImages = item.clinicImages || []; // Use clinicImages instead of images

    useEffect(() => {
      if (clinicImages.length > 0) {
        setCurrentImage(clinicImages[0]);

        if (clinicImages.length > 1) {
          let imageIndex = 0;
          const interval = setInterval(() => {
            imageIndex = (imageIndex + 1) % clinicImages.length;

            Animated.timing(imageFadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setCurrentImage(clinicImages[imageIndex]);
              Animated.timing(imageFadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
            });
          }, 10000);

          return () => clearInterval(interval);
        }
      }
    }, [clinicImages, imageFadeAnim]);

    return (
      <TouchableOpacity style={styles.clinicItem} onPress={() => handlePress(item)}>
        {currentImage ? (
          <Animated.Image
            source={{ uri: currentImage }}
            style={[styles.clinicImage, { opacity: imageFadeAnim }]}
          />
        ) : (
          <Image
            source={{ uri: 'https://via.placeholder.com/200x100?text=No+Image' }}
            style={styles.clinicImage}
          />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.clinicName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.clinicCategory} numberOfLines={1}>
            {item.category}
          </Text>
          <Text style={styles.clinicAddress} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.GRAY} />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <Animated.View style={{ marginTop: 10, opacity: fadeAnim }}>
      <SubHeading subHeadingTitle={'Discover Clinics Near You'} onViewAll={onViewAll} />
      <FlatList
        data={clinics}
        horizontal={true}
        renderItem={({ item }) => <ClinicItem item={item} />}
        keyExtractor={(item) => item._id?.toString() || `temp-${Math.random()}`}
        showsHorizontalScrollIndicator={false}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  clinicItem: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    padding: 10,
    width: 200,
  },
  clinicImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  textContainer: {
    marginTop: 5,
  },
  clinicName: {
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Poppins_700Bold',
  },
  clinicAddress: {
    color: Colors.primary,
    fontFamily: 'Poppins_400Regular',
  },
  clinicCategory: {
    color: Colors.primary,
    marginTop: 5,
    fontFamily: 'Poppins_500Medium',
  },
});

export default Clinics;
