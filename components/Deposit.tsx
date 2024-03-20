import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './GameModesScrollBar';
import axios from 'axios';
import { serverUrl } from '../constants/global';

const Deposit = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();

    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [styles, setStyles] = useState(darkStyles);

    const goBack = () => {
        navigation.goBack();
    };
  
    useEffect(() => {
      NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
        setStatusBarHeight(response.height);
      });
      colorScheme == "dark" ? setStyles(darkStyles) : setStyles(lightStyles)
    });

    const [input, setInput] = useState('0.00');


    const data = {
      //username: user!.username,
      newBalance: input
    };

    
    const handlePress = (value:string) => {
      if (input === '0.00') {
        setInput('')
        setInput((prevInput) => prevInput + value);
        
      }
      if (value === '0' && input === '0.00') {
        setInput('0.00')
      } 
      if (input.includes('.') && input.split('.')[1].length >= 2) {
        return;
      }
      if(input.length === 5 && input.includes('.') === false) {
        return;
      }
      if(input.includes('.') && input.split('.').length === 5) {
        return;
      }
      else {
        setInput((prevInput) => prevInput + value);
      }
    };
  
    const handleDelete = () => {
      if (input !== '0.00') {
        setInput((prevInput) => prevInput.slice(0, -1));
      }
      if (input.length === 1) {
        setInput('0.00')
      }
       
    };
  
    const handleDecimal = () => {
      if (!input.includes('.')) {
        setInput((prevInput) => prevInput + '.');
      }
    };

    const handleExit = async () => {
        try {
            const accessData = {
              email: await AsyncStorage.getItem("userEmail")
            };
            const response = await axios.post(serverUrl+'/getAccessFromMongo', accessData);
            console.log("Mongo Access Token: " + response.data)
          } catch (error) {
            console.error('Error fetching access token, user may not have one:', error);
          }
        //goBack()
    }
    
    /*const updateBalance = async () => {
      console.log("Trying", data);
      try {
        const response = await axios.post(serverUrl + '/updateBalance', data);
        console.log(response.data); // Assuming the server responds with the saved data
        goBack()

      } catch (error) {
        console.error('Client-side Axios error:', error);
      }
    };*/
    
 

return (
        
    <View style={[colorScheme == "dark" ? {backgroundColor: "#181818"} : {backgroundColor: '#fff'}, {flex: 1}]}>
    
    <View style={{marginTop: statusBarHeight + 10, marginHorizontal: 15}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, width: 60, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12}]}>
                        <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {marginHorizontal: 15, fontFamily: 'InterTight-Black', fontSize: 24}]}>Deposit</Text>
                </View>
                <View style={{flex: 1}}/>
            </View>
        </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {fontSize: 60, fontFamily: 'InterTight-Black'}]}>${input}</Text>
      </View>
      <View>
      <View style={{marginHorizontal: 10}}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('1')}>
          <Text style={styles.buttonText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('2')}>
          <Text style={styles.buttonText}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('3')}>
          <Text style={styles.buttonText}>3</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('4')}>
          <Text style={styles.buttonText}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('5')}>
          <Text style={styles.buttonText}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('6')}>
          <Text style={styles.buttonText}>6</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('7')}>
          <Text style={styles.buttonText}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('8')}>
          <Text style={styles.buttonText}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('9')}>
          <Text style={styles.buttonText}>9</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('0')}>
          <Text style={styles.buttonText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDecimal}>
          <Text style={styles.buttonText}>.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <Text style={styles.buttonText}>DEL</Text>
        </TouchableOpacity>
      </View>
      </View>
      <TouchableOpacity onPress={handleExit} style={{backgroundColor: "#1ae79c", alignItems: 'center', justifyContent: 'center', borderRadius: 50, height: 60, marginBottom: 30, marginTop: 20, marginHorizontal: 15}}>
        <Text style={{color: '#000', fontFamily: 'InterTight-Black', fontSize: 18}}>Confirm</Text>
      </TouchableOpacity>
      </View>
    </View>
    );
};




const darkStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginBottom: 10
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        padding: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 30,
        fontFamily: 'InterTight-Bold'
    }
})

const lightStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginBottom: 10
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        padding: 15,
    },
    buttonText: {
        color: '#000',
        fontSize: 30,
        fontFamily: 'InterTight-Bold'
    }
})

export default Deposit;