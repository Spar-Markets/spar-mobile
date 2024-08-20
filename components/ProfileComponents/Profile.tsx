import React, { useState, useEffect, useCallback } from 'react';
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
import { setProfileImageUri } from '../../GlobalDataManagment/imageSlice';
import CreateWatchlistButton from '../HomeComponents/CreateWatchlistButton';
import WatchlistButton from '../HomeComponents/WatchlistButton';
import { SegmentedButtons } from 'react-native-paper';
import PageHeader from '../GlobalComponents/PageHeader';
import { RootState } from '../../GlobalDataManagment/store';
import { setHasDefaultProfileImage } from '../../GlobalDataManagment/userSlice';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList } from 'react-native';
import { TabView } from '@rneui/base';
import ProfileTabView from './ProfileTabView';
import * as Progress from 'react-native-progress';




const imageMap = [
  '',
  Image.resolveAssetSource(require('../../assets/images/profile1.png')).uri,
  Image.resolveAssetSource(require('../../assets/images/profile2.png')).uri,
  Image.resolveAssetSource(require('../../assets/images/profile3.png')).uri,
];

const Profile = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);
  const [image, setImage] = useState<string | null>(null);
  const [watchLists, setWatchLists] = useState<Object[]>([]);
  const profileImageUri = useSelector(
    (state: any) => state.image.profileImageUri,
  );

  const [banner, setBanner] = useState<any>(null)

  MaterialCommunityIcons.loadFont();
  MaterialIcons.loadFont();
  FeatherIcons.loadFont();

  const username = useSelector((state: RootState) => state.user.username);
  const userBio = useSelector((state: RootState) => state.user.userBio);
  const hasDefaultProfileImage = useSelector(
    (state: RootState) => state.user.hasDefaultProfileImage,
  );
  const defaultProfileImage = useSelector(
    (state: RootState) => state.user.defaultProfileImage,
  );

  const user = useSelector((state: any) => state.user);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    if (hasDefaultProfileImage != null && loading) {
      const getProfileImage = async () => {
        try {
          if (hasDefaultProfileImage == false) {
            const imageRef = storage().ref(`profileImages/${user.userID}`);
            try {
              const url = await imageRef.getDownloadURL();
              console.log(user.username, url);
              if (url) {
                dispatch(setHasDefaultProfileImage(false));
                dispatch(setProfileImageUri(url));
                console.log(url, "HOW THE HELL ARE WE HERE")
              }
            } catch (error) {
              console.log('no firebase image');
            }
          } else if (hasDefaultProfileImage == true) {
            const tempURI = imageMap[Number(defaultProfileImage)];
            console.log('Temp', tempURI);
            dispatch(setHasDefaultProfileImage(true));
            dispatch(setProfileImageUri(tempURI));
          }
        } catch (error) {
          console.error('Failed to load profile image path:', error);
        } finally {
          setLoading(false);
        }
      };

      getProfileImage();
    }
  }, [hasDefaultProfileImage]);

  useEffect(() => {
    if (loading) {
      const getBannerImage = async () => {
        try {
          const imageRef = storage().ref(`bannerImages/${user.userID}`);
          try {
            const url = await imageRef.getDownloadURL();
            if (url) {
              setBanner(url)
              console.log(url, "GOT BANNER IMAGE")
            }
          } catch (error) {
            console.log('no firebase image');
          }
        } catch (error) {
          console.error('Failed to load profile image path:', error);
        } finally {
          setLoading(false);
        }
      };
      getBannerImage();
    }
  }, [])


  const dispatch = useDispatch();

  const requestPermissions = async () => {
    let photoLibraryPermissionGranted = false;

    if (Platform.OS === 'ios') {
      const photoLibraryPermission = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

      if (photoLibraryPermission == RESULTS.BLOCKED) {

        Alert.alert(
          "Permission Required",
          "Customizing your profile picture requires access to photos. Please enable them in the app settings.",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
      } else if (photoLibraryPermission === RESULTS.GRANTED) {
        photoLibraryPermissionGranted = true;
      }

      // Uncomment this block if you need camera permissions
      /*const cameraPermission = await check(PERMISSIONS.IOS.CAMERA);
      if (cameraPermission !== RESULTS.GRANTED) {
        await request(PERMISSIONS.IOS.CAMERA);
      }*/
    } else if (Platform.OS === 'android') {
      const readPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );

      const writePermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );

      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      if (
        readPermission === PermissionsAndroid.RESULTS.GRANTED &&
        writePermission === PermissionsAndroid.RESULTS.GRANTED &&
        cameraPermission === PermissionsAndroid.RESULTS.GRANTED
      ) {
        photoLibraryPermissionGranted = true;
      }
    }

    return photoLibraryPermissionGranted;
  };


  const choosePhotoFromLibrary = async () => {
    console.log(await requestPermissions());
    ImagePicker.openPicker({
      cropping: true,
      cropperStatusBarColor: theme.colors.accent, // Status bar color of the cropper
      cropperToolbarColor: theme.colors.accent, // Toolbar color of the cropper
      cropperToolbarWidgetColor: theme.colors.text, // Toolbar widget color of the cropper
      cropperCircleOverlay: true,
      width: 100,
      height: 100,
    })
      .then((image: any) => {
        const imageUri = image.path;
        dispatch(setHasDefaultProfileImage(false));
        dispatch(setProfileImageUri(imageUri));
        const uploadImage = async (image: any) => {
          uploadProfileImageToFirebase(image);
          console.log('custom image', image);

          if (hasDefaultProfileImage == false) {
            console.log(
              'no need to change the mongo to false becasue this is another cutom image',
            );
          } else {
            await axios.post(`${serverUrl}/updateImageStatus`, {
              userID: user.userID,
              status: false,
            });
          }
        };
        uploadImage(imageUri);
      })
      .catch((error: any) => {
        console.log('Image picker error:', error);
      });
  };

  const chooseBannerFromLibrary = async () => {
    console.log(await requestPermissions());
    ImagePicker.openPicker({
      cropping: true,
      cropperStatusBarColor: theme.colors.accent, // Status bar color of the cropper
      cropperToolbarColor: theme.colors.accent, // Toolbar color of the cropper
      cropperToolbarWidgetColor: theme.colors.text, // Toolbar widget color of the cropper
      width: 1600, // Width for the cropped image
      height: 500, // Height for the cropped image
    })
      .then((image: any) => {
        const imageUri = image.path;
        console.log('Image dimensions:', image.width, 'x', image.height); // Log image dimensions
        console.log('Using image URI for upload:', imageUri); // Log the URI
        console.log(image)

        setBanner(imageUri);
        uploadBannerImageToFirebase(imageUri);
      })
      .catch((error: any) => {
        console.log('Image picker error:', error);
      });
  };


  const [index, setIndex] = useState(0);


  const uploadProfileImageToFirebase = async (imageUri: string) => {
    if (imageUri) {
      const uri = imageUri; // The URI of the image to be resized
      const format = 'JPEG'; // The format of the resized image ('JPEG', 'PNG', 'WEBP')
      const quality = 100; // The quality of the resized image (0-100)

      ImageResizer.createResizedImage(uri, 150, 150, format, quality).then(
        async response => {
          const imgRef = storage().ref(`profileImages/${user.userID}`);
          await imgRef.putFile(response.uri)
          //await uploadBytes(imgRef, blob);
          console.log('Image uploaded successfully');
        },
      );
    }
  };

  const uploadBannerImageToFirebase = async (imageUri: string) => {
    if (imageUri) {
      const uri = imageUri; // The URI of the image to be resized
      const format = 'JPEG'; // The format of the resized image ('JPEG', 'PNG', 'WEBP')
      const quality = 100; // The quality of the resized image (0-100)

      ImageResizer.createResizedImage(uri, 1600, 500, format, quality).then(
        async response => {
          const imgRef = storage().ref(`bannerImages/${user.userID}`);
          await imgRef.putFile(response.uri)
          //await uploadBytes(imgRef, blob);
          console.log('Image uploaded successfully');
        },
      );
    }
  };


  if (loading || !user) {
    return <View></View>;
  }


  return (
    <View style={{
      backgroundColor: theme.colors.background,
      flex: 1
    }}>




      <TouchableOpacity onPress={chooseBannerFromLibrary} style={{ width: width, height: 150 }}>
        {banner != null ?
          <Image source={{ uri: banner }} style={{ width: width, height: 150 }} /> : <View style={{ width: width, height: 150, backgroundColor: theme.colors.accent2 }} />
        }

      </TouchableOpacity>
      <TouchableOpacity onPress={choosePhotoFromLibrary} style={{ zIndex: 10, position: 'absolute', left: 10, top: 115 }}>
        {hasDefaultProfileImage == true && (
          <Image
            style={[
              styles.profilePic,
              ,
            ]}
            source={{ uri: profileImageUri }}
          />
        )}
        {hasDefaultProfileImage == false && (
          <Image
            style={[
              styles.profilePic,
              ,
            ]}
            source={{ uri: profileImageUri } as any}
          />
        )}
      </TouchableOpacity>



      <View style={{ marginHorizontal: 10, marginTop: 50, gap: 2 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <Text style={[styles.usernameText]}>{username}</Text>
          <TouchableOpacity
            style={{
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
            }}
            onPress={() =>
              navigation.navigate('editProfilePage', {
                userID: user.userID,
                username: username,
                bio: userBio,
              })
            }>
            <FeatherIcons
              name="edit-2"
              color={theme.colors.text}
              size={18}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row' }}>

        </View>
        <Text style={styles.bioText}>{userBio}</Text>
        <View style={{ marginTop: 10, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          <FeatherIcons name="calendar" color={theme.colors.secondaryText} size={16} />
          <Text style={{ color: theme.colors.secondaryText, fontFamily: "intertight-medium" }}>Joined August 2, 2024</Text>
        </View>
      </View>




      <View style={{ flexDirection: 'row', backgroundColor: theme.colors.secondary, borderColor: theme.colors.tertiary, borderRadius: 100, borderWidth: 2, marginHorizontal: 10, padding: 10, marginTop: 10 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18 }}>
            {user.friendCount}{' '}
          </Text>
          <Text style={{ color: theme.colors.secondaryText, fontFamily: 'interTight-semibold', fontSize: 14 }}>
            {user.friendCount == 1 ? "Friend" : "Friends"}
          </Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18 }}>
            26
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

      <View>

      </View>


      <View style={{
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



      <ProfileTabView />
      {/*<TabView value={index} onChange={setIndex} containerStyle={{ width: width }} minSwipeRatio={0.2} minSwipeSpeed={0.5}>
        <TabView.Item style={{ width: '100%' }}>
          <ScrollView>
            <Text style={{ color: 'white' }}>Tab 1 Content</Text>
          </ScrollView>
        </TabView.Item>
        <TabView.Item style={{ width: '100%' }}>
          <ScrollView>
            <Text style={{ color: 'white' }}>Tab 2 Content</Text>
          </ScrollView>
        </TabView.Item>
      </TabView>*/}



      {/*              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 5,
                  marginBottom: 10,
                }}>
                <TouchableOpacity
                  style={styles.mainContainer}
                  onPress={() =>
                    navigation.navigate('FollowersFollowing', {
                      type: 'following',
                      username: user.username,
                    })
                  }>
                  <Text style={styles.mainContainerType}>
                    {user.friendCount}{' '}
                    <Text style={{ color: theme.colors.secondaryText }}>
                      {user.friendCount == 1 ? "Friend" : "Friends"}
                    </Text>
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    aspectRatio: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.primary,
                    marginTop: 10,
                    borderRadius: 10,
                  }}
                  onPress={() =>
                    navigation.navigate('editProfilePage', {
                      userID: user.userID,
                      username: username,
                      bio: userBio,
                    })
                  }>
                  <FeatherIcons
                    name="edit-2"
                    color={theme.colors.text}
                    size={18}
                  />
                </TouchableOpacity>
              </View>

        <Text
          style={{
            color: theme.colors.text,
            marginLeft: 15,
            fontFamily: 'InterTight-Bold',
            fontSize: 18,
          }}>
          Finances
        </Text>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 10,
            marginHorizontal: 10,
            gap: 10,
          }}>
          <View
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 15,
              paddingVertical: 15,
              borderRadius: 10,
              flex: 1,
            }}>
            <Text
              style={{
                fontFamily: 'InterTight-Bold',
                color: theme.colors.accent2,
              }}>
              Balance
            </Text>
            <Text
              style={{
                fontFamily: 'InterTight-Bold',
                fontSize: 20,
                color: theme.colors.text,
              }}>
              ${user.balance.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 10, marginHorizontal: 10, gap: 10 }}>
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: theme.colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              flex: 1,
              paddingVertical: 15,
            }}>
            <Text
              style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>
              Withdraw
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.accent2,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              flex: 1,
              paddingVertical: 15,
            }}>
            <Text
              style={{
                color: theme.colors.text,
                fontFamily: 'InterTight-Bold',
              }}>
              Deposit
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            borderRadius: 10,
            backgroundColor: theme.colors.primary,
            marginTop: 10,
            marginHorizontal: 10,
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              paddingVertical: 15,
              paddingHorizontal: 15,
            }}>
            <MaterialCommunityIcons
              name="bank"
              size={24}
              color={theme.colors.text}
              style={{ width: 30 }}
            />
            <Text
              style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>
              Payment Methods
            </Text>
            <View style={{ flex: 1 }} />
            <FeatherIcons
              name="chevron-right"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: theme.colors.background,
              height: 2,
            }}></View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              paddingVertical: 15,
              paddingHorizontal: 15,
            }}>
            <MaterialCommunityIcons
              name="file-document-multiple"
              size={24}
              color={theme.colors.text}
              style={{ width: 30 }}
            />
            <Text
              style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>
              Documents
            </Text>
            <View style={{ flex: 1 }} />
            <FeatherIcons
              name="chevron-right"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: theme.colors.background,
              height: 2,
            }}></View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              paddingVertical: 15,
              paddingHorizontal: 15,
            }}>
            <MaterialCommunityIcons
              name="bank-transfer"
              size={24}
              color={theme.colors.text}
              style={{ width: 30 }}
            />
            <Text
              style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>
              Transfers
            </Text>
            <View style={{ flex: 1 }} />
            <FeatherIcons
              name="chevron-right"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            color: theme.colors.text,
            marginTop: 20,
            marginLeft: 15,
            fontFamily: 'InterTight-Bold',
            fontSize: 18,
          }}>
          General
        </Text>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: theme.colors.primary,
            marginTop: 10,
            marginHorizontal: 10,
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              paddingVertical: 15,
              paddingHorizontal: 15,
            }}>
            <FeatherIcons
              name="activity"
              size={24}
              color={theme.colors.text}
              style={{ width: 30 }}
            />
            <Text
              style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>
              Activity
            </Text>
            <View style={{ flex: 1 }} />
            <FeatherIcons
              name="chevron-right"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: theme.colors.background,
              height: 2,
            }}></View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              paddingVertical: 15,
              paddingHorizontal: 15,
            }}>
            <FeatherIcons
              name="eye"
              size={24}
              color={theme.colors.text}
              style={{ width: 30 }}
            />
            <Text
              style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>
              Watchlists
            </Text>
            <View style={{ flex: 1 }} />
            <FeatherIcons
              name="chevron-right"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: theme.colors.background,
              height: 2,
            }}></View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              paddingVertical: 15,
              paddingHorizontal: 15,
            }}
            onPress={() => navigation.navigate('Settings')}>
            <Icon
              name="gear"
              size={24}
              color={theme.colors.text}
              style={{ width: 30 }}
            />
            <Text
              style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>
              Settings
            </Text>
            <View style={{ flex: 1 }} />
            <FeatherIcons
              name="chevron-right"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>*/}

      <View style={{ marginVertical: 20 }}>
        {/*<Text
              style={{
                color: theme.colors.text,
                fontSize: 20,
                fontFamily: 'InterTight-Bold',
                marginHorizontal: 20,
              }}>
              Lists
            </Text>
            
            <CreateWatchlistButton/>
            
            <View style={{marginHorizontal: 20}}>
              {watchLists.map((watchList:any, index) => {
                return (

                    <WatchlistButton key={index} 
                    watchListName={watchList.watchListName} 
                    watchListIcon={watchList.watchListIcon}
                    numberOfAssets={watchList.watchedStocks.length}
                    assets={watchList.watchedStocks}
                    />
                  
                );
              })}
            </View>*/}
      </View>


    </View>
  );
};

export default Profile;
