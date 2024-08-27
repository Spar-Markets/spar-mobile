import React, {useState, useEffect, useCallback} from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import FeatherIcons from 'react-native-vector-icons/Feather';
import { useTheme } from '../components/ContextComponents/ThemeContext';
import PageHeader from './GlobalComponents/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../GlobalDataManagment/store';
import createStockSearchStyles from '../styles/createStockStyles';
import { useDimensions } from './ContextComponents/DimensionsContext';
import { setBalance } from '../GlobalDataManagment/userSlice';

interface account {
  data: {};
  token: string
  // Add other properties based on your account object structure
}

const Deposit = () => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();
    const { theme } = useTheme();
    const { width } = useDimensions();

    const styles = createStockSearchStyles(theme, width);

    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState<account[]>()
    const [balance, setBalance2] = useState("Retrieving...");
    const [input, setInput] = useState('0.00');
    const user = useSelector((state: RootState) => state.user)
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const goBack = () => {
        navigation.goBack();
    };

    const dispatch = useDispatch()

    FeatherIcons.loadFont();
    const route = useRoute();
    const params = route.params as any;

    // Accounts passed from the banking page
    const accounts = params?.accounts

    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
    };
    const handleAccountSelect = (account) => {
      setSelectedAccount(account);
      setDropdownOpen(false);
  };
  
  
    useEffect(() => {
        NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
            setStatusBarHeight(response.height);
        });
        console.log("Accounts", accounts)
        if (accounts.length > 0) {
          // set the first linked account as the default
          console.log("Default account being set to:", accounts[0])
          console.log("Default account token:", accounts[0].token)
          console.log("Default account ID:", accounts[0].data.accounts[0].account_id)
          console.log("formatting:", accounts[0].data.accounts)

          setSelectedAccount(accounts[0])
        } else {
          console.log("No banks")
        }

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
        if (selectedAccount != undefined) {
          console.log("deposit started",selectedAccount.token,selectedAccount.data.accounts[0].account_id)
          const transferAuthData = {
            access_token: selectedAccount.token,
            account_id: selectedAccount.data.accounts[0].account_id,
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
        console.log("TransferLIST??",transfers)
        // Parse transfer response to get just transfer ids
        const transferIds = transfers.data.map(item => item.id);
        const transferPackageForSim = {
          transfer_id: transferIds[0]
        }
        const sim = await axios.post(`${serverUrl}/sandbox-transfer-simulate`, transferPackageForSim) 
        try {
          console.log("step 2 BAL")
          const updateBalData = {
            userID: user.userID,
            deposit: input
          } 
          console.log(updateBalData)
          const response2 = await axios.post(`${serverUrl}/updateUserBalanceDeposit`, updateBalData)
          //redux their balance 
          if (user.balance != null) {
            const balanceBeforeInput = user.balance
            const preciseBalanceBeforeInput = parseFloat(balanceBeforeInput.toFixed(2));
            const preciseInput = parseFloat(input).toFixed(2);
            const newBalance = Number(preciseBalanceBeforeInput) + Number(preciseInput);
            const final = newBalance.toFixed(2)
            dispatch(setBalance(newBalance))
          }

          } catch {
              console.error("error??")
          }
        } else {

        }
      } else {
        console.log("how is the account undefined that can't be good")

      }
    }

return (
    <View style={[styles.container, {marginTop:0}]}>
            <View style={{flexDirection: 'row'}}>
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <PageHeader text="" />
                    <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, { fontFamily: 'InterTight-Black', fontSize: 20}]}>Deposit</Text>
                </View>
        </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {fontSize: 60, fontFamily: 'InterTight-Black'}]}>${input}</Text>

        {selectedAccount !== undefined ? (
          <TouchableOpacity onPress={toggleDropdown} style={{display: 'flex', justifyContent: "center", alignItems: 'center', gap: 5}}>
            <Text style={{color: "#888888", fontSize: 16, fontFamily: 'InterTight-Black'  }}>
              Account: {selectedAccount ? selectedAccount.data.accounts[0].name : 'Select Account'}
            </Text>
            <Text style={{color: "#888888", fontSize: 16, fontFamily: 'InterTight-Black'}}>Available Funds: {selectedAccount ? selectedAccount.data.accounts[0].balances.available : 'Select Account'}</Text>
        </TouchableOpacity>
        ) : (
          <Text></Text>
        )}
        {dropdownOpen && (
        <View style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 8, marginTop: 10 }}>
            {accounts.map((account, index) => (
                <TouchableOpacity key={index} onPress={() => handleAccountSelect(account)} style={{ padding: 10,width: "70%" }}>
                    <Text style={{ color: theme.colors.text }}>{account.data.accounts[0].persistent_account_id}</Text>
                </TouchableOpacity>
            ))}
        </View>
        )}

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