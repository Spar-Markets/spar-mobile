import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import {TouchableOpacity} from 'react-native-gesture-handler';
import createProfileStyles from '../../styles/createProfileStyles';
import {getDownloadURL, ref} from 'firebase/storage';
import {storage} from '../../firebase/firebase';
import {Skeleton} from '@rneui/base';
import {Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {serverUrl} from '../../constants/global';

const FriendRequestCard = (props: any) => {
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createProfileStyles(theme, width);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [noPic, setNoPic] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const navigation = useNavigation<any>();

  useEffect(() => {
    const getProfileImage = async () => {
      const imageRef = ref(storage, `profileImages/${props.otherUserID}`);
      try {
        try {
          const url = await getDownloadURL(imageRef);
          if (url) {
            setProfileImage(url);
            setNoPic(false);
          } else {
            setNoPic(true);
          }
        } catch {
          setNoPic(true);
        }

        const response = await axios.post(serverUrl + '/getUsernameByID', {
          userID: props.otherUserID,
        });
        console.log(response.data.username);
        if (response) {
          setUsername(response.data.username);
        }
      } catch (error) {
        console.log('Error fetching profile image: ', error);
        setLoading(false);
        setNoPic(false);
      }
      setLoading(false);
    };
    getProfileImage();
  }, []);

  const [acceptRequestStatus, setAcceptRequestStatus] =
    useState<string>('none');

  useEffect(() => {
    if (profileImage || noPic == true) {
      setLoading(false);
    }
  }, []);

  const acceptFollowRequest = async () => {
    try {
      const response = await axios.post(serverUrl + '/acceptFollowRequest', {
        userID: props.userID,
        otherUserID: props.otherUserID,
      });
      if (response.status === 200) {
        setAcceptRequestStatus('Accepted');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [loadingImage, setLoadingImage] = useState(true);

  if (loading || username == null) {
    return <View></View>;
  }

  return (
    <View style={{flexDirection: 'row', alignItems: 'center', paddingTop: 10}}>
      <TouchableOpacity
        style={{
          marginLeft: 20,
          flexDirection: 'row',
          height: 50,
          alignItems: 'center',
          gap: 10,
        }}
        onPress={() =>
          navigation.navigate('OtherProfile', {otherUserID: props.userID})
        }>
        {profileImage && (
          <Image
            style={[styles.userCardPic, {width: 50, height: 50}]}
            source={{uri: profileImage}}
            onLoad={() => setLoadingImage(false)}></Image>
        )}
        {noPic == true && (
          <View
            style={[
              styles.userCardPic,
              {
                backgroundColor: theme.colors.background,
                borderWidth: 1,
                borderColor: theme.colors.tertiary,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
            <Text
              style={{
                fontFamily: 'InterTight-Black',
                color: theme.colors.text,
              }}>
              {username.slice(0, 1)}
            </Text>
          </View>
        )}
        {(!loadingImage || noPic) && (
          <Text
            style={{
              color: theme.colors.text,
              fontFamily: 'InterTight-Bold',
              fontSize: 18,
            }}>
            {username}
          </Text>
        )}
      </TouchableOpacity>
      <View style={{flex: 1}}></View>
      {(!loadingImage || noPic) && (
        <View
          style={{
            flexDirection: 'row',
            gap: 5,
            marginHorizontal: 20,
            height: '100%',
            alignItems: 'center',
          }}>
          {acceptRequestStatus == 'none' && (
            <TouchableOpacity
              onPress={acceptFollowRequest}
              style={{
                backgroundColor: theme.colors.accent,
                height: '60%',
                width: width / 5,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}>
              <Text
                style={{
                  color: theme.colors.background,
                  fontFamily: 'InterTight-Bold',
                }}>
                Accept
              </Text>
            </TouchableOpacity>
          )}
          {acceptRequestStatus == 'none' && (
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.tertiary,
                height: '60%',
                width: width / 5,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'InterTight-Bold',
                }}>
                Decline
              </Text>
            </TouchableOpacity>
          )}
          {acceptRequestStatus == 'Accepted' && (
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.tertiary,
                height: '60%',
                width: width / 2.5,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: 'InterTight-Bold',
                }}>
                Success
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default FriendRequestCard;
