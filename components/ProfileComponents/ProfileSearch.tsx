import React, { useState, useEffect, useCallback } from 'react';
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
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import debounce from 'lodash/debounce';
import CustomActivityIndicator from '../GlobalComponents/CustomActivityIndicator';
import SmallActivityIndicator from '../GlobalComponents/SmallActivityIndicator';


interface SearchProfile {
  userID: string;
  username: string;
}

const ProfileSearch = () => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createProfileStyles(theme, width);
  const route = useRoute();

  const navigation = useNavigation<any>();

  const user = useSelector((state: RootState) => state.user)

  const [userProfiles, setUserProfiles] = useState([]);
  const [profileSearch, setProfileSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const updateUserProfiles = async () => {
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

  }, []);

  const debouncedSetSearchResults = useCallback(
    debounce((results) => {
      console.log(results)
      setSearchResults(results);
      setLoading(false); // Stop loading after setting results
    }, 300), // 300ms debounce delay
    []
  );

  const handleSearch = async (text: string) => {
    setProfileSearch(text);
    setLoading(true); // Start loading
    if (text) {
      const results = fuzzysort.go(text, userProfiles, {
        keys: ['username'],
        limit: 7,
      });
      const formattedResults: SearchProfile[] = [];
      for (let result of results) {
        formattedResults.push(result.obj);
      }
      debouncedSetSearchResults(formattedResults);
    } else {
      debouncedSetSearchResults([]);
    }
  };


  return (
    <View style={styles.container}>
      <PageHeader text="Find People" />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 20,
          gap: 5,
          marginTop: 10
        }}
      >
        <TextInput
          style={[styles.searchBox, { flex: 1 }]}
          onChangeText={handleSearch}
          value={profileSearch}
          placeholder="Search Profiles..."
        />
      </View>
      <View style={{ flex: 1, marginTop: 10 }}>
        {profileSearch === '' ? (
          <View></View>
        ) : loading ? (
          <ActivityIndicator color={theme.colors.text} />
        ) : (

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.userID}
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <View>
                <UserCard otherUserID={item.userID} />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default ProfileSearch;
