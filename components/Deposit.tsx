import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import FeatherIcons from 'react-native-vector-icons/Feather';
import { useTheme } from '../components/ContextComponents/ThemeContext';
import PageHeader from './GlobalComponents/PageHeader';

import { useSelector } from 'react-redux';
import { RootState } from '../GlobalDataManagment/store';


const Deposit = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();

    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [styles, setStyles] = useState(darkStyles);
    const [currAccessToken, setCurrAccessToken] = useState();
    const [balance, setBalance] = useState("Retrieving...");
    const [input, setInput] = useState('0.00');
    const user = useSelector((state: RootState) => state.user)

    const goBack = () => {
        navigation.goBack();
    };  
    const { theme } = useTheme();

    FeatherIcons.loadFont();
    const route = useRoute();

    const params = route.params as any;
    const accessTokens = params?.accessTokens
    const accountID = params?.accountID
    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });
        colorScheme == "dark" ? setStyles(darkStyles) : setStyles(lightStyles)
        console.log("bankingbitches", accessTokens, accountID)
      
    }, []);

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





    const handleDeposit = async () => {
        
        const transferAuthData = {
          access_token: accessTokens,
          account_id: params?.accountID,
          // this shoud be dynamicaly set
          amount: input,
          // type: "debit",
          // network: 'ach',
          // ach_class: 'ppd',
          // user: {
          //     legal_name: "Grant Drinkwater"
          // }
      }
      const authData = await axios.post(serverUrl+"/transfer", transferAuthData);
      if (authData.data == 'approved') {


      const transfers = await axios.post(serverUrl+"/getTransferList");
        console.log("alright",transfers)
        // parse transfer response to get just transfer ids

      // Extract the transfer IDs
      const transferIds = transfers.data.map(item => item.id);

      console.log(transferIds);

        const transferPackageForSim = {
          transfer_id: transferIds[0]

        }
        console.log("cream",transferPackageForSim)
        const sim = await axios.post(`${serverUrl}/sandbox-transfer-simulate`, transferPackageForSim) 
        console.log(sim)
 
        try {  
            const updateBalData = {
                userID: user.userID,
                deposit: input
            } 
            await axios.post(`${serverUrl}/updateUserBalanceDeposit`, updateBalData)

            //redux their balance 

        } catch {
            console.error("error")
        }
      }
    }



return (
        
    <View style={[colorScheme == "dark" ? {backgroundColor: "#181818"} : {backgroundColor: '#fff'}, {flex: 1}]}>
        <View style={{marginTop: statusBarHeight + 10}}>
            <View style={{flexDirection: 'row'}}>

                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <PageHeader text="" />

                    <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, { fontFamily: 'InterTight-Black', fontSize: 20}]}>Deposit</Text>
                </View>
            </View>
        </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {fontSize: 60, fontFamily: 'InterTight-Black'}]}>${input}</Text>
        <Text style={{color: "#888888", fontSize: 16, fontFamily: 'InterTight-Black'}}>Available Funds: {balance}</Text>
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
      
      <TouchableOpacity onPress={handleDeposit} style={{backgroundColor: "#1ae79c", alignItems: 'center', justifyContent: 'center', borderRadius: 12, height: 80, marginBottom: 30, marginTop: 20, marginHorizontal: 15}}>
        <Text style={{color: '#000', fontFamily: 'InterTight-Black', fontSize: 18}}>Continue</Text>
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