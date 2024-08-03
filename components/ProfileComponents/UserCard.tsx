import { View, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import createProfileStyles from '../../styles/createProfileStyles';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase/firebase';
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
import { addFollowing } from '../../GlobalDataManagment/userSlice';
import { setChallengedFriend } from '../../GlobalDataManagment/matchmakingSlice';
import getProfileImage from '../../utility/getProfileImage';


const UserCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createProfileStyles(theme, width);
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [noPic, setNoPic] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    Icon.loadFont()

    const navigation = useNavigation<any>();

    const following = props.following
    const followers = props.followers

    const checkFollowStatus = async () => {
      try {
        console.log("USER ID PASSED", props.yourUserID)
        console.log("OTHER USER ID PASSED", props.otherUserID)
        const response = await axios.post(serverUrl + '/checkFollowStatus', {userID: props.yourUserID, otherUserID: props.otherUserID});
        setStatus(response.data.status);
        console.log("DO U FOLLOW", props.username, response.data.status)
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    const [hasDefaultProfileImage, setHasDefaultProfileImage] = useState<any>(null)
    
    useEffect(() => {

        checkFollowStatus()
        
        getProfileImage(props.otherUserID)
        .then(profileImageResponse => {
          console.log("YAA", profileImageResponse);
          if (profileImageResponse) {
            setHasDefaultProfileImage(profileImageResponse.hasDefaultProfileImage)
            setProfileImage(profileImageResponse.profileImage)
          }
        })
        .catch(error => {
          console.error("error setting profile image", error)
        })
      }, [props.otherUserID]);
    
    useEffect(() => {
        if (profileImage) {
            setLoading(false)
        }
    }, [profileImage])

    const [imageLoading, setImageLoading] = useState(true)

    const user = useSelector((state: RootState) => state.user)

    const dispatch = useDispatch()

    const requestFollow = async () => {
      try {
          console.log({userID: user.userID, otherUserID: props.otherUserID, yourUsername: user.username, otherUsername: props.username})
          const response = await axios.post(serverUrl + '/addFollowRequest', {userID: user.userID, otherUserID: props.otherUserID, yourUsername: user.username, otherUsername: props.username})
          if (response.status === 200) {
              console.log("Followed", props.username)
              dispatch(addFollowing({userID: props.otherUserID, username: props.username}))
              setStatus("pending")
          }
      } catch (error) {
          Alert.alert(`Error Following ${error}`)
      }
    }

    const findFollowerByID = (userID:string) => {
      return followers.find((user:any) => user.userID === userID);
    };

    const findFollowingByID = (userID:string) => {
      return following.find((user:any) => user.userID === userID);
    };

    const handleChallengeFriend = () => {
      dispatch(setChallengedFriend({userID: props.otherUserID, username: props.username, profileImageUri: profileImage, hasDefaultProfileImage: hasDefaultProfileImage}))
      navigation.goBack()
      console.log("Challenged", props.username)
    }


    //the button that shows up on right side of usercard
    const ActionButton = () => {
      if (props.isChallengeCard == true) {
        return (
          <TouchableOpacity style={{paddingHorizontal: 15, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.accent2, borderRadius: 10}} onPress={handleChallengeFriend}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>Challenge</Text>
              </View>
          </TouchableOpacity>)
      }
      if (status == 'pending') {
        return (
        <View style={{paddingHorizontal: 15, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, borderRadius: 50}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text style={{color: theme.colors.tertiary, fontFamily: 'InterTight-Bold'}}>Pending</Text>
            </View>
        </View>)
      } else if (findFollowingByID(props.otherUserID) == null) {
        return (
        <TouchableOpacity onPress={requestFollow} style={{paddingHorizontal: 15, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.secondary, borderRadius: 50}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>Follow</Text>
              {/*<Icon name="plus-circle" size={14} color={theme.colors.text}/>*/}
            </View>
        </TouchableOpacity>)
      } else if (findFollowingByID(props.otherUserID) != null) {
        return (
          <View style={{paddingHorizontal: 15, height: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.accent2, borderRadius: 50}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>Followed</Text>
              {/*<Icon name="check-circle" size={14} color={theme.colors.text}/>*/}
            </View>
          </View>
        )
      }
    }

    if (props.yourUserID == props.otherUserID) {
      return <View></View>
    }
    
    if (loading || !status) {
        return (
          <View style={{width: width-40, marginHorizontal: 20, height: 50}}>
            
          </View>
        );
      }


    //make ti grab fllowers on every new search not every usercard hella inefficnet

    return (
        <TouchableOpacity style={{marginHorizontal: 20, flexDirection: 'row', height: 70, alignItems: 'center', gap: 15}} onPress={() => navigation.navigate("OtherProfile", {otherUserID: props.otherUserID})}>
            {profileImage && <Image style={styles.userCardPic} onLoadEnd={() => setImageLoading(false)} source={hasDefaultProfileImage ? profileImage as any : {uri: profileImage}}></Image>}
            {(!imageLoading || noPic) && <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 18}}>{props.username}</Text>}
            <View style={{flex: 1}}></View>
            {(!imageLoading || noPic) && 
            <View style={{flexDirection: 'row', gap: 5, height: 25}}>
            <ActionButton/>
            <TouchableOpacity style={{paddingHorizontal: 5, borderRadius: 10, height: '100%', alignItems: 'center', justifyContent: 'center'}}>
              <Icon name="dots-three-horizontal" color={theme.colors.text} size={24}/>
            </TouchableOpacity>
            </View>}
        </TouchableOpacity>
    )
}

export default UserCard