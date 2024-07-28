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
import FeatherIcons from 'react-native-vector-icons/Feather';
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
import PageHeader from '../GlobalComponents/PageHeader';
import {RootState} from '../../GlobalDataManagment/store';
import {setHasDefaultProfileImage} from '../../GlobalDataManagment/userSlice';

const imageMap = [
  '',
  require('../../assets/images/profile1.png'),
  require('../../assets/images/profile2.png'),
  require('../../assets/images/profile3.png'),
];

const Profile = ({navigation}: any) => {
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createProfileStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);
  const [image, setImage] = useState<string | null>(null);
  const [watchLists, setWatchLists] = useState<Object[]>([]);
  const profileImageUri = useSelector(
    (state: any) => state.image.profileImageUri,
  );
  const hasDefaultProfileImage = useSelector(
    (state: any) => state.user.hasDefaultProfileImage,
  );

  MaterialCommunityIcons.loadFont();
  MaterialIcons.loadFont();
  FeatherIcons.loadFont();

  const username = useSelector((state: RootState) => state.user.username);
  const userBio = useSelector((state: RootState) => state.user.userBio);

  const {userData} = useUserDetails();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfileImage = async () => {
      try {
        const defaultImage = await AsyncStorage.getItem(
          'hasDefaultProfileImage',
        );

        defaultImage == 'true'
          ? dispatch(setHasDefaultProfileImage(true))
          : dispatch(setHasDefaultProfileImage(false));

        const defaultProfileImage = await AsyncStorage.getItem(
          'defaultProfileImage',
        );
        const defaultAsNumber = Number(defaultProfileImage);

        const customProfileImagePath = await AsyncStorage.getItem(
          'customProfileImgPath',
        );
        console.log('true or false', defaultImage);
        if (defaultImage == 'true') {
          const tempURI = imageMap[defaultAsNumber];
          setImage(tempURI);
          dispatch(setProfileImageUri(tempURI));
        } else {
          console.log(
            'Profile image path from AsyncStorage:',
            customProfileImagePath,
          );
          setImage(customProfileImagePath);
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
        uploadProfileImageToFirebase(imageUri);
        console.log('custom image', imageUri);

        const userID = await AsyncStorage.getItem('userID');

        if (hasDefaultProfileImage == false) {
          console.log(
            'no need to change the mongo to false becasue this is another cutom image',
          );
        } else {
          const update = await axios.post(`${serverUrl}/updateImageStatus`, {
            userID: userID,
            status: 'false',
          });
        }

        await AsyncStorage.setItem('hasDefaultProfileImage', 'false');
        await AsyncStorage.setItem('customProfileImgPath', imageUri);
        dispatch(setProfileImageUri(imageUri));
        dispatch(setHasDefaultProfileImage(false));
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
    <View style={[styles.container]}>
      {/*<View style={styles.header}>
          <View style={{flex: 1}}></View>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate("ProfileSearch")}>
            <Icon name={"search"} size={24} color={theme.colors.opposite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate("ProfileActivity")}>
            <Icon name={"heart"} size={24} color={theme.colors.opposite}></Icon>
            <View style={{position: 'absolute', right:5, top:-2, height: 12, width: 12, backgroundColor: 'red', borderRadius: 100, borderWidth: 2, borderColor: theme.colors.background}}></View>
          </TouchableOpacity>
        </View>*/}
      <PageHeader text="Profile" onProfile={true} />
      <ScrollView style={{marginTop: 10}}>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            paddingBottom: 20,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 1,
              backgroundColor: theme.colors.background,
              width: 40,
              height: 40,
              borderRadius: 500,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FeatherIcons name="edit-2" color={theme.colors.text} size={18} />
          </TouchableOpacity>
          <Image
            source={require('../../assets/images/banner1.png')}
            style={{
              zIndex: 0,
              width: width,
              height: 150,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}></Image>

          <View style={{marginHorizontal: 20, marginTop: 105}}>
            <TouchableOpacity onPress={choosePhotoFromLibrary}>
              {hasDefaultProfileImage && Image && (
                <Image
                  style={[
                    styles.profilePic,
                    {borderWidth: 2, borderColor: theme.colors.text},
                  ]}
                  source={image as any}
                />
              )}
              {!hasDefaultProfileImage && Image && (
                <Image
                  style={[
                    styles.profilePic,
                    {borderWidth: 2, borderColor: theme.colors.text},
                  ]}
                  source={{uri: image} as any}
                />
              )}
            </TouchableOpacity>

            <View
              style={{
                marginTop: 15,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={styles.usernameText}>{username}</Text>
              <View style={{flex: 1}}></View>
              <TouchableOpacity
                style={{
                  height: 40,
                  width: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() =>
                  navigation.navigate('editProfilePage', {
                    userID: userData?.userID,
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

            <View style={{flexDirection: 'row', gap: 10, marginBottom: 10}}>
              <TouchableOpacity
                style={styles.mainContainer}
                onPress={() =>
                  navigation.navigate('FollowersFollowing', {
                    type: 'followers',
                    username: userData?.username,
                  })
                }>
                <Text style={styles.mainContainerType}>
                  {userData?.followers ? userData?.followers.length : 0 ?? 0}{' '}
                  <Text style={{color: theme.colors.secondaryText}}>
                    Followers
                  </Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mainContainer}
                onPress={() =>
                  navigation.navigate('FollowersFollowing', {
                    type: 'following',
                    username: userData?.username,
                  })
                }>
                <Text style={styles.mainContainerType}>
                  {userData?.following ? userData?.following.length : 0 ?? 0}{' '}
                  <Text style={{color: theme.colors.secondaryText}}>
                    Following
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.bioText}>{userBio}</Text>
          </View>
        </View>

        <Text
          style={{
            color: theme.colors.text,
            marginTop: 20,
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
                color: theme.colors.accent,
              }}>
              Balance
            </Text>
            <Text
              style={{
                fontFamily: 'InterTight-Bold',
                fontSize: 20,
                color: theme.colors.text,
              }}>
              $100,000.00
            </Text>
          </View>
        </View>

        <View style={{marginTop: 10, marginHorizontal: 10, gap: 10}}>
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
              style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>
              Withdraw
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              flex: 1,
              paddingVertical: 15,
            }}>
            <Text
              style={{
                color: theme.colors.background,
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
              style={{width: 30}}
            />
            <Text
              style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>
              Payment Methods
            </Text>
            <View style={{flex: 1}} />
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
              style={{width: 30}}
            />
            <Text
              style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>
              Documents
            </Text>
            <View style={{flex: 1}} />
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
              style={{width: 30}}
            />
            <Text
              style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>
              Transfers
            </Text>
            <View style={{flex: 1}} />
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
              style={{width: 30}}
            />
            <Text
              style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>
              Activity
            </Text>
            <View style={{flex: 1}} />
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
              style={{width: 30}}
            />
            <Text
              style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>
              Watchlists
            </Text>
            <View style={{flex: 1}} />
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
              style={{width: 30}}
            />
            <Text
              style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>
              Settings
            </Text>
            <View style={{flex: 1}} />
            <FeatherIcons
              name="chevron-right"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={{marginVertical: 20}}>
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
      </ScrollView>
    </View>
  );
};

export default Profile;