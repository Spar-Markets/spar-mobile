import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import createGlobalStyles from '../../styles/createGlobalStyles';
import {useNavigation} from '@react-navigation/native';
import {signOut} from 'firebase/auth';
import {auth} from '../../firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUserIsMade } from '../../GlobalDataManagment/userSlice';

const Menu = () => {
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createGlobalStyles(theme, width);

  const dispatch = useDispatch();

  const handleLogout = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem('profileImgPath');
    await AsyncStorage.removeItem('userID');
    dispatch(setUserIsMade(false))
  };

  const navigation = useNavigation<any>();

  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{color: theme.colors.text}}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={{color: theme.colors.text}}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Menu;
