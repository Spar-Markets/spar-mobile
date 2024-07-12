import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Button,
  Image,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import axios from 'axios';
import {serverUrl} from '../constants/global';
import { useSelector } from 'react-redux';

const Feed = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [photos, setPhotos] = useState([]);

  const selectPhoto = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, response => {
      if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0]);
      } else {
        console.log('No photo selected');
      }
    });
  };

  const handleSubmit = async () => {
    if (title && description && photo) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('photo', {
        uri: photo.uri,
        type: photo.type,
        name: photo.fileName,
      });

      try {
        await axios.post('', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Photo uploaded successfully');
        fetchPhotos();
      } catch (error) {
        alert('Error uploading photo');
      }
    } else {
      alert('Please complete all fields');
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await axios.get(serverUrl + '');
      setPhotos(response.data);
    } catch (error) {
      console.log('Error fetching photos', error);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);


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
      <Button title="Submit" onPress={handleSubmit} />
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
  photoContainer: {
    marginVertical: 16,
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoDescription: {
    fontSize: 14,
    color: 'gray',
  },
  submitButton: {
    marginTop: 16,
  },
});

export default Feed;
function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
