import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements'

var styles = require('../Style/style');

const Home  = ({}) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const colorScheme = useColorScheme();
  const [currStyles, setCurrStyles] = useState(darkStyles);
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  // Function to handle user logout
  const handleLogout = useCallback(async () => {
    try {
      // Clear authentication state from AsyncStorage
      await AsyncStorage.removeItem('authData');
      setIsAuthenticated(false);
      navigation.replace('Onboardscreen1');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [navigation]);

  useEffect(() => {
    setCurrStyles(colorScheme == "dark" ? darkStyles : lightStyles);
    NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
      setStatusBarHeight(response.height);
    });
  }, [colorScheme]);

return (
    <View style={currStyles.container}>
      <View style={{height: 40, flexDirection: 'row', marginTop: statusBarHeight}}>
        <View style={{flex: 0.5}}>
          <TouchableOpacity style={{width: 40, height: 40, backgroundColor: '#3B30B9', justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginLeft: 12}}>
            <Image source={require('../assets/images/account.png')} resizeMode='contain' style={{flex: 0.6}} />
          </TouchableOpacity>
        </View>
        <View style={{flex: 0.5, flexDirection: 'row', justifyContent: 'flex-end'}}>
          <TouchableOpacity style={[colorScheme == "dark" ? {backgroundColor: '#292929'} : {backgroundColor: '#fff'}, {height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12}]}>
            {/* deposit or account val */}
            <Text style={[colorScheme == "dark" ? {color: '#E6E6E6'} : {color: '#181818'}, {fontFamily: 'InterTight-Bold', paddingHorizontal: 25}]}>Deposit +</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{flex: 1}}>

      </View>



      {}
        {!isAuthenticated ? (
          <TouchableOpacity onPress={handleLogout}>
          <Text>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Text>Logged In</Text>
          </TouchableOpacity>
        )}
    </View>
    );
};

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    justifyContent: 'center',
    gap: 30,
  },
  mainTxt: {
    color: 'white',
    fontSize: 50,
    marginHorizontal: 24,
    fontFamily: 'InterTight-Black'
  },
  button: {
    backgroundColor: '#3B30B9',
    marginHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15
  },
  buttonTxt: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'InterTight-Black'
  }
})

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E6E6",
    justifyContent: 'center',
    gap: 30,
  },
  mainTxt: {
    color: '#181818',
    fontSize: 50,
    marginHorizontal: 24,
    fontFamily: 'InterTight-Black'
  },
  button: {
    backgroundColor: '#3B30B9',
    marginHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15
  },
  buttonTxt: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'InterTight-Black'
  }
})

export default Home;