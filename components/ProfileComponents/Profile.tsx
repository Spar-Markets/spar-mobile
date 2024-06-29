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


const Profile  = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);


  // can i import types 
  const [imageUri, setImageUri] = useState();
  
  
  const handleChoosePhoto = () => {
    const options = { selectionLimit: 1, mediaType: "photo" };
    launchImageLibrary(options, response => {
      if (response && response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        // Handle the selected image URI or other properties
        setImageUri(selectedImage)
      } else {
        console.log("No image selected or response is undefined.");
      }
    });
  };
  
  const handleUploadPhoto = async () => {
    if (!imageUri) {
      console.log("No image URI to upload.");
      return;
    }
  
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child('images/' + new Date().toISOString() + '.jpg');
      
      await fileRef.put(blob);
      
      const url = await fileRef.getDownloadURL();
      Alert.alert("Upload Success", "Image uploaded successfully: " + url);
    } catch (error) {
      Alert.alert("Error", "Upload failed: " + error.message);
    }
  };

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
          <View style={styles.profileContainer}>
            <Image style={styles.profilePic} source={require("../../assets/images/largeProfilePic.png")} />
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>Diamond</Text>
            </View>
          </View>
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