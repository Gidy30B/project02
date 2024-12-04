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
import useFetchClinics from '../../hooks/useFetchClinics';

SplashScreen.preventAutoHideAsync();

const Clinics = ({ searchQuery, onViewAll }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { clinics, getClinicImages } = useFetchClinics();

  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_300Light,
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const filteredClinicList = useSelector(selectClinics);
  const loading = useSelector((state) => state.clinics.loading);
  const error = useSelector((state) => state.clinics.error);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    console.log("Initial Fetch of Clinics");
    if (filteredClinicList.length === 0) {
      dispatch(fetchClinics());
    }
  }, [dispatch, filteredClinicList.length]);

  useEffect(() => {
    console.log("Search Query Updated:", searchQuery);
    if (searchQuery) {
      dispatch(filterClinics({ searchQuery }));
    }
  }, [searchQuery, dispatch]);

  useEffect(() => {
    console.log("Filtered Clinic List:", filteredClinicList);
    if (!loading && filteredClinicList.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, filteredClinicList]);

  const handlePress = (item) => {
    const professionalImages = item.professionals.flatMap(
      (professional) => professional.clinic_images || []
    );
    const allImages = [
      ...new Set([
        ...(item.images || []),
        ...professionalImages.map((image) => image.urls?.[0]),
      ]),
    ];

    console.log("Navigating to clinic with images:", allImages);
    dispatch(setSelectedClinic({ ...item, images: allImages }));

    router.push({
      pathname: `/hospital/book-appointment/${item._id}`,
    });
  };

  const ClinicItem = ({ item }) => {
    const [currentImage, setCurrentImage] = useState(null);
    const imageFadeAnim = useRef(new Animated.Value(1)).current;
    const clinicImages = useSelector(
      (state) => (state.clinics.clinicImages || {})[item._id] || []
    );

    useEffect(() => {
      const fetchImages = async () => {
        try {
          if (!item || !item._id) {
            console.error('Item or item._id is missing');
            return;
          }
    
          console.log("Fetching images for clinic:", item._id);
    
          // Check if clinicImages[item._id] exists before accessing it
          if (!clinicImages[item._id] || clinicImages[item._id].length === 0) {
            const images = await getClinicImages(item);
            console.log("Fetched Images:", images);
            setCurrentImage(images[0]);
          } else {
            // Ensure that clinicImages[item._id] is defined
            const images = clinicImages[item._id] || [];
            setCurrentImage(images[0] || null); // Fallback to null if no images
          }
    
          // Continue with the rest of your logic
          if (clinicImages[item._id]?.length > 1) {
            let imageIndex = 0;
            const interval = setInterval(() => {
              imageIndex = (imageIndex + 1) % clinicImages[item._id].length;
    
              Animated.timing(imageFadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                setCurrentImage(clinicImages[item._id][imageIndex]);
                Animated.timing(imageFadeAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              });
            }, 10000);
    
            return () => clearInterval(interval);
          }
        } catch (error) {
          console.error("Error fetching images:", error);
        }
      };
    
      fetchImages();
    }, [getClinicImages, item, clinicImages, imageFadeAnim]);
    
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
        data={filteredClinicList}
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
