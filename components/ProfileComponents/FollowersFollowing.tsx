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
import { RootState } from '../../GlobalDataManagment/store';


const FollowersFollowing = () => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const route = useRoute();

  const navigation = useNavigation<any>();

  const user = useSelector((state: any) => state.user)
  const friends = useSelector((state: RootState) => state.user.friends)
  
  const [profileSearch, setProfileSearch] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(friends)
  }, [])

  //TODO: endpoint to 

  const handleSearch = async (text: string) => {
    
    setProfileSearch(text);
    setLoading(true); // Start loading
    if (text) {
      const results = fuzzysort.go(text, friends, {
        keys: ['username'],
        limit: 7,
      });
      console.log(results);
      const formattedResults: string[] = [];
      for (let result of results) {
        formattedResults.push(result.obj);
      } 
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
      <View style={{ flex: 1, marginTop: 10}}>
        {profileSearch === '' ? (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.username}
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <View>
                <UserCard username={item.username} otherUserID={item.userID} yourUserID={user.userID} following={following} followers={followers} isChallengeCard={true}/>
              </View>
            )}
          />
        ) : loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.username}
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <View>
                <UserCard username={item.username} otherUserID={item.userID} yourUserID={user.userID} following={following} followers={followers} isChallengeCard={true}/>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default FollowersFollowing;
