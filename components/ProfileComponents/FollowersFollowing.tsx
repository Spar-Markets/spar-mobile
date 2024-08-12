import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  TextBase,
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
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';

interface searchResult {
  userID: string,
  username: string
}


const FollowersFollowing = () => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const route = useRoute();

  const navigation = useNavigation<any>();

  const user = useSelector((state: any) => state.user)
  const friends = useSelector((state: RootState) => state.user.friends)

  const [profileSearch, setProfileSearch] = useState("");
  const [searchResults, setSearchResults] = useState<searchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const profileObjects = useRef<any>([])

  const getProfileObjects = async () => {
    try {
      console.log("friends", friends)

      const response = await axios.post(serverUrl + "/getUsernamesByIDs", { userIDs: friends })
      if (response.status == 200) {
        console.log(response.data)
        profileObjects.current = response.data
      }
    } catch (error) {
      console.error("error getting friend usernames", error)
    }
  }

  useEffect(() => {
    getProfileObjects()
  }, [])

  //TODO: endpoint to 

  const handleSearch = async (text: string) => {

    setProfileSearch(text);
    setLoading(true); // Start loading
    if (text) {
      const results = fuzzysort.go(text, profileObjects.current, {
        keys: ['username'],
        limit: 7,
      });
      console.log("RESULTS", results);
      const formattedResults: any[] = results.map(result => result.obj);
      setSearchResults(formattedResults);
    } else {
      setSearchResults([]);
    }
    setLoading(false); // Stop loading after processing results
  };

  //make renderItem a component because you need to fetch username from userID, maybe inline function for getting username?

  return (
    <View style={styles.container}>
      <PageHeader text={"Challenge a Friend"} />
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
      <View style={{ flex: 1, marginTop: 10 }}>
        {profileSearch === '' ? (
          <FlatList
            data={friends}
            keyExtractor={(item) => item}
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <View>
                <UserCard otherUserID={item} isChallengeCard={true} />
              </View>
            )}
          />
        ) : loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          searchResults?.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.userID}
              keyboardDismissMode="on-drag"
              renderItem={({ item }) => (
                <View>
                  <UserCard otherUserID={item.userID} isChallengeCard={true} />
                </View>
              )}
            />
          ) : (
            <Text style={styles.friendText}>No Friends Found</Text>
          ))}
      </View>
    </View>
  );
};

export default FollowersFollowing;
