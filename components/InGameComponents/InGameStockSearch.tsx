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
import Icon from 'react-native-vector-icons/FontAwesome';

interface stockObject {
  ticker: string,
  companyName: string
}




const InGameStockSearch = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [stockSearch, setStockSearch] = useState('');
  const [listOfTickers, setListOfTickers] = useState<stockObject[]>([]);
  const [searchResults, setSearchResults] = useState<stockObject[]>([]);

  const goBack = () => {
    navigation.goBack();
  };
  const route = useRoute();
  const activeMatchId =
    (route.params as {activeMatchId?: string})?.activeMatchId ?? null;
  Icon.loadFont();
  // const socket = new WebSocket('wss://music-api-grant.fly.dev')
  
  useEffect(() => {
    NativeModules.StatusBarManager.getHeight(
      (response: {height: React.SetStateAction<number>}) => {
        setStatusBarHeight(response.height);
      },
    );
    console.log('getting ticker list');
    getTickerList();
    console.log('ingamestocksearch activematchid', activeMatchId);
  }, []);

  const getTickerList = async () => {
    const list = await AsyncStorage.getItem('tickersList');
    console.log('printing list', list);
    if (list != null && list != undefined) {
      setListOfTickers(JSON.parse(list));
    } else {
      // Call endpoint
      console.log("list is null so we're calling the server");
      const response = await axios.get(serverUrl + '/getTickerList');
      console.log('gettickerlist', response,);
      // setListOfTickers(response.tickers);
    }
  };

  const handleSearch = async (text: string) => {
    setStockSearch(text);
    if (text) {
      // if there is search data, perform the search
      // TODO: implement js-search
    }
  }

  const CategoryButton = (category: string) => {
    return (
      <TouchableOpacity style={{backgroundColor: '#242F42', borderRadius: 10}}>
        <Text
          style={{
            color: 'white',
            fontFamily: 'InterTight-Bold',
            padding: 10,
            fontSize: 12,
          }}>
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{backgroundColor: '#161d29', flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 15,
          marginTop: statusBarHeight + 15,
        }}>
        <View style={{flex: 1}}>
          <TouchableOpacity
            onPress={goBack}
            style={[
              colorScheme == 'dark'
                ? {backgroundColor: 'transparent'}
                : {backgroundColor: 'transparent'},
              {
                height: 30,
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
                borderRadius: 12,
              },
            ]}>
            <Icon
              name={'chevron-left'}
              size={20}
              color={'#33aaFF'}
              style={
                colorScheme == 'dark'
                  ? {color: '#FFF'}
                  : {backgroundColor: '#000'}
              }
            />
            <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <Text
            style={[
              colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'},
              {
                marginHorizontal: 15,
                fontFamily: 'InterTight-Black',
                fontSize: 20,
              },
            ]}>
            Trade
          </Text>
        </View>
        <View style={{flex: 1}} />
      </View>
      <TextInput
        style={{
          height: 40,
          color: '#fff',
          fontFamily: 'InterTight-Black',
          fontSize: 14,
          marginHorizontal: 12,
          marginVertical: 15,
          backgroundColor: '#242F42',
          borderRadius: 12,
          paddingLeft: 10,
        }}
        onChangeText={handleSearch}
        value={stockSearch}
        placeholder="Search Stocks, Crypto..."
      />
      <View style={{}}>
        {stockSearch == '' ? (
          <View style={{marginHorizontal: 15}}>
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
          keyExtractor={(item) => item.ticker}
          renderItem={({ item }) => (
            <View>
              <Text>{item.ticker} - {item.companyName}</Text>
            </View>
          )}
        />

          

            <StockCard
              ticker={'AAPL'}
              matchId={activeMatchId}
              tradable={true}>  
            </StockCard>
        </View>
        )}
      </View>
    </View>
  );
};

export default InGameStockSearch;
