import React, { useState, useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import getProfileImage from '../../utility/getProfileImage';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import axios from 'axios'
import { serverUrl } from '../../constants/global';
import { TouchableOpacity } from 'react-native-gesture-handler';

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

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width)

  const [username, setUsername] = useState<any>(null)

  useEffect(() => {
    console.log(item)
    const getUsername = async (userID:string) => {
        try {
            const response = await axios.post(serverUrl + "/getUsernameByID", {userID})
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

  if (loading) {
    return <View/>
  }

  return (
    <View style={{ padding: 10, backgroundColor: theme.colors.primary, borderRadius: 10}}>
      {profileImage && (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15}}>
                <Image
                    style={{ height: 60, width: 60, borderRadius: 50 }}
                    source={hasDefaultProfileImage ? profileImage : { uri: profileImage }}
                />
                <View style={{gap: 5}}>
                    <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 20}}>{username}</Text>
                    <View style={{flexDirection: 'row', gap: 5}}>
                        <View style={{backgroundColor: theme.colors.secondary, paddingVertical: 3, paddingHorizontal: 5, borderRadius: 5}}>
                            <Text style={{fontFamily: 'InterTight-Bold', color: theme.colors.text}}>${item.wager}</Text>
                        </View>
                        <View style={{backgroundColor: theme.colors.secondary, paddingVertical: 3, paddingHorizontal: 5, borderRadius: 5}}>
                            <Text style={{fontFamily: 'InterTight-Bold', color: theme.colors.text}}>{item.mode}</Text>
                        </View>
                        <View style={{backgroundColor: theme.colors.secondary, paddingVertical: 3, paddingHorizontal: 5, borderRadius: 5}}>
                            <Text style={{fontFamily: 'InterTight-Bold', color: theme.colors.text}}>{item.type}</Text>
                        </View>
                        <View style={{backgroundColor: theme.colors.secondary, paddingVertical: 3, paddingHorizontal: 5, borderRadius: 5}}>
                            <Text style={{fontFamily: 'InterTight-Bold', color: theme.colors.text}}>{item.timeframe == 900 ? "15m" : item.timeframe == 86400 ? "1d" : "1w"}</Text>
                        </View>
                    </View>
                </View>
                
            </View>
            
            <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity style={{borderRadius: 50, backgroundColor: theme.colors.accent2, borderWidth: 2, borderColor: theme.colors.accent2, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{color: theme.colors.text,fontFamily: 'InterTight-Bold', padding: 10}}>Accept (${item.wager})</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                    <TouchableOpacity style={{borderRadius: 50, borderColor: theme.colors.opposite, borderWidth: 2, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold', padding: 10}}>Decline</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>

      )}
    </View>
  );
};

export default HTHInvitationItem;
