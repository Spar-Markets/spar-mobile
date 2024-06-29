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
import fuzzysort from 'fuzzysort';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';

import useUserDetails from '../../hooks/useUserDetails';
import SearchCard from './SearchCard';
import GainerCard from './GainerCard';

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
  const [gainerList, setGainerList] = useState<any[]>([])

  useEffect(() => {
    const getGainers = async () => {
      try {
        console.log("Getting Gainers");
        const response = await axios.post(serverUrl + '/getGainers');
        if (response.data) {
          setGainerList(response.data.tickers)
        }
      } catch (error) {
        console.error("Error fetching gainers:", error);
      }
    };
  
    getGainers();
  }, []);

  useEffect(() => {
    updateTickerList();
  }, []);

  const handleSearch = async (text: string) => {
    setStockSearch(text);
    if (text) {
      const results = fuzzysort.go(text, listOfTickers, {
        keys: ['ticker', 'companyName'],
        limit: 7
      })

      const formattedResults: stockObject[] = []
      for (let result of results) {
        formattedResults.push(result.obj);
      }

      setSearchResults(formattedResults);
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
      </View>
      <TextInput
        style={styles.searchBox}
        onChangeText={handleSearch}
        value={stockSearch}
        placeholder="Search Stocks, Crypto..."
      />
      <View style={{}}>
        {stockSearch == '' ? (
          /*<View style={{marginHorizontal: 20}}>
            <Text
              style={{
                fontFamily: 'InterTight-Black',
                color: 'white',
                fontSize: 14,
                marginLeft: 5
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
            </View>*/
            <View>

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
