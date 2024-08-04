import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  SectionList,
  useColorScheme,
  FlatList,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import fuzzysort from 'fuzzysort';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import useUserDetails from '../../hooks/useUserDetails';
import SearchCard from './SearchCard';
import { serverUrl } from '../../constants/global';
import UserCard from '../ProfileComponents/UserCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DiscoverNewsCard from './DiscoverNewsCard';
import timeAgo from '../../utility/timeAgo';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome'

interface StockObject {
  ticker: string;
  companyName: string;
}

interface ProfileObject {
  username: string;
  userID: string;
}

interface CombinedObject {
  ticker?: string;
  companyName?: string;
  username?: string;
  userID?: string;
  type: 'profile' | 'stock';
}

const StockSearch: React.FC = () => {
  const { theme } = useTheme();
  const { width } = useDimensions();
  const styles = createStockSearchStyles(theme, width);

  const navigation = useNavigation<any>();
  const [stockSearch, setStockSearch] = useState('');
  const [listOfTickers, setListOfTickers] = useState<StockObject[]>([]);
  const [listOfProfiles, setProfileList] = useState<ProfileObject[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [news, setNews] = useState<any>()

  const [isFocused, setIsFocused] = useState(false);

  const { userData } = useUserDetails();
  const user = useSelector((state: any) => state.user)

  const [following, setFollowing] = useState<String[]>([])
  const [followers, setFollowers] = useState<String[]>([])

  const goBack = () => {
    navigation.goBack();
  };


  const updateTickerList = async () => {
    try {
      const response = await axios.get(serverUrl + '/getTickerList');
      const response2 = await axios.post(serverUrl + '/getProfileList');
      const response3 = await axios.post(serverUrl + '/getNews')
      const tickerlistresponse = response.data;
      const profileListResponse = response2.data;
      const newsResponse = response3.data.results;
      console.log(profileListResponse)

      setProfileList(profileListResponse);
      setListOfTickers(tickerlistresponse);
      setNews(newsResponse)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateProfileList = async () => {
    try {
      const response = await axios.post(serverUrl + '/getProfileList');
      if (response.status == 200) {
        console.log("updating profile list")
        setProfileList(response.data);
      }
    } catch (error) {
      console.log("error updating profile list", error)
    }
  }

  useEffect(() => {
    updateTickerList();
    console.log("News", news)
  }, []);

  const handleSearch = (text: string) => {
    setStockSearch(text);
    setFollowing(userData?.following ?? [])
    setFollowers(userData?.followers ?? [])
    if (text) {
      const stockResults = fuzzysort.go(text, listOfTickers, {
        keys: ['ticker', 'companyName'],
        limit: 5,
      });

      const profileResults = fuzzysort.go(text, listOfProfiles, {
        keys: ['username'],
        limit: 7,
      });

      const formattedStockResults = stockResults.map(result => ({
        ...result.obj,
        type: 'stock',
      }));
      const formattedProfileResults = profileResults.map(result => ({
        ...result.obj,
        type: 'profile',
      }));

      const sections = [
        { title: 'Stocks', data: formattedStockResults },
        { title: 'Profiles', data: formattedProfileResults },
      ].filter(section => section.data.length > 0);

      setSections(sections);
    } else {
      setSections([]);
    }
  };


  const renderItem = ({ item }: { item: CombinedObject }) => {
    if (item.type === 'profile') {
      return <UserCard username={item.username} otherUserID={item.userID} yourUserID={user.userID} following={following} followers={followers} />;
    }
    return <SearchCard ticker={item.ticker} name={item.companyName} />;
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={[title == "Profiles" && { paddingVertical: 10 }, { backgroundColor: theme.colors.background, marginHorizontal: 20 }]}>
      <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold', fontSize: 24 }}>{title}</Text>
    </View>
  );

  const newsRenderItem = ({ item }: any) => {
    return (
      <DiscoverNewsCard
        title={item.title}
        publisherName={item.author}
        timePublished={new Date(item.published_utc).toLocaleTimeString()}
        article_url={item.article_url}
        image_url={item.image_url}
        relatedTickers={item.tickers} />
    )
  }

  useEffect(() => {
    if (stockSearch == "") {
      updateProfileList()
    }
  }, [stockSearch])


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Discover</Text>
      </View>
      <View style={[styles.searchBox, isFocused && { borderWidth: 2, borderColor: theme.colors.text }]}>
        <Icon name="search" size={20} color={isFocused ? theme.colors.text : theme.colors.tertiary} />
        <TextInput
          style={{ flex: 1, color: theme.colors.text, height: 35, borderRadius: 5 }}
          onChangeText={handleSearch}
          value={stockSearch}
          placeholder="Search Assets & People..."
          placeholderTextColor={theme.colors.tertiary}
          onFocus={async () => await updateProfileList()}
        />
      </View>
      <View style={{ flex: 1 }}>
        {stockSearch === '' ? (
          <FlatList
            data={news}
            renderItem={newsRenderItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => {
              return (<View style={{ width: width - 40, height: 2, backgroundColor: theme.colors.primary, marginHorizontal: 20 }} />)
            }}
            keyboardDismissMode='on-drag'
            keyboardShouldPersistTaps="always"
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.type === 'profile' ? item.username! : item.ticker!}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode='on-drag'

          />
        )}
      </View>
    </View>
  );
};

export default StockSearch;
