import React, {useState, useEffect, useCallback} from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  NativeModules,
  ScrollView,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth0, Auth0Provider} from 'react-native-auth0';
import {useNavigation} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './ActiveGames';
import {serverUrl} from '../constants/global';
import axios from 'axios';

/*
TODO: On transfer, figure out way to show all transfers, transfer id in mongo
*/

const Transfers = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const [transferData, setTransferData] = useState([]);

  const [statusBarHeight, setStatusBarHeight] = useState(0);

  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    NativeModules.StatusBarManager.getHeight(
      (response: {height: React.SetStateAction<number>}) => {
        setStatusBarHeight(response.height);
      },
    );
    getTransferList();
  }, []);

  const getTransferList = async () => {
    try {
      const response = await axios.post(serverUrl + '/getTransferList');
      /*for (const transfer of response.data) {
                
            }*/
      setTransferData(response.data);
    } catch {
      console.error('transfer list error');
    }
  };

  return (
    <View
      style={[
        colorScheme == 'dark'
          ? {backgroundColor: '#181818'}
          : {backgroundColor: '#fff'},
        {flex: 1},
      ]}>
      <View style={{marginTop: statusBarHeight + 10, marginHorizontal: 15}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <TouchableOpacity
              onPress={goBack}
              style={[
                colorScheme == 'dark'
                  ? {backgroundColor: '#fff'}
                  : {backgroundColor: '#000'},
                {
                  height: 30,
                  width: 60,
                  paddingHorizontal: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 12,
                },
              ]}>
              <Text
                style={[
                  colorScheme == 'dark' ? {color: '#000'} : {color: '#fff'},
                  {fontFamily: 'InterTight-Black', fontSize: 12},
                ]}>
                Back
              </Text>
              {/*<Icon path={mdiChevronLeft}/>*/}
            </TouchableOpacity>
          </View>
          <View
            style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <Text
              style={[
                colorScheme == 'dark' ? {color: '#fff'} : {color: '#000'},
                {
                  marginHorizontal: 15,
                  fontFamily: 'InterTight-Black',
                  fontSize: 20,
                },
              ]}>
              Transfers
            </Text>
          </View>
          <View style={{flex: 1}} />
        </View>
      </View>
      <ScrollView style={{marginTop: 15}} showsVerticalScrollIndicator={false}>
        {transferData.map((item: any, index) => (
          <View
            key={index}
            style={{
              marginHorizontal: 12,
              marginVertical: 15,
              height: 50,
              flexDirection: 'row',
            }}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text
                style={[
                  colorScheme == 'dark'
                    ? {color: '#fff'}
                    : {backgroundColor: '#000'},
                  {fontSize: 21, fontFamily: 'InterTight-Black'},
                ]}>
                ${item.amount}
              </Text>
              <Text
                style={{
                  color: '#888888',
                  fontSize: 12,
                  fontFamily: 'InterTight-Black',
                }}>
                {item.type}
              </Text>
            </View>
            <View style={{justifyContent: 'center'}}>
              <Text
                style={[
                  colorScheme == 'dark'
                    ? {color: '#fff'}
                    : {backgroundColor: '#000'},
                  {fontSize: 12, fontFamily: 'InterTight-Black'},
                ]}>
                {item.created.split('T')[0]}
              </Text>
              <Text
                style={[
                  colorScheme == 'dark'
                    ? {color: '#fff'}
                    : {backgroundColor: '#000'},
                  {fontSize: 12, fontFamily: 'InterTight-Black'},
                ]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    justifyContent: 'center',
    gap: 30,
  },
  mainTxt: {
    color: 'white',
    fontSize: 50,
    marginHorizontal: 24,
    fontFamily: 'InterTight-Black',
  },
  button: {
    backgroundColor: '#3B30B9',
    marginHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
  },
  buttonTxt: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'InterTight-Black',
  },
});

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    gap: 30,
  },
  mainTxt: {
    color: '#181818',
    fontSize: 50,
    marginHorizontal: 24,
    fontFamily: 'InterTight-Black',
  },
  button: {
    backgroundColor: '#3B30B9',
    marginHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
  },
  buttonTxt: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'InterTight-Black',
  },
});

export default Transfers;
