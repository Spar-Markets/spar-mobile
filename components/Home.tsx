import React, {useState, useEffect, useCallback} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';

var styles = require('./style');

const Home  = ({}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigation = useNavigation<any>(); // Define navigation prop with 'any' type

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


return (
    <View>
        <Text style={styles.titleText}>Login</Text>
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

export default Home;