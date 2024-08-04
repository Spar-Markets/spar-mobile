import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createProfileStyles from '../../styles/createProfileStyles';
import createGlobalStyles from '../../styles/createGlobalStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import { serverUrl } from '../../constants/global';
import timeAgo from '../../utility/timeAgo';
import FriendRequestCard from './FriendRequestCard';
import { useSelector } from 'react-redux';
import UserCard from './UserCard';

interface FriendRequest {
  createdAt: Date,
  userID: string
}

const ProfileActivity = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { width } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);

  const user = useSelector((state: any) => state.user)

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const getFriendRequests = async () => {
    try {
      const response = await axios.post(serverUrl + "/checkIncomingFriendRequests", { userID: user.userID });
      if (response.status === 200) {
        setFriendRequests(response.data);
        console.log("helllo", response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user.userID) {
      getFriendRequests();
    }
  }, [user.userID]);

  return (
    <View style={styles.container}>
      <PageHeader text="Notifications" />
      <View style={{ flex: 1 }}>
        {loading ? (
          <View></View>
        ) : (
          <FlatList
            data={friendRequests}
            keyExtractor={(item) => item.userID}
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (

              <UserCard incomingFriendRequest={true} otherUserID={item.userID} />

            )}
          />
        )}
      </View>
    </View>
  );
};

export default ProfileActivity;
