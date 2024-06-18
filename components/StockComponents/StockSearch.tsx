import React, {useState, useEffect} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  NativeModules,
  TextInput,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {serverUrl} from '../../constants/global';
import StockCard from '../StockCard';
import {Search} from 'js-search';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';

import useUserDetails from '../../hooks/useUserDetails';
import SearchCard from './SearchCard';

interface stockObject {
  ticker: string;
  companyName: string;
}

const StockSearch = () => {

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width);

  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [stockSearch, setStockSearch] = useState('');
  const [listOfTickers, setListOfTickers] = useState<stockObject[]>([]);
  const [searchResults, setSearchResults] = useState<stockObject[]>([]);

  const goBack = () => {
    navigation.goBack();
  };

  const updateTickerList = async () => {
    const response = await axios.get(serverUrl + '/getTickerList');
    setListOfTickers(response.data);
  };

  const { userData } = useUserDetails();

  useEffect(() => {
    updateTickerList();
  }, []);

  const handleSearch = async (text: string) => {
    setStockSearch(text);
    if (text) {
      // if there is search data, perform the search
      // Initialize the search instance
      const search = new Search('ticker');

      // Add indexes to search across both ticker and companyName
      search.addIndex('ticker');
      search.addIndex('companyName');

      // Add array of data
      search.addDocuments(listOfTickers);

      // Get search results (array of objects)
      const results: stockObject[] = search.search(text) as stockObject[];

      // get first 5 results
      const firstFiveResults: stockObject[] = results.slice(0, 10);

      setSearchResults(firstFiveResults);
    }
  };

  const CategoryButton = (category: string) => {
    return (
      <TouchableOpacity style={{backgroundColor: theme.colors.primary, borderRadius: 10}}>
        <Text
          style={styles.categoryButton}>
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Discover</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Icon name="search" style={[styles.icon, { marginRight: 5 }]} size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Menu")}>
          <Icon name="bars" style={styles.icon} size={24} />
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchBox}
        onChangeText={handleSearch}
        value={stockSearch}
        placeholder="Search Stocks, Crypto..."
      />
      <View style={{}}>
        {stockSearch == '' ? (
          <View style={{marginHorizontal: 20}}>
            <Text
              style={{
                fontFamily: 'InterTight-Black',
                color: 'white',
                fontSize: 14,
              }}>
              Explore by Category
            </Text>
            <View style={{flexDirection: 'row', gap: 5, marginTop: 15}}>
              {CategoryButton('Artifical Intelligence')}
              {CategoryButton('Semiconductors')}
              {CategoryButton('Biotechnology')}
            </View>
            <View style={{flexDirection: 'row', gap: 5, marginTop: 10}}>
              {CategoryButton('Consumer Discretionary')}
              {CategoryButton('Financials')}
              {CategoryButton('Energy')}
            </View>
          </View>
        ) : (
          <View>
            <FlatList
              data={searchResults}
              keyExtractor={item => item.ticker}
              renderItem={({item}) => (
                <View>
                  {/* <Text style={{color: '#FFFFFF'}}>
                    {item.ticker} - {item.companyName}
                  </Text> */}
                  <SearchCard
                    ticker={item.ticker} name={item.companyName}/>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default StockSearch;
