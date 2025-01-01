import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, SafeAreaView, Alert, Image, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import {firebase} from '../../firebase/config'
import * as FileSystem from 'expo-file-system'


const UploadMediaFile = () => {
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })


    console.log(result)

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  }

  // upload media filess
  const uploadMedia = async () => {
    setUploading(true)

    try {
      const {uri} = await FileSystem.getInfoAsync(image);
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response);
        };
        xhr.onerror = function(e) {
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
      setUploading(false);
      Alert.alert('uploaded successfully');
      setImage(null);
    } catch (e) {
      console.error(e)
      setUploading(false)
      Alert.alert('upload failed');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.selectButtonText} onPress={pickImage}>
          <Text>Upload Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.selectButtonText} onPress={uploadMedia}>
          <Text>Upload</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default UploadMediaFile

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
  imageBox: {
    width: 200,
    height: 200,
  },

})