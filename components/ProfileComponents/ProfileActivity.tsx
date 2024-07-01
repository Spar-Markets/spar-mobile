import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createProfileStyles from '../../styles/createProfileStyles';
import createGlobalStyles from '../../styles/createGlobalStyles';
import useUserDetails from '../../hooks/useUserDetails';
import PageHeader from '../GlobalComponents/PageHeader';
import { serverUrl } from '../../constants/global';
import timeAgo from '../../utility/timeAgo';
import FriendRequestCard from './FriendRequestCard';

interface FriendRequest {
  createdAt: Date,
  from: string,
  status: string
}

const ProfileActivity = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { width } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);

  const { userData } = useUserDetails();

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const getFriendRequests = async () => {
    try {
      const response = await axios.post(serverUrl + "/checkIncomingFriendRequests", { userID: userData?.userID });
      if (response.status === 200) {
        setFriendRequests(response.data.incomingRequests);
        console.log(response.data.incomingRequests);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userData?.userID) {
      getFriendRequests();
    }
  }, [userData?.userID]);

  return (
    <View style={styles.container}>
      <PageHeader text="Activity" />
      <View style={{ flex: 1 }}>
        {loading ? (
          <View></View>
        ) : (
          <FlatList
            data={friendRequests}
            keyExtractor={(item) => item.from}
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
 
              <FriendRequestCard otherUserID={item.from} userID={userData?.userID}/>
              
            )}
          />
        )}
      </View>
    </View>
  );
};

export default ProfileActivity;
