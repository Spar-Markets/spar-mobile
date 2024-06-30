import React, {useState, useEffect, useCallback} from 'react';
import { Pressable, Platform, Image, Button, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, TextInput, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import CircularProgress from 'react-native-circular-progress-indicator';
import { SvgXml } from 'react-native-svg';
import { serverUrl } from '../../constants/global';
import axios from 'axios';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createProfileStyles from '../../styles/createProfileStyles';
import createGlobalStyles from '../../styles/createGlobalStyles'
import { launchCamera, launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import firebase from '../firebase/firebaseconfig';
import ImagePicker from 'react-native-image-crop-picker'
import useUserDetails from '../../hooks/useUserDetails';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import ImageResizer from '@bam.tech/react-native-image-resizer'


const Profile  = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);
  const [image, setImage] = useState<string | null>(null)


  const { userData } = useUserDetails();

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfileImage = async () => {
      try {
        const profileImagePath = await AsyncStorage.getItem('profileImgPath');
        if (profileImagePath) {
          console.log(profileImagePath);
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


  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
        cropping: true,
        cropperStatusBarColor: theme.colors.accent, // Status bar color of the cropper
        cropperToolbarColor: theme.colors.accent, // Toolbar color of the cropper
        cropperToolbarWidgetColor: theme.colors.text, // Toolbar widget color of the cropper
        cropperCircleOverlay: true,
        width: 100,
        height: 100 
    }).then(async (image: any) => {
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setImage(imageUri);
        console.log(imageUri)
        uploadProfileImageToFirebase(imageUri)
        await AsyncStorage.setItem('profileImgPath', imageUri)
    }).catch((error: any) => {
        console.log("Image picker error:", error);
    })
  };

  const uploadProfileImageToFirebase = async (imageUri:string) => {
    if (imageUri) {
      const uri = imageUri; // The URI of the image to be resized
      const format = 'JPEG'; // The format of the resized image ('JPEG', 'PNG', 'WEBP')
      const quality = 100; // The quality of the resized image (0-100)
      
      ImageResizer.createResizedImage(
         uri, 150, 150, format, quality,
      ).then(async (response) => {
          const imageRes = await fetch(response.uri);
          const blob = await imageRes.blob();
          const imgRef = ref(storage, `profileImages/${userData?.userID}`);
          await uploadBytes(imgRef, blob);
          console.log('Image uploaded successfully');
      })
    }
  }

  useEffect(() => {
    if (image) {
      setLoading(false);
    }
  }, [image]);

 
  if (loading) {
    return <View></View>
  }

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn}>
            <Icon name={"bars"} size={24} color={theme.colors.opposite} />
          </TouchableOpacity>
          <View style={{flex: 1}}></View>
          <TouchableOpacity style={styles.headerBtn}>
            <Icon name={"bell"} size={24} color={theme.colors.opposite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Icon name={"gear"} size={24} color={theme.colors.opposite} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <TouchableOpacity style={styles.profileContainer} onPress={choosePhotoFromLibrary}>
            {image ? <Image style={styles.profilePic} source={{uri: image}}/> : 
              <View style={styles.profilePic}>
                <Text style={{fontFamily: 'InterTight-Black', color: theme.colors.text, fontSize: 30}}>{userData?.username.slice(0,1).toUpperCase()}</Text>
              </View>}
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>Diamond</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.usernameText}>@jjqtrader</Text>
          <View style={{flexDirection: 'row', gap: 10, marginTop: 20, marginHorizontal: 20}}>

            <View style={styles.mainContainer}>
              <Text style={styles.mainContainerType}>Record</Text>
              <Text style={styles.mainContainerText}>23-19</Text>
            </View>
            <View style={styles.mainContainer}>
              <Text style={styles.mainContainerType}>Followers</Text>
              <Text style={styles.mainContainerText}>2.5k</Text>
            </View>
            <View style={styles.mainContainer}>
              <Text style={styles.mainContainerType}>Following</Text>
              <Text style={styles.mainContainerText}>49</Text>
            </View>

          </View>
          <View style={{marginTop: 20, marginHorizontal: 20, gap: 2}}>
            <Text style={styles.progressText}>656/1000 pts.</Text>
            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarProgress}></View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <View style={[styles.rankIndicator,{ backgroundColor: '#81BFB4'}]}></View>
                <Text style={styles.rankProgressText}>Diamond</Text>
              </View>
              <View style={{flex: 1}}></View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text style={styles.rankProgressText}>Ruby</Text>
                <View style={[styles.rankIndicator,{ backgroundColor: '#FF4B8C'}]}></View>
              </View>
            </View>
          </View>

          <View style={{marginTop: 20}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20}}>
              <Text style={styles.labelText}>Friends</Text>
              <TouchableOpacity style={styles.findFriendsBtn}>
                <Text style={styles.findFriendsBtnTxt}>Find People</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginTop: 10, paddingHorizontal: 20}}>
              <TouchableOpacity style={styles.friendContainer}>
                <Image style={styles.friendPic} source={require("../../assets/images/testPic1.png")} />
                <Text style={styles.friendText}>@Drinks</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.friendContainer}>
                <Image style={styles.friendPic} source={require("../../assets/images/testPic2.png")} />
                <Text style={styles.friendText}>@Drinks</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.friendContainer}>
                <Image style={styles.friendPic} source={require("../../assets/images/testPic3.png")} />
                <Text style={styles.friendText}>@Drinks</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.friendContainer}>
                <Image style={styles.friendPic} source={require("../../assets/images/testPic4.png")} />
                <Text style={styles.friendText}>@Drinks</Text>
              </TouchableOpacity>
            </ScrollView>
            
            {/* <TouchableOpacity onPress={handleChoosePhoto}style={globalStyles.primaryBtn}>
                <Text style={globalStyles.primaryBtnText}>Pick Photo</Text>
            </TouchableOpacity>

            {imageUri && <Image source={imageUri}/> ? 
                <View></View> :
              <TouchableOpacity onPress={handleChoosePhoto}style={globalStyles.primaryBtn}>
                <Text style={globalStyles.primaryBtnText}>Pick Photo</Text>
              </TouchableOpacity>
            } */}

          </View>
        </ScrollView>
      </View>
    );
};


export default Profile;