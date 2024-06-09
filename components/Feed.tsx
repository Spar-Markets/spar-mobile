// src/PhotoInputPage.js
import React, {useState} from 'react';
import {View, TextInput, Button, Image, Text, StyleSheet} from 'react-native';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';

const Feed = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<Asset | null>(null);

  const selectPhoto = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0]);
      } else {
        console.log('No photo selected');
      }
    });
  };

  const handleSubmit = () => {
    if (title && description && photo) {
      // Handle the submission logic here
      console.log('Title:', title);
      console.log('Description:', description);
      console.log('Photo:', photo.uri);
      // You can add your API call or any other logic here
    } else {
      alert('Please complete all fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
      />
      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
      />
      <Button title="Select Photo" onPress={selectPhoto} />
      {photo && <Image source={{uri: photo.uri}} style={styles.photo} />}
      <Button
        title="Submit"
        onPress={handleSubmit}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  photo: {
    width: 200,
    height: 200,
    marginTop: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default Feed;
function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
