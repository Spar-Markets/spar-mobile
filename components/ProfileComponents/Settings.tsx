import React, {useState, useEffect} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {serverUrl} from '../../constants/global';
import fuzzysort from 'fuzzysort';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import createProfileStyles from '../../styles/createProfileStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import UserCard from './UserCard';
import useUserDetails from '../../hooks/useUserDetails';
import createGlobalStyles from '../../styles/createGlobalStyles';

const Settings = () => {
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createProfileStyles(theme, width);

  const globalStyles = createGlobalStyles(theme, width);
  return (
    <View style={[styles.container]}>
      <PageHeader text="Settings" onProfile={true} />
    </View>
  );
};

export default Settings;
