import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0, Auth0Provider } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameCard from './GameCard';
import GameModesScrollBar from './GameModesScrollBar';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import Icon from '@mdi/react';
import { mdiChevronLeft } from '@mdi/js';

const Withdraw = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();
    

    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [styles, setStyles] = useState(darkStyles);
    const [currAccessToken, setCurrAccessToken] = useState();
    const [accountID, setAccountID] = useState("");
    const [balance, setBalance] = useState("Retrieving...");
    const [input, setInput] = useState('0.00');
    

    const goBack = () => {
        navigation.goBack();
    };
    
  
    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });
        colorScheme == "dark" ? setStyles(darkStyles) : setStyles(lightStyles)

        //getAccessToken().then(() => console.log("Token: " + currAccessToken))
        /*if (l != null) {
            getAccount();
            getBalance();
        }*/

        const fetchData = async () => {
            try {
                const email = await AsyncStorage.getItem("userEmail");
                if (email) {
                    const response = await axios.post(serverUrl+'/getAccessFromMongo', { email: email });
                    if (response && response.data) {
                        const token = response.data
                        //console.log("Console Token: " + token);
                        await getAccount(token); // Wait for getAccount to complete
                        await getBalance(); // Wait for getBalance to complete
                        
                        setCurrAccessToken(token); //only for things outside of useEffect
                    }
                }
                const response = await axios.post(serverUrl+"/getPlaidBalance");
                console.log(response.data)
            } catch (error) {
                console.error("Error fetching access token:", error);
            }

        };
    
        fetchData();


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

    const getAccount = async (token:String) => {
        try {
            const accessData = {
                newAccessToken: token
            };
            const account = await axios.post(serverUrl+'/getAccount', accessData);
            setAccountID(account.data.data.accounts[0].account_id);
            console.log(account.data.data.accounts[0].balances)
        } catch {
          console.error("Error Getting Accont")
        }
      }


    const handleDeposit = async () => {
        
        //GET ACCESS TOKEN FROM MONGO
        const transferAuthData = {
            access_token: currAccessToken,
            account_id: accountID,
            amount: input,
            type: "credit",
            network: 'ach',
            ach_class: 'ppd',
            user: {
                legal_name: "Joseph Quaratiello"
            }
        }
        const authData = await axios.post(serverUrl+"/transfer", transferAuthData);
        if (authData.data == 'approved') {
            try {
                const email = await AsyncStorage.getItem("userEmail");
                const updateBalData = {
                    email: email,
                    withdraw: input
                } 
                await axios.post(serverUrl+"/updateUserBalanceWithdraw", updateBalData)
            } catch {
                console.error("error")
            }
        }

        /*//console.log(transferId.data)
        const simPendingToPostedData = {
            transfer_id: transferId.data,
            event_type: 'posted',
        }

        const simPostedToSettledData = {
            transfer_id: transferId.data,
            event_type: 'settled',
        }*/

        /*console.log("Begin Simming")
        const postedResponse = await axios.post(serverUrl+"/simTransfer", simPendingToPostedData);
        console.log(postedResponse.data)
        const settledData = await axios.post(serverUrl+"/simTransfer", simPostedToSettledData);
        console.log(settledData)
        console.log("End Simming")*/
        
    }

    const getBalance = async () => {
        try {
          const email = await AsyncStorage.getItem("userEmail")
          const data = {
            email: email
          }
          const balance = await axios.post(serverUrl+"/getMongoAccount", data)
          //console.log(balance.data.$numberDecimal)
          
          if (balance.data.$numberDecimal >= 0.00) {
            console.log("Bal from Mongo: " + balance.data.$numberDecimal)
            setBalance(balance.data.$numberDecimal)
          }
        } catch (error) {
          console.error(error)
        }
      }

 
 


return (
        
    <View style={[colorScheme == "dark" ? {backgroundColor: "#181818"} : {backgroundColor: '#fff'}, {flex: 1}]}>
    <View style={{marginTop: statusBarHeight + 10, marginHorizontal: 15}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: '#fff'} : {backgroundColor: '#000'}, {height: 30, width: 60, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 12}]}>
                        <Text style={[colorScheme == "dark" ? {color: '#000'} : {color: '#fff'}, {fontFamily: 'InterTight-Black', fontSize: 12}]}>Back</Text>
                        {/*<Icon path={mdiChevronLeft}/>*/}
                    </TouchableOpacity>
                </View>
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {marginHorizontal: 15, fontFamily: 'InterTight-Black', fontSize: 20}]}>Withdraw</Text>
                </View>
                <View style={{flex: 1}}/>
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

export default Withdraw;