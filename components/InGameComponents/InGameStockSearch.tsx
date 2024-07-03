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
import SearchCard from '../StockComponents/SearchCard';
import HTHPageHeader from '../GlobalComponents/HTHPageHeader';

interface stockObject {
  ticker: string;
  companyName: string;
}

//pass params through props of search card so that we can tell match data and if they own a stock
interface RouteParams {
  matchID: string;
  buyingPower: number;
  user: string
  assets: Array<any>
  endAt: Date
}

const InGameStockSearch = () => {

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width);
  const route = useRoute()

  const navigation = useNavigation<any>();
  const [stockSearch, setStockSearch] = useState('');
  const [listOfTickers, setListOfTickers] = useState<stockObject[]>([]);
  const [searchResults, setSearchResults] = useState<stockObject[]>([]);

  const goBack = () => {
    navigation.goBack();
  };

  const params = route.params as RouteParams | undefined;

  const updateTickerList = async () => {
    const response = await axios.get(serverUrl + '/getTickerList');
    setListOfTickers(response.data);
  };

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
      <HTHPageHeader text="Trade" endAt={params?.endAt}/>
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
                    ticker={item.ticker} 
                    name={item.companyName} 
                    inGame={true} 
                    buyingPower={params?.buyingPower} 
                    matchID={params?.matchID} 
                    assets={params?.assets}
                    endAt={params?.endAt}/>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default InGameStockSearch;
