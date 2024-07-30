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
import Icon from 'react-native-vector-icons/FontAwesome';

const UserCard = (props:any) => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createProfileStyles(theme, width);
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [noPic, setNoPic] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    const navigation = useNavigation<any>();

    const [following, setFollowing] = useState(props.following)
    const [followers, setFollowers] = useState(props.followers)

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
    
    useEffect(() => {
        const getProfileImage = async () => {
          const imageRef = ref(storage, `profileImages/${props.otherUserID}`);
          try {
            const url = await getDownloadURL(imageRef);
            console.log(props.username, url);
            if (url) {
              setProfileImage(url);
              setNoPic(false);
            } else {
              setNoPic(true)
            }
          } catch (error) {
            setNoPic(true);
          }
          setLoading(false);
        };
        checkFollowStatus()
        getProfileImage();
      }, [props.otherUserID, props.username]);
    
    useEffect(() => {
        if (profileImage || (noPic == true)) {
            setLoading(false)
        }
    }, [profileImage])

    const [imageLoading, setImageLoading] = useState(true)

    const requestFollow = async () => {
      try {
          const response = await axios.post(serverUrl + '/addFollowRequest', {userID: props.yourUserID, otherUserID: props.otherUserID})
          if (response.status === 200) {
              console.log("Followed", props.username)
              setFollowing((prevFollowing:any) => [...prevFollowing, props.otherUserID]);
              setStatus("pending")
          }
      } catch {
          Alert.alert("Error Following")
      }
    }


    //the button that shows up on right side of usercard
    const ActionButton = () => {
      if (status == 'pending') {
        return (
        <View style={{paddingHorizontal: 15, paddingVertical: 6, backgroundColor: theme.colors.primary, borderRadius: 5}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text style={{color: theme.colors.tertiary, fontFamily: 'InterTight-Bold'}}>Pending</Text>
              <Icon name="spinner" size={14} color={theme.colors.tertiary}/>
            </View>
        </View>)
      } else if (following.includes(props.otherUserID) == false) {
        return (
        <TouchableOpacity onPress={requestFollow} style={{paddingHorizontal: 15, paddingVertical: 6, backgroundColor: theme.colors.secondary, borderRadius: 5}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>Follow</Text>
              <Icon name="plus-circle" size={14} color={theme.colors.text}/>
            </View>
        </TouchableOpacity>)
      } else if (followers.includes(props.otherUserID) == true) {
        return (
          <View style={{paddingHorizontal: 15, paddingVertical: 6, backgroundColor: theme.colors.purpleAccent, borderRadius: 5}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>Followed</Text>
              <Icon name="check-circle" size={14} color={theme.colors.text}/>
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
          <View>
            
          </View>
        );
      }


    //make ti grab fllowers on every new search not every usercard hella inefficnet

    return (
        <TouchableOpacity style={{marginHorizontal: 20, flexDirection: 'row', height: 50, alignItems: 'center', gap: 20}} onPress={() => navigation.navigate("OtherProfile", {otherUserID: props.otherUserID})}>
            {profileImage && <Image style={styles.userCardPic} onLoad={() => setImageLoading(false)} source={{uri: profileImage}}></Image>}
            {noPic == true && 
            <View style={[styles.userCardPic, {backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.tertiary, justifyContent: 'center', alignItems: 'center'}]}>
                <Text style={{fontFamily: 'InterTight-Black', color: theme.colors.text}}>{props.username.slice(0,1)}</Text>
            </View>}
            {(!imageLoading || noPic) && <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 15}}>{props.username}</Text>}
            <View style={{flex: 1}}></View>
            {(!imageLoading || noPic) && <ActionButton/>}
        </TouchableOpacity>
    )
}

export default UserCard