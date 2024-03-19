import React, {useState, useEffect, useCallback} from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

var styles = require('../Style/style');

const Home  = ({}) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const colorScheme = useColorScheme();
  const [currStyles, setCurrStyles] = useState(darkStyles);

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
  }, [colorScheme]);

return (
    <View style={currStyles.container}>



      
      {/*}
        {!isAuthenticated ? (
          <TouchableOpacity onPress={handleLogout}>
            <Text>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Text>Logged In</Text>
          </TouchableOpacity>
        )}*/}
    </View>
    );
};

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    justifyContent: 'center',
    gap: 30,
    marginTop: StatusBar.currentHeight
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
    marginTop: StatusBar.currentHeight
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