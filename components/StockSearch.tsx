import React, {useState, useEffect, useCallback} from 'react';
import {
  Text,
  View,
  useColorScheme,
  NativeModules,
  ScrollView,
  TextInput,
} from 'react-native';
import {useNavigation } from '@react-navigation/native';
import StockCard from './StockCard';
import Icon from 'react-native-vector-icons/FontAwesome';

const StockSearch = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [stockSearch, setStockSearch] = useState('');
  Icon.loadFont();
  const [Prop, setProp] = useState(0);
  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    NativeModules.StatusBarManager.getHeight(
      (response: {height: React.SetStateAction<number>}) => {
        setStatusBarHeight(response.height);
      },
    );

    const socket = new WebSocket('wss://music-api-grant.fly.dev');

    socket.onopen = () => {
      console.log('Opened');
    };

    socket.onmessage = event => {
      console.log('Message received:', event.data);
      setProp(event.data);
    };

    socket.onclose = () => {
      console.log('Connection closed');
    };
  }, []);

  return (
    <View style={{backgroundColor: '#161d29', flex: 1}}>
      <View
        style={{
          height: 40,
          flexDirection: 'row',
          marginTop: statusBarHeight + 10,
        }}>
        <View style={{flex: 1, marginLeft: 12, justifyContent: 'center'}}>
          <Text
            style={[
              colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'},
              {fontFamily: 'InterTight-Black', fontSize: 24},
            ]}>
            Stock
          </Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row', gap: 5}}>
          <View style={{flex: 1}}></View>
        </View>
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
        onChangeText={setStockSearch}
        value={stockSearch}
        placeholder="Search Stocks, Crypto..."
      />
      <ScrollView>
        <StockCard ticker={'AAPL'}></StockCard>
        <StockCard ticker={'TSLA'}></StockCard>
        <StockCard ticker={'NVDA'}></StockCard>
      </ScrollView>
    </View>
  );
};

export default StockSearch;
