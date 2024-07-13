import React, {useState, useEffect, useCallback} from 'react';
import {
  Pressable,
  Platform,
  Image,
  Button,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  NativeModules,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CircularProgress from 'react-native-circular-progress-indicator';
import {SvgXml} from 'react-native-svg';
import {serverUrl} from '../../constants/global';
import axios from 'axios';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import createProfileStyles from '../../styles/createProfileStyles';
import createGlobalStyles from '../../styles/createGlobalStyles';
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import firebase from '../firebase/firebaseconfig';
import ImagePicker from 'react-native-image-crop-picker';
import useUserDetails from '../../hooks/useUserDetails';
import {storage} from '../../firebase/firebase';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {useDispatch, useSelector} from 'react-redux';
import {setProfileImageUri} from '../../GlobalDataManagment/imageSlice';
import CreateWatchlistButton from '../HomeComponents/CreateWatchlistButton';
import WatchlistButton from '../HomeComponents/WatchlistButton';
import {SegmentedButtons} from 'react-native-paper';

const Profile = ({navigation}: any) => {
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createProfileStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);
  const [image, setImage] = useState<string | null>(null);
  const [watchLists, setWatchLists] = useState<Object[]>([]);
  const [newBioValue, setNewBioVal] = useState<string>("")

  MaterialCommunityIcons.loadFont();
  MaterialIcons.loadFont();

  const {userData} = useUserDetails();

  const [loading, setLoading] = useState(true);


  const handleBioChange = async () => {
    //ensure that the new bio value does not equal params.bioText so that it is a valid change 
    //enable or disable a button based on a boolean variable
  }

  useEffect(() => {
    const getProfileImage = async () => {
      try {
        const profileImagePath = await AsyncStorage.getItem('profileImgPath');
        if (profileImagePath) {
          console.log(
            'Profile image path from AsyncStorage:',
            profileImagePath,
          );
          setImage(profileImagePath);
        }
      } catch (error) {
        console.error('Failed to load profile image path:', error);
      } finally {
        setLoading(false);
      }
    };
    getProfileImage();
  }, []);

  useEffect(() => {
    if (userData) {
      setWatchLists(userData.watchLists);
    }
  }, [userData]);

  const dispatch = useDispatch();
  const profileImageUri = useSelector(
    (state: any) => state.image.profileImageUri,
  );

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      cropping: true,
      cropperStatusBarColor: theme.colors.accent, // Status bar color of the cropper
      cropperToolbarColor: theme.colors.accent, // Toolbar color of the cropper
      cropperToolbarWidgetColor: theme.colors.text, // Toolbar widget color of the cropper
      cropperCircleOverlay: true,
      width: 100,
      height: 100,
    })
      .then(async (image: any) => {
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setImage(imageUri);
        console.log(imageUri);
        uploadProfileImageToFirebase(imageUri);
        await AsyncStorage.setItem('profileImgPath', imageUri);

        dispatch(setProfileImageUri(imageUri));
      })
      .catch((error: any) => {
        console.log('Image picker error:', error);
      });
  };

  const uploadProfileImageToFirebase = async (imageUri: string) => {
    if (imageUri) {
      const uri = imageUri; // The URI of the image to be resized
      const format = 'JPEG'; // The format of the resized image ('JPEG', 'PNG', 'WEBP')
      const quality = 100; // The quality of the resized image (0-100)

      ImageResizer.createResizedImage(uri, 150, 150, format, quality).then(
        async response => {
          const imageRes = await fetch(response.uri);
          const blob = await imageRes.blob();
          const imgRef = ref(storage, `profileImages/${userData?.userID}`);
          await uploadBytes(imgRef, blob);
          console.log('Image uploaded successfully');
        },
      );
    }
  };

  useEffect(() => {
    if (image) {
      setLoading(false);
    }
  }, [image]);

  const [value, setValue] = useState('');

  if (loading || !userData) {
    return <View></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flex: 1}}></View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('ProfileSearch')}>
          <Icon name={'search'} size={24} color={theme.colors.opposite} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('ProfileActivity')}>
          <Icon name={'heart'} size={24} color={theme.colors.opposite}></Icon>
          <View
            style={{
              position: 'absolute',
              right: 5,
              top: -2,
              height: 12,
              width: 12,
              backgroundColor: 'red',
              borderRadius: 100,
              borderWidth: 2,
              borderColor: theme.colors.background,
            }}></View>
        </TouchableOpacity>
      </View>
      <ScrollView style={{marginHorizontal: 20}}>
        <TouchableOpacity onPress={choosePhotoFromLibrary}>
          {image ? (
            <Image style={styles.profilePic} source={{uri: image}} />
          ) : (
            <View style={styles.profilePic}>
              <Text
                style={{
                  fontFamily: 'InterTight-Black',
                  color: theme.colors.text,
                  fontSize: 15,
                }}>
                {'💸' /*userData?.username.slice(0,1).toUpperCase()*/}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{marginTop: 15, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.usernameText}>Current Username: {userData?.username}</Text>
          </View>

          <TextInput
          value={newBioValue}
          onChange={handleBioChange()}
          />

          {/* make a text field here */}
          <Text style={styles.bioText}>Current Bio: Trading is too easy</Text>

          <TextInput
            value={newBioValue}
          />

        <View style={{marginVertical: 20}}></View>
      </ScrollView>
    </View>
  );
};

export default Profile;
