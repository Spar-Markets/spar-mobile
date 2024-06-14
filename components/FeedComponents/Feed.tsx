import React, { useEffect, useState } from 'react';
import { View, Image, TextInput, Text, FlatList, ListRenderItem, RefreshControl } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createFeedStyles from '../../styles/createFeedStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Gap from '../HomeComponents/Gap';
import Post from './Post';
import { useNavigation } from '@react-navigation/native';
import PostType from '../../types/PostType';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import { setPosts } from '../../GlobalDataManagment/postSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import timeAgo from '../../utility/timeAgo';

const Feed: React.FC = () => {
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createFeedStyles(theme, width);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false); 
  
  const posts = useSelector((state: RootState) => state.posts || []);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();  
  const userData = useSelector((state: any) => state.user.userData);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(serverUrl + "/posts");
      const fetchedPosts: PostType[] = response.data.posts.map((post: PostType) => ({
        ...post,
        postedTimeAgo: timeAgo(new Date(post.postedTime))
      }));

      dispatch(setPosts(fetchedPosts));

    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    const getUser = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        console.log(email);
      } catch (error) {
        console.error("Error getting user");
      }
    };

    getUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderItem: ListRenderItem<PostType> = ({ item }) => {
    return (
      <View key={item.postId}>
        <Post {...item} onComment={false}/>
        <Gap />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.profilePic} source={require('../../assets/images/profilepic.png')} />
        <View style={styles.searchSection}>
          <Icon name="search" style={{ color: theme.colors.tertiary }} size={24} />
          <TextInput
            placeholder="Search Posts, People..."
            placeholderTextColor={theme.colors.tertiary}
            onChangeText={setSearchQuery}
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={styles.searchInputContainer}
            selectionColor={theme.colors.accent}
          />
          <View style={{ flex: 1 }}></View>
        </View>
      </View>
      <Text style={styles.headerText}>Feed</Text>
      <FlatList 
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.postId}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
      />
      <View style={{ flexDirection: 'row', margin: 20 }}>
        <View style={{ flex: 1 }}></View>   
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreatePost')}>
          <Icon name="plus" size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Feed;
