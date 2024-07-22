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
import PageHeader from '../GlobalComponents/PageHeader';
import { useDispatch } from 'react-redux';
import { setUserBio, setUsername } from '../../GlobalDataManagment/userSlice';

interface RouteParams {
  userID: string,
  username: string,
  bio: string
}

const Profile = ({navigation, route}: any) => {
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createProfileStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);

  // Route params: userID, username, and bio
  const { userID, username, bio } = route.params as RouteParams;

  // username and bio state
  // TODO: Set default state to current username and bio, passed in through route params
  const [newUsername, setNewUsername] = useState<string>(username);
  const [newBio, setNewBio] = useState<string>(bio)

  const dispatch = useDispatch()

  const handleSaveProfile = async () => {
    // Format new profile data to send to server
    const newProfileData = {
      userID: userID,
      newUsername: newUsername,
      newBio: newBio
    }

    dispatch(setUserBio(newBio))
    dispatch(setUsername(newUsername))
    
    console.log("New Username:", newUsername);
    console.log("New bio:", newBio);

    // Call server
    try {
      const response = await axios.post(serverUrl + "/updateUserProfile", newProfileData);
      if (response.status === 200) {
        navigation.goBack()
      }
      // TODO: Set new username and userbio locally. Potentially redux. Your call Joe
    } catch (error: any) {
      // Handle errors
      if (error.response) {
        if (error.response.status == 409) {
          // TODO: Handle this. This error code will happen if username is already taken
        } else {
          // TODO: Handle generic server error
        }
      }
    }

    // TODO: Navigate back to ProfilePage
  }

  return (
    // TODO: Set restraints on bio and username (length, characters, etc.)
    <View style={styles.container}>
      <PageHeader text="Edit Profile"/>
      <View style={{marginHorizontal: 20}}>
        <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', marginBottom: 5, marginTop: 30}}>Edit Username</Text>
        <TextInput style={{color: theme.colors.text, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.tertiary, padding: 20}} onChangeText={setNewUsername} value={newUsername}/>
        <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', marginBottom: 5, marginTop: 20}}>Edit Bio</Text>
        <TextInput multiline style={{color: theme.colors.text, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.tertiary, padding: 20, paddingTop: 20}} onChangeText={setNewBio} value={newBio}/>
   
        <TouchableOpacity onPress={handleSaveProfile} style={{backgroundColor: theme.colors.redAccent, justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderRadius: 10, marginTop: 30}}>
          <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>Confirm Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;
