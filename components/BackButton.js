import React from "react";
import { TouchableOpacity, Image, StyleSheet, View } from "react-native";
import { StatusBar } from 'expo-status-bar';

export default function BackButton({ goBack }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity onPress={goBack} style={styles.button}>
        <Image
          style={styles.image}
          source={require("../assets/items/back.png")}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    left: 4,
  },
  button: {
    // ...existing code...
    
  },
  image: {
    width: 24,
    height: 24,
  },
});