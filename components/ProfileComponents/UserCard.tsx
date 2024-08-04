import { View, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import createProfileStyles from '../../styles/createProfileStyles';
import { getDownloadURL, ref } from 'firebase/storage';
import { Skeleton } from '@rneui/base';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'
import { serverUrl } from '../../constants/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserDetails from '../../hooks/useUserDetails';
import Icon from 'react-native-vector-icons/Entypo';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import { setChallengedFriend } from '../../GlobalDataManagment/matchmakingSlice';
import getProfileImage from '../../utility/getProfileImage';
import { addFriend } from '../../GlobalDataManagment/userSlice';

const UserCard = (props: any) => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [noPic, setNoPic] = useState(false)
  const [status, setStatus] = useState<string | null>("unfollowed")

  Icon.loadFont()

  const navigation = useNavigation<any>();

  const [hasDefaultProfileImage, setHasDefaultProfileImage] = useState<any>(null)

  const [username, setUsername] = useState<any>(null)

  const getUsername = async () => {
    try {
      const response = await axios.post(serverUrl + '/getUsernameByID', { userID: props.otherUserID });
      setUsername(response.data.username)
      console.log(response.data.username)
    } catch (error) {
      console.error("Error getting username")
    }
  }

  const isFriend = async () => {
    try {
      const response = await axios.post(serverUrl + "/friendShipCheck", { user1ID: user.userID, user2ID: props.otherUserID })
      if (response.status == 200) {
        if (response.data == true) {
          console.log("IS FRIEND", response.data)
          setStatus("accepted")
        }
      }
    } catch (error) {
      console.error("error checking if is friend")
    }
  }

  const checkRequestedStatus = async () => {
    try {
      const response = await axios.post(serverUrl + "/checkRequestedStatus", { yourUserID: user.userID, checkUserID: props.otherUserID })
      console.log("Is requested", response.data)
      if (response.data == true) {
        setStatus("requested")
      }
    } catch (error) {
      console.error("error checking requestedStatus", error)
    }
  }

  const acceptFriendRequest = async () => {
    try {
      const response = await axios.post(serverUrl + "/acceptFriendRequest", { acceptedUserID: user.userID, requesterUserID: props.otherUserID })
      if (response.status == 200) {
        console.log("accepted")
        dispatch(addFriend(props.otherUserID))
        setStatus("accepted")
      }
    } catch (error) {
      console.error("error accepting friend request")
    }
  }

  const unrequest = async () => {
    try {
      const response = await axios.post(serverUrl + "/deleteFriendRequest", { targetUserID: props.otherUserID, requesterUserID: user.userID })
      if (response.status == 200) {
        setStatus("unfollowed")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getUsername()
    checkRequestedStatus()
    isFriend()
    getProfileImage(props.otherUserID)
      .then(profileImageResponse => {
        if (profileImageResponse) {
          setHasDefaultProfileImage(profileImageResponse.hasDefaultProfileImage)
          setProfileImage(profileImageResponse.profileImage)
          setLoading(false)
        }
      })
      .catch(error => {
        console.error("error setting profile image", error)
      })
  }, [props.otherUserID]);


  const [imageLoading, setImageLoading] = useState(true)

  const [loadingRequest, setLoadingRequest] = useState(false)

  const user = useSelector((state: RootState) => state.user)

  const dispatch = useDispatch()

  const addFriendRequest = async () => {
    try {
      setStatus("requested")
      setLoadingRequest(true)
      const response = await axios.post(serverUrl + '/addFriendRequest', { userID: user.userID, requestedUserID: props.otherUserID })
      if (response.status === 200) {
        console.log("Friended", props.username)
        setLoadingRequest(false)
      }
    } catch (error) {
      Alert.alert(`Error Friending ${error}`)
    }
  }

  const handleChallengeFriend = () => {
    dispatch(setChallengedFriend({ userID: props.otherUserID, username: username, profileImageUri: profileImage, hasDefaultProfileImage: hasDefaultProfileImage }))
    navigation.goBack()
    console.log("Challenged", username)
  }

  //the button that shows up on right side of usercard
  const ActionButton = () => {
    if (props.isChallengeCard == true) {
      return (
        <TouchableOpacity style={{ paddingHorizontal: 15, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.accent2, borderRadius: 50 }} onPress={handleChallengeFriend}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>Challenge</Text>
          </View>
        </TouchableOpacity>
      )
    }

    else if (status == 'accepted') {
      console.log("HELOOoooooooooooo")
      return (
        <TouchableOpacity style={{ paddingHorizontal: 15, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.secondary, borderRadius: 50 }} onPress={handleChallengeFriend}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Icon name="dots-three-horizontal" size={22} color={theme.colors.text} />
          </View>
        </TouchableOpacity>)
    }

    else if (status == 'requested') {
      return (
        <TouchableOpacity onPress={unrequest} style={{ paddingHorizontal: 15, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, borderRadius: 50 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ color: theme.colors.tertiary, fontFamily: 'InterTight-Bold' }}>Requested</Text>
          </View>
        </TouchableOpacity>)
    }

    else if (props.incomingFriendRequest == true) {
      return (
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <TouchableOpacity onPress={acceptFriendRequest} style={{ paddingHorizontal: 15, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.accent2, borderRadius: 50 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>Accept</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingHorizontal: 15, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, borderRadius: 50 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>Delete</Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    }


    else {
      return (
        <TouchableOpacity onPress={addFriendRequest} style={{ paddingHorizontal: 15, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.secondary, borderRadius: 50 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>Add Friend</Text>
          </View>
        </TouchableOpacity>
      )
    }
  }


  if (props.yourUserID == props.otherUserID) {
    return <View />
  }

  if (loading || !status || !profileImage) {
    return (
      <View style={{ width: width - 40, marginHorizontal: 20, height: 50 }}>

      </View>
    );
  }


  //make ti grab fllowers on every new search not every usercard hella inefficnet

  return (
    <TouchableOpacity style={{ marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 10, maxWidth: width - 40 }} onPress={() => navigation.navigate("OtherProfile", { otherUserID: props.otherUserID })}>
      {profileImage &&

        <Image style={styles.userCardPic} onLoadEnd={() => setImageLoading(false)} source={hasDefaultProfileImage ? profileImage as any : { uri: profileImage }}></Image>}
      {(!imageLoading || noPic) &&

        <View style={{ flex: 1 }}>

          <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 15 }}>{username}</Text>

          {props.incomingFriendRequest == true && <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Regular', fontSize: 15 }}>friend request</Text>}


        </View>
      }
      {(!imageLoading || noPic) &&
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          <ActionButton />
        </View>}
    </TouchableOpacity>
  )
}

export default UserCard