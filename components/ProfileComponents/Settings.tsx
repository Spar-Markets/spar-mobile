import React, {useState, useEffect} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {serverUrl} from '../../constants/global';
import fuzzysort from 'fuzzysort';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import createProfileStyles from '../../styles/createProfileStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

import UserCard from './UserCard';
import useUserDetails from '../../hooks/useUserDetails';
import createGlobalStyles from '../../styles/createGlobalStyles';
import FeatherIcons from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {red} from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import {ScrollView} from 'react-native-gesture-handler';
import {auth} from '../../firebase/firebase';
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from 'firebase/auth';
import Dialog from 'react-native-dialog';

const Settings = () => {
  const {theme, toggleTheme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createProfileStyles(theme, width);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = async () => {
    setIsEnabled(previousState => !previousState);

    toggleTheme();
    // Save the new theme state to AsyncStorage
    const newTheme = !isEnabled ? 'dark' : 'light';
    await AsyncStorage.setItem('theme', newTheme);
  };
  const [dialogVisible, setDialogVisible] = useState(false);
  const [inputEmail, setEmailText] = useState('');
  const [inputPass, setPassText] = useState('');

  FeatherIcons.loadFont();
  MaterialIcons.loadFont();

  const globalStyles = createGlobalStyles(theme, width);

  const showAlert = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => setDialogVisible(true),
        },
      ],
    );
  };
  const handleDialogSubmit = (email: any, pass: any) => {
    setEmailText(email);
    setPassText(pass);
    setDialogVisible(false);
    handleDeleteAccount();
  };

  const reauthenticate = async (
    email: string,
    password: string,
    user: User,
  ) => {
    if (email) {
      const credential = EmailAuthProvider.credential(email, password);
      try {
        await reauthenticateWithCredential(user, credential);
        return true;
      } catch (error) {
        console.error('Error reauthenticating:', error);
        Alert.alert('Error', 'Re-authentication failed. Please try again.');
        return false;
      }
    }
    return false;
  };

  const handleDeleteAccount = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        if (await reauthenticate(inputEmail, inputPass, user)) {
          const userID = await AsyncStorage.getItem('userID');
          const deleteAccountResponse = await axios.post(
            `${serverUrl}/deleteAccount`,
            {userID: userID},
          );
          if (deleteAccountResponse.status == 200) {
            deleteUser(user)
              .then(() => {
                console.log('DELETED SUCCESSFULLY');
                Alert.alert(
                  'Account Deleted',
                  'Your account has been deleted successfully.',
                );
              })
              .catch(error => {
                console.error('ERROR DELETED ACCOUNT:', error);
                Alert.alert(
                  'Error',
                  'There was an error deleting your account. Please try again.',
                );
              });
          }
        }
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        'Error',
        'There was an error deleting your account. Please try again.',
      );
    }
  };

  const navigation = useNavigation();

  useEffect(() => {
    // Load the saved theme state from AsyncStorage
    const loadThemeState = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsEnabled(true);
      } else {
        setIsEnabled(false);
      }
    };

    loadThemeState();
  }, []);

  return (
    <View style={[styles.container]}>
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Title>Verify Credentials</Dialog.Title>
        <Dialog.Description>
          Please Input Your Email and Passowrd
        </Dialog.Description>
        <Dialog.Input placeholder="Email" onChangeText={setEmailText} />
        <Dialog.Input placeholder="Password" onChangeText={setPassText} />

        <Dialog.Button label="Cancel" onPress={() => setDialogVisible(false)} />
        <Dialog.Button
          label="Submit"
          onPress={() => handleDialogSubmit(inputEmail, inputPass)}
        />
      </Dialog.Container>
      <PageHeader text="Settings" onProfile={false} />
      <ScrollView>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: theme.colors.primary,
            marginTop: 20,
            marginHorizontal: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              paddingVertical: 15,
              paddingHorizontal: 15,
            }}>
            <FeatherIcons
              name="sun"
              size={24}
              color={theme.colors.text}
              style={{width: 30}}
            />
            <Text
              style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>
              Toggle Appearance
            </Text>
            <Switch
              trackColor={{
                false: theme.colors.opposite,
                true: theme.colors.opposite,
              }}
              thumbColor={
                isEnabled ? theme.colors.secondaryText : theme.colors.opposite
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            paddingVertical: 15,
            paddingHorizontal: 15,
            borderRadius: 10,
            backgroundColor: theme.colors.stockDownAccent,
            marginTop: 10,
            marginHorizontal: 10,
          }}
          onPress={showAlert}>
          <Text
            style={{
              color: theme.colors.text,
              fontFamily: 'InterTight-Bold',
            }}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Settings;
