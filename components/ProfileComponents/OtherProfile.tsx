import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  PermissionsAndroid,
  Linking,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FeatherIcons from 'react-native-vector-icons/Feather';
import CircularProgress from 'react-native-circular-progress-indicator';
import { SvgXml } from 'react-native-svg';
import { serverUrl } from '../../constants/global';
import axios from 'axios';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createProfileStyles from '../../styles/createProfileStyles';
import createGlobalStyles from '../../styles/createGlobalStyles';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { useDispatch, useSelector } from 'react-redux';
import CreateWatchlistButton from '../HomeComponents/CreateWatchlistButton';
import WatchlistButton from '../HomeComponents/WatchlistButton';
import { SegmentedButtons } from 'react-native-paper';
import PageHeader from '../GlobalComponents/PageHeader';
import { RootState } from '../../GlobalDataManagment/store';
import { setHasDefaultProfileImage } from '../../GlobalDataManagment/userSlice';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList } from 'react-native';
import { Skeleton, TabView } from '@rneui/base';
import ProfileTabView from './ProfileTabView';
import * as Progress from 'react-native-progress';
import YourPosts from './YourPosts';
import LikedPosts from './LikedPosts';
import DashboardView from './DashboardView';
import { useNavigation, useRoute } from '@react-navigation/native';
import getProfileImage from '../../utility/getProfileImage';
import PostType from '../../types/PostType';
import timeAgo from '../../utility/timeAgo';
import OtherProfilePosts from './OtherProfilePosts';
import generateRandomString from '../../utility/generateRandomString';





const imageMap = [
  '',
  Image.resolveAssetSource(require('../../assets/images/profile1.png')).uri,
  Image.resolveAssetSource(require('../../assets/images/profile2.png')).uri,
  Image.resolveAssetSource(require('../../assets/images/profile3.png')).uri,
];

const OtherProfile = (props: any) => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const navigation = useNavigation<any>()

  const route = useRoute();
  const params = route.params as any;

  MaterialCommunityIcons.loadFont();
  MaterialIcons.loadFont();
  FeatherIcons.loadFont();

  const [username, setUsername] = useState<any>()
  const [userBio, setUserBio] = useState<any>()
  const [skillRating, setSkillRating] = useState<any>()
  const [hasDefaultProfileImage, setHasDefaultProfileImage] = useState<any>()
  const [defaultProfileImage, setDefaultProfileImage] = useState<any>()
  const [friendCount, setFriendCount] = useState<any>()
  const [profileImageUri, setProfileImageUri] = useState<any>()
  const [createdAt, setCreatedAt] = useState<any>(null)


  const fetchUserData = async (userID: string) => {
    try {
      //console.log("server url FROM env:", `${process.env.SERVER_URL}`);
      //console.log("Server url endpoint:", `${serverUrl}/getUser`);
      //console.log("USEUSER, UserID:", userID);
      console.log("PASSING USER ID IN TO GET USER ENDPOINT:", userID)
      const userResponse = await axios.post(`${serverUrl}/getUser`, { userID });
      //console.log('Fetched User Data:', response.data);
      setUsername(userResponse.data.username)
      setUserBio(userResponse.data.bio)
      setSkillRating(userResponse.data.skillRating)
      // dispatch(setFollowers(response.data.followers))
      // dispatch(setFollowing(response.data.following))
      setHasDefaultProfileImage(params.hasDefaultProfileImage)
      setProfileImageUri(params.profileImageUri)
      setCreatedAt(userResponse.data.createdAt)

      setFriendCount(userResponse.data.friendCount)

      //dispatch(setFriends(friendResponse.data))

      //setUserData(userResponse.data);

      console.log(userResponse.data)

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData(params.userID)
      .then(() => {
        setLoading(false)
      })
  }, [])

  const user = useSelector((state: RootState) => state.user)

  const handleDM = async () => {
    try {
      // Search for an existing conversation between the two users
      const searchResponse = await axios.post(`${serverUrl}/conversations/search`, {
        userID1: user.userID,
        userID2: params.userID
      });

      let conversationID;

      if (searchResponse.data.exists) {
        // Use the existing conversation's ID
        conversationID = searchResponse.data.chat.conversationID;
      } else {
        // Generate a new conversation ID since no existing conversation was found
        conversationID = generateRandomString(40);
        console.log(conversationID, user.userID, params.userID)

        // Create the conversation by sending the first message
        await axios.post(`${serverUrl}/conversations`, {
          conversationID,
          participantIDs: [user.userID, params.userID],
          type: "dm" // Set the conversation type, e.g., "dm"
        });

        // Optionally, send an initial message to start the chat
        await axios.post(`${serverUrl}/addMessage`, {
          conversationID,
          userID: user.userID,
          message: "Chat started", // Initial message
          time: new Date(),
        });
      }

      // Navigate to the chat screen with the existing or newly created conversation ID
      navigation.navigate("Chat", {
        conversationID,
        userID: user.userID,
        type: "dm",
        otherProfileUri: profileImageUri,
        otherHasDefaultProfileImage: hasDefaultProfileImage,
        otherUsername: username
      });

    } catch (error) {
      console.error("Error handling DM:", error);
    }
  };

  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const [selectedIndex, setSelectedIndex] = useState(0); // Start with 0 for Posts
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorWidth = width / 3; // Each tab takes up 1/3 of the screen

  useEffect(() => {
    // Set the initial indicator position on mount
    scrollX.setValue(0);
  }, [width]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleTabPress = (index: number) => {
    setSelectedIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setSelectedIndex(index);
  };

  const textColorInterpolation = (index: number) => {
    return scrollX.interpolate({
      inputRange: [
        (index - 1) * width,
        index * width,
        (index + 1) * width,
      ],
      outputRange: [
        theme.colors.secondaryText,
        theme.colors.text,
        theme.colors.secondaryText,
      ],
      extrapolate: 'clamp',
    });
  };

  const [scrollStarted, setScrollStarted] = useState(false); // Track if scrolling has started
  const translateY = useRef(new Animated.Value(0)).current;

  const handleScrollDown = useCallback(() => {
    if (!scrollStarted) {
      setScrollStarted(true);
    }
  }, [scrollStarted]);

  useEffect(() => {
    if (scrollStarted) {
      Animated.timing(translateY, {
        toValue: -200,
        duration: 500, // Reduced duration for quicker response
        useNativeDriver: true,
      }).start();
    }
  }, [scrollStarted]);

  const [friendStatus, setFriendStatus] = useState<any>(null)

  const addFriendRequest = async () => {
    try {
      const response = await axios.post(serverUrl + '/addFriendRequest', { userID: user.userID, requestedUserID: params.userID })
      if (response.status === 200) {
        setFriendStatus("requested")
      }

    } catch (error) {
      Alert.alert(`Error Friending ${error}`)
    }
  }



  if (loading) {
    return <View></View>;
  }


  // /Animated.View style={{ transform: [{ translateY }], height: 200 }}

  return (
    <View style={styles.container}
    >

      {/*I want this view to animate out of view above on scroll */}
      <View>

        <PageHeader />

        {/*<TouchableOpacity onPress={chooseBannerFromLibrary} style={{ width: width, height: 150 }}>
          {banner != null ?
            <Image source={{ uri: banner }} style={{ width: width, height: 150 }} /> : <View style={{ width: width, height: 150, backgroundColor: theme.colors.accent2 }} />
          }

        </TouchableOpacity>*/}
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <View style={{ zIndex: 10 }}>

            {profileImageUri && (
              <Image
                style={[styles.profilePic,

                ]}
                source={hasDefaultProfileImage ? profileImageUri : { uri: profileImageUri } as any}
              />
            )}
          </View>

          <View style={{ flexDirection: 'row', flex: 1, marginHorizontal: 10, padding: 10, marginTop: 10 }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18 }}>
                {friendCount}
              </Text>
              <Text style={{ color: theme.colors.secondaryText, fontFamily: 'interTight-semibold', fontSize: 14 }}>
                {friendCount == 1 ? "Friend" : "Friends"}
              </Text>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18 }}>
                0
              </Text>
              <Text style={{ color: theme.colors.secondaryText, fontFamily: 'interTight-semibold', fontSize: 14 }}>
                Games Played
              </Text>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18 }}>
                0
              </Text>
              <Text style={{ color: theme.colors.secondaryText, fontFamily: 'interTight-semibold', fontSize: 14 }}>
                Posts
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginHorizontal: 10, gap: 2, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <Text style={[styles.usernameText]}>{username}</Text>

            </View>

            <LinearGradient colors={["#ffbf00", "#a67c00"]} style={{ borderRadius: 100, zIndex: 100, justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'intertight-Bold', fontSize: 12, paddingHorizontal: 10, paddingVertical: 3 }}>GOLD</Text>
            </LinearGradient>
          </View>
          <Text style={styles.bioText}>{userBio}</Text>
          <View style={{ flexDirection: 'row', marginTop: 5, gap: 5 }}>
            {!user.friends.includes(params.userID) && <TouchableOpacity onPress={addFriendRequest} style={{ height: 40, flex: 1, backgroundColor: theme.colors.tertiary, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'intertight-bold' }}>Add Friend</Text>
            </TouchableOpacity>}
            <TouchableOpacity onPress={handleDM} style={{ height: 40, flex: 1, backgroundColor: theme.colors.tertiary, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'intertight-bold' }}>Message</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 10, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <FeatherIcons name="calendar" color={theme.colors.secondaryText} size={16} />
            <Text style={{ color: theme.colors.secondaryText, fontFamily: "intertight-medium" }}>Joined {createdAt}</Text>
          </View>
        </View>





        {/*}  <View style={{
          marginHorizontal: 10,
          borderRadius: 10,
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
        }}>
          <LinearGradient colors={["#ffbf00", "#a67c00"]} style={{ borderRadius: 100, zIndex: 100 }}>
            <Text style={{ fontFamily: 'intertight-Bold', fontSize: 12, paddingHorizontal: 10, paddingVertical: 3 }}>GOLD</Text>
          </LinearGradient>
          <View style={{ flex: 1, marginHorizontal: -2, height: 10, backgroundColor: theme.colors.tertiary, borderRadius: 0, position: 'relative' }}>

            <View style={{
              width: `${50}%`, // Set width based on progress
              height: '100%',
              backgroundColor: theme.colors.opposite,
              borderRadius: 0,
            }} />
          </View>
          <LinearGradient colors={["#B9F2FF", "#558B81"]} style={{ borderRadius: 100, zIndex: 100 }}>
            <Text style={{ fontFamily: 'intertight-bold', fontSize: 12, paddingHorizontal: 10, paddingVertical: 3 }}>DIAMOND</Text>
          </LinearGradient>

        </View>
        */}

      </View>

      <View style={{ flex: 1, backgroundColor: theme.colors.background, marginTop: 10 }}>
        {/* Tab buttons with animated indicator */}
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', width: '100%' }}>
            {['Activity', 'Posts', 'Missions'].map((label, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                }}
                onPress={() => handleTabPress(index)}
              >
                <Animated.Text
                  style={{
                    color: textColorInterpolation(index),
                    fontSize: 16,
                    fontFamily: 'InterTight-bold'
                  }}
                >
                  {label}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Animated indicator */}
          <Animated.View
            style={{
              height: 2,
              backgroundColor: theme.colors.text,
              width: indicatorWidth,
              position: 'absolute',
              bottom: 0,
              left: scrollX.interpolate({
                inputRange: [0, width, width * 2],
                outputRange: [0, indicatorWidth, indicatorWidth * 2],
              }),
            }}
          />
        </View>

        {/* Horizontal ScrollView */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ width: width * 3 }}
          style={{ flexGrow: 1 }}
          onMomentumScrollEnd={handleMomentumScrollEnd}
        >
          <View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Activity</Text>
          </View>
          <View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
            {params.userID &&
              <OtherProfilePosts onScrollDown={handleScrollDown} posterId={params.userID} />
            }
          </View>
          <View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Missions View</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default OtherProfile;
