import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, SafeAreaView, Alert, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../firebase/config';
import * as FileSystem from 'expo-file-system';

const UploadMediaFile = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadMedia = async () => {
    setUploading(true);

    try {
      const { uri } = await FileSystem.getInfoAsync(image);
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.error(e);
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const filename = image.substring(image.lastIndexOf('/') + 1);
      const ref = firebase.storage().ref().child(filename);

      await ref.put(blob);
      blob.close();

      const url = await ref.getDownloadURL(); // Get the download URL
      setDownloadURL(url);
      Alert.alert('Uploaded successfully');

      setImage(null);
    } catch (e) {
      console.error(e);
      Alert.alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.selectButtonText} onPress={pickImage}>
          <Text>Pick Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectButtonText}
          onPress={uploadMedia}
          disabled={!image || uploading}
        >
          <Text>{uploading ? 'Uploading...' : 'Upload'}</Text>
        </TouchableOpacity>
      </View>
      {downloadURL && (
        <View style={styles.downloadContainer}>
          <Text>Download URL:</Text>
          <Text style={styles.downloadURL}>{downloadURL}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default UploadMediaFile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
  },
  selectButtonText: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignItems: 'center',
  },
  imageContainer: {
    marginTop: 30,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  downloadContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  downloadURL: {
    color: '#007aff',
    marginTop: 5,
    textAlign: 'center',
  },
});
