import React, { useState, useEffect } from 'react';
import { View, Image, Text, Alert } from 'react-native';
import getProfileImage from '../../utility/getProfileImage';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import axios from 'axios'
import { serverUrl } from '../../constants/global';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { removeInvitation } from '../../GlobalDataManagment/userSlice';
import Ionicons from "react-native-vector-icons/Ionicons"
import EntypoIcons from "react-native-vector-icons/Entypo"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

interface Invitation {
  invitationID: string;
  challengerUserID: string;
  createdAt: number;
  mode: string;
  timeframe: number;
  type: string;
  wager: number;
}

interface HTHInvitationItemProps {
  item: Invitation;
}

const HTHInvitationItem: React.FC<HTHInvitationItemProps> = ({ item }) => {
  const [hasDefaultProfileImage, setHasDefaultProfileImage] = useState<boolean | null>(null);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true)

  Ionicons.loadFont()
  EntypoIcons.loadFont()
  MaterialCommunityIcons.loadFont()

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width)

  const [username, setUsername] = useState<any>(null)

  const user = useSelector((state: RootState) => state.user)

  const navigation = useNavigation<any>();

  useEffect(() => {
    console.log(item)
    const getUsername = async (userID: string) => {
      try {
        const response = await axios.post(serverUrl + "/getUsernameByID", { userID })
        if (response.status == 200) {
          setUsername(response.data.username)
        }
      } catch (error) {
        console.log(error)
      }
    }
    getUsername(item.challengerUserID)
    getProfileImage(item.challengerUserID)
      .then(profileImageResponse => {
        console.log("YAA", profileImageResponse);
        if (profileImageResponse) {
          console.log(profileImageResponse)
          setHasDefaultProfileImage(profileImageResponse.hasDefaultProfileImage);
          setProfileImage(profileImageResponse.profileImage);
        }
      })
      .catch(error => {
        console.error("Error setting profile image", error);
      })
      .finally(() => {
        setLoading(false)
      });
  }, [item.challengerUserID]);

  const dispatch = useDispatch()

  const handleAcceptInvite = async () => {
    try {
      // client side balance check
      if (user.balance == null || item.wager * 1.1 > user.balance) {
        Alert.alert('You are broke. Insufficient funds.');
        return;
      }
      console.log("HANDLING INVITE ACCEPT:", item.invitationID, user.userID, user.balance)
      const response = await axios.post(serverUrl + "/acceptChallenge", { invitationID: item.invitationID, invitedUserID: user.userID, balance: user.balance })
      if (response.status = 200) {
        navigation.goBack()
        dispatch(removeInvitation(item.invitationID))
      }
    } catch (error) {
      console.error("server error", error)
    }
  }

  if (loading) {
    return <View />
  }

  return (
    <View style={{
      padding: 10, backgroundColor: theme.colors.secondary, borderColor: theme.colors.tertiary, borderWidth: 1, borderRadius: 20
    }}>
      {profileImage && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <Image
              style={{ height: 60, width: 60, borderRadius: 50, borderWidth: 1, borderColor: theme.colors.secondary }}
              source={hasDefaultProfileImage ? profileImage : { uri: profileImage }}
            />
            <View style={{ gap: 5 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 20 }}>{username}</Text>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <View style={{ flexDirection: 'row', backgroundColor: theme.colors.gameCardGrayAccent, gap: 5, borderColor: theme.colors.gameCardGrayBorder, borderWidth: 2, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="gift" size={14} color={theme.colors.opposite} />
                  <Text style={{ fontFamily: 'InterTight-Bold', color: theme.colors.text }}>${item.wager}</Text>
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: theme.colors.gameCardGrayAccent, gap: 5, borderColor: theme.colors.gameCardGrayBorder, borderWidth: 2, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                  <EntypoIcons name="area-graph" size={14} color={theme.colors.opposite} />
                  <Text style={{ fontFamily: 'InterTight-Bold', color: theme.colors.text }}>{item.mode}</Text>
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: theme.colors.gameCardGrayAccent, gap: 5, borderColor: theme.colors.gameCardGrayBorder, borderWidth: 2, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="sword-cross" size={14} color={theme.colors.opposite} />
                  <Text style={{ fontFamily: 'InterTight-Bold', color: theme.colors.text }}>{item.type}</Text>
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: theme.colors.gameCardGrayAccent, gap: 5, borderColor: theme.colors.gameCardGrayBorder, borderWidth: 2, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="timer" size={14} color={theme.colors.opposite} />
                  <Text style={{ fontFamily: 'InterTight-Bold', color: theme.colors.text }}>{item.timeframe == 900 ? "15m" : item.timeframe == 86400 ? "1d" : "1w"}</Text>
                </View>
              </View>
            </View>

          </View>

          <View style={{ flexDirection: 'row', gap: 5, marginTop: 20 }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={handleAcceptInvite} style={{ borderRadius: 15, height: 60, backgroundColor: theme.colors.accent2, borderColor: theme.colors.accent2, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', padding: 10 }}>Join Challenge (${item.wager})</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity style={{ borderRadius: 15, backgroundColor: theme.colors.opposite, alignItems: 'center', justifyContent: 'center', height: 60, width: 60 }}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
          </View>

        </View>

      )}
    </View>
  );
};

export default HTHInvitationItem;
