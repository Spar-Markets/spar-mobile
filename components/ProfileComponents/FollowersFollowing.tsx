import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { serverUrl } from '../../constants/global';
import fuzzysort from 'fuzzysort';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createProfileStyles from '../../styles/createProfileStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import UserCard from './UserCard';
import useUserDetails from '../../hooks/useUserDetails';
import { useSelector } from 'react-redux';

interface SearchProfile {
  userID: string;
  username: string;
}

const FollowersFollowing = (props:any) => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const route = useRoute();

  const navigation = useNavigation<any>();

  const {userData} = useUserDetails()
  const user = useSelector((state: any) => state.user)
  

  const [userProfiles, setUserProfiles] = useState([]);
  const [profileSearch, setProfileSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const params = route.params as any

  /*const updateUserProfiles = async () => {
    try {
      const response = await axios.post(serverUrl + '/getProfileList');
      if (response.status === 200) {
        setUserProfiles(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    updateUserProfiles();
  }, []);*/

  const handleSearch = async (text: string) => {
    setProfileSearch(text);
    setLoading(true); // Start loading
    if (text) {
      const results = fuzzysort.go(text, userProfiles, {
        keys: ['username'],
        limit: 7,
      });
      console.log(results);
      const formattedResults: SearchProfile[] = [];
      for (let result of results) {
        formattedResults.push(result.obj);
      } 
      setSearchResults(formattedResults);
    } else {
      setSearchResults([]);
    }
    setLoading(false); // Stop loading after processing results
  };

  return (
    <View style={styles.container}>
      <PageHeader text={params?.username} />
      <View
        style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 20,
          gap: 5,
        }}
      >
        <TextInput
          style={[styles.searchBox, { flex: 1, marginTop: 10 }]}
          onChangeText={handleSearch}
          value={profileSearch}
          placeholder="Search"
        />
      </View>
      <View style={{ flex: 1, marginTop: 10}}>
        {profileSearch === '' ? (
          <View></View>
        ) : loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.username}
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <View>
                <UserCard username={item.username} otherUserID={item.userID} yourUserID={user.userID} following={userData?.following}/>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default FollowersFollowing;
