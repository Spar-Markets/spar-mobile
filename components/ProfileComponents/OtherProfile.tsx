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
import MIcon from 'react-native-vector-icons/MaterialIcons';
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
import {useRoute} from '@react-navigation/native';

interface otherProfileParams {
  otherUserID: string;
}

interface UserData {
  __v: number;
  _id: string;
  activematches: any[];
  balance: Number;
  createdAt: string;
  email: string;
  pastmatches: any[];
  plaidPersonalAccess: string;
  skillRating: Number;
  userID: string;
  username: string;
  watchedStocks: [string];
  followers: [string];
  following: [string];
  outgoingFollowRequests: [string];
  incomingFollowRequests: [string];
}

const OtherProfile = ({navigation}: any) => {
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createProfileStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const route = useRoute();
  const [noPic, setNoPic] = useState(false);

  const params = route.params as otherProfileParams | undefined;

  const {userData} = useUserDetails();

  const [loading, setLoading] = useState(true);

  const [otherUserData, setOtherUserData] = useState<UserData | null>(null);

  const [status, setStatus] = useState<string | null>(null);

  const getProfileImage = async () => {
    const imageRef = ref(storage, `profileImages/${params?.otherUserID}`);
    try {
      const url = await getDownloadURL(imageRef);
      if (url) {
        setProfileImage(url);
        setNoPic(false);
      } else {
        setNoPic(true);
      }
    } catch (error) {
      console.log('Error fetching profile image: ', error);
      setNoPic(true);
    }
    setLoading(false);
  };

  const getUserData = async () => {
    try {
      console.log('About to run if statement');
      if (userData?.userID) {
        console.log('About to run functions');
        await getProfileImage();
        await checkFollowStatus();
        console.log(
          'About to call getUser endpoint:',
          `${serverUrl}/getUser`,
          'with data:',
          params?.otherUserID,
        );
        const response = await axios.post(`${serverUrl}/getUser`, {
          userID: params?.otherUserID,
        });
        setOtherUserData(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Creamy error fetching user data:', error);
    }
  };

  useEffect(() => {
    getUserData();
  }, [params?.otherUserID, userData?.userID]);

  const requestFollow = async () => {
    try {
      const response = await axios.post(serverUrl + '/addFollowRequest', {
        userID: userData?.userID,
        otherUserID: params?.otherUserID,
      });
      if (response.status === 200) {
        setStatus('pending');
      }
    } catch {
      Alert.alert('Error Following');
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await axios.post(serverUrl + '/checkFollowStatus', {
        userID: userData?.userID,
        otherUserID: params?.otherUserID,
      });
      setStatus(response.data.status);
      //Alert.alert('Follow Status', `Status: ${response.data.status}`);
    } catch (error) {
      console.error('Error checking follow status:', error);
      Alert.alert('Error', 'An error occurred while checking follow status');
    }
  };

  if (loading || !otherUserData) {
    return <View></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}>
          <Icon name={'chevron-left'} size={24} color={theme.colors.opposite} />
        </TouchableOpacity>
        <View style={{flex: 1}}></View>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name={'bars'} size={24} color={theme.colors.opposite} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.profileContainer}>
          {profileImage ? (
            <Image style={styles.profilePic} source={{uri: profileImage}} />
          ) : (
            <View style={styles.profilePic}>
              <Text
                style={{
                  fontFamily: 'InterTight-Black',
                  color: theme.colors.text,
                  fontSize: 30,
                }}>
                {otherUserData?.username.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.rankContainer}>
            <Text style={styles.rankText}>Diamond</Text>
          </View>
        </View>
        <Text style={styles.usernameText}>@{otherUserData?.username}</Text>
        <Text
          style={{
            color: theme.colors.text,
            fontFamily: 'InterTight-Regular',
            fontSize: 14,
            marginHorizontal: 20,
            textAlign: 'center',
            marginTop: 10,
          }}>
          OOOOOWWEEEEE
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 20,
            marginHorizontal: 20,
          }}>
          <View style={styles.mainContainer}>
            <Text style={styles.mainContainerType}>Followers</Text>
            <Text style={styles.mainContainerText}>
              {otherUserData?.followers
                ? otherUserData?.followers.length
                : 0 ?? 0}
            </Text>
          </View>
          <View style={styles.mainContainer}>
            <Text style={styles.mainContainerType}>Following</Text>
            <Text style={styles.mainContainerText}>
              {otherUserData?.following
                ? otherUserData?.following.length
                : 0 ?? 0}
            </Text>
          </View>
        </View>
        {status == 'none' && (
          <TouchableOpacity
            style={{
              marginTop: 10,
              backgroundColor: '#81BFB4',
              marginHorizontal: 20,
              height: 40,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={requestFollow}>
            <Text
              style={{
                color: theme.colors.background,
                fontFamily: 'InterTight-Bold',
                fontSize: 16,
              }}>
              Follow
            </Text>
          </TouchableOpacity>
        )}
        {status == 'pending' && (
          <TouchableOpacity
            style={{
              marginTop: 10,
              backgroundColor: theme.colors.primary,
              marginHorizontal: 20,
              height: 40,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: theme.colors.text,
                fontFamily: 'InterTight-Bold',
                fontSize: 16,
              }}>
              Pending
            </Text>
          </TouchableOpacity>
        )}
        {/*<View style={{marginTop: 20, marginHorizontal: 20, gap: 2}}>
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
  </View>*/}

        {/*<View style={{marginTop: 20}}>
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
            
            </View>*/}
      </ScrollView>
    </View>
  );
};

export default OtherProfile;
