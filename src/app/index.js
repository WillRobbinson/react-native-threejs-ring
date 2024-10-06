import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import ThreeScene from '../ThreeScene';

export default function Home() {
  const [showScene, setShowScene] = useState(false);

  return (
    <View style={styles.container}>
      {showScene ? (
        <ThreeScene />
      ) : (
        <Button title="Load 3D Scene" onPress={() => setShowScene(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

