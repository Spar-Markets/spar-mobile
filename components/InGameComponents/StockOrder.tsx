import React, {useState, useEffect, useCallback} from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import Icon from 'react-native-vector-icons/FontAwesome';

interface stockOrderParams {
  ticker: string,
  matchId: string,
  tradeType: string
}

const StockOrder = (props: any) => {
    const navigation = useNavigation<any>(); 
    const colorScheme = useColorScheme();
    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [styles, setStyles] = useState(darkStyles);
    const [numberShares, setNumberShares] = useState('0.00');
    const [orderTotal, setTotal] = useState('0.00');
    const [stockPrice, setPrice] = useState(190.00);

    const goBack = () => { 
        navigation.goBack();
    };
    Icon.loadFont();

    const route = useRoute();
    const params = route.params as stockOrderParams | undefined;
    console.log("StockOrder params:", params);
    if (params == undefined) {
      console.error("STOCKORDER: params undefined");
      throw new Error("params passed when navigating to Stock Order are in incorrect format.");
    }
    const { ticker, matchId, tradeType } = params;
    // const ticker = (route.params as { ticker?: string})?.ticker ?? "";
    // const matchId = (route.params as { matchId?: string})?.matchId ?? "";

    const purchaseStock = async (buyPrice: number) => {
        try {
            const userID = await AsyncStorage.getItem("userID");
            const buyResponse = await axios.post(serverUrl + "/purchaseStock", {userID: userID, matchId: matchId, ticker: ticker, buyPrice: buyPrice, shares: numberShares });
        } catch (error) {
            console.log(error)
        }
    }
  
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


    }, []);

    const handlePress = (value:string) => {
      if (numberShares === '0.00') {
        setNumberShares('')
        setNumberShares((prevInput) => prevInput + value);
        
      }
      if (value === '0' && numberShares === '0.00') {
        setNumberShares('0.00')
      } 
      if (numberShares.includes('.') && numberShares.split('.')[1].length >= 2) {
        return;
      }
      if(numberShares.length === 5 && numberShares.includes('.') === false) {
        return;
      }
      if(numberShares.includes('.') && numberShares.split('.').length === 5) {
        return;
      }
      else {
        setNumberShares((prevInput) => prevInput + value);

      }
    };
  
    const handleDelete = () => {
      if (numberShares !== '0.00') {
        setNumberShares((prevInput) => prevInput.slice(0, -1));
      }
      if (numberShares.length === 1) {
        setNumberShares('0.00')
      }
       
    };
  
    const handleDecimal = () => {
      if (!numberShares.includes('.')) {
        setNumberShares((prevInput) => prevInput + '.');
      }
    };


useEffect(() => {
  setTotal(String(Number(numberShares)*Number(stockPrice)))

}, [numberShares])


return (
        
    <View style={[colorScheme == "dark" ? {backgroundColor: "#111"} : {backgroundColor: '#fff'}, {flex: 1}]}>
        <View style={{marginTop: statusBarHeight + 10, marginHorizontal: 15}}>
        <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={goBack} style={[colorScheme == "dark" ? {backgroundColor: 'transparent'} : {backgroundColor: 'transparent'}, {height: 30, marginBottom: 10, alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 10, borderRadius: 12}]}>
                        <Icon name={'chevron-left'} size= {20} color={"#33aaFF"} style={colorScheme == "dark" ? {color: '#FFF'} : {backgroundColor: '#000'}}/>
                        <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>Back</Text>
                    </TouchableOpacity>
                </View>                
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {marginHorizontal: 15, fontFamily: 'InterTight-Bold', fontSize: 20}]}>Buy {ticker}</Text>
                    <Text style={[colorScheme == "dark" ? {color: "#1ae79c"} : {color: '#000'}, {marginHorizontal: 15, fontFamily: 'InterTight-Bold', fontSize: 16}]}>Market Order</Text>
                </View>
                <View style={{flex: 1}}/>
            </View>
        </View>
      <View style={{marginTop: 50, justifyContent: 'center'}}>
      <View style={{alignItems: 'center', flexDirection: 'row', marginHorizontal: 20}}>
        <Text style={[colorScheme == "dark" ? {color: "#aaa"} : {color: '#aaa'}, {fontSize: 20, fontFamily: 'InterTight-Black'}]}>Shares</Text>
        <View style={{flex: 1}}></View>
        <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {fontSize: 20, fontFamily: 'InterTight-Black'}]}>{numberShares}</Text>
      </View>
      <View style={{alignItems: 'center', flexDirection: 'row', marginHorizontal: 20, marginTop: 20}}>
        <Text style={[colorScheme == "dark" ? {color: "#aaa"} : {color: '#aaa'}, {fontSize: 20, fontFamily: 'InterTight-Black'}]}>Market Price</Text>
        <View style={{flex: 1}}></View>
        <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {fontSize: 20, fontFamily: 'InterTight-Black'}]}>{stockPrice}</Text>
      </View>
      <View style={{height: 1, backgroundColor: '#aaa', marginHorizontal: 20, marginTop: 15}}></View>
      <View style={{alignItems: 'center', flexDirection: 'row', marginHorizontal: 20, marginTop: 20}}>
        <Text style={[colorScheme == "dark" ? {color: "#aaa"} : {color: '#aaa'}, {fontSize: 20, fontFamily: 'InterTight-Black'}]}>Order Total</Text>
        <View style={{flex: 1}}></View>
        <Text style={[colorScheme == "dark" ? {color: "#fff"} : {color: '#000'}, {fontSize: 20, fontFamily: 'InterTight-Black'}]}>{orderTotal}</Text>
      </View>
      </View>
      <View style={{flex: 1}}></View>
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
      
      <TouchableOpacity onPress={() => {purchaseStock(stockPrice); navigation.navigate("GameScreen")}} style={{backgroundColor: "#1ae79c", alignItems: 'center', justifyContent: 'center', borderRadius: 12, height: 80, marginBottom: 30, marginTop: 20, marginHorizontal: 15}}>
        <Text style={{color: '#000', fontFamily: 'InterTight-Black', fontSize: 18}}>Confirm Buy</Text>
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

export default StockOrder;