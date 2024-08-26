import React, {useState, useEffect, useCallback} from 'react';
import { Platform, Text, View, useColorScheme, NativeModules, SafeAreaView, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk';
import { serverUrl } from '../constants/global';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../GlobalDataManagment/store';
import PageHeader from './GlobalComponents/PageHeader';
import createStockSearchStyles from './../styles/createStockStyles';
import { useTheme } from '../components/ContextComponents/ThemeContext';
import { useDimensions } from './ContextComponents/DimensionsContext';
import FeatherIcons from 'react-native-vector-icons/Feather';

const Bank = ({ navigation }: any) => {
    const [linkToken, setLinkToken] = useState("");
    const [accessTokens, setAccessTokens] = useState<String[]>([]);
    const [accountID, setAccountID] = useState("");
    const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
    const user = useSelector((state: RootState) => state.user)
    const { theme } = useTheme();
    const { width } = useDimensions();
    const styles = createStockSearchStyles(theme, width);
    const [statusBarHeight, setStatusBarHeight] = useState(0);
    const [accounts, setAccounts] = useState<AccountType[] | undefined>(undefined);
    const [accountsAndTokens, setAccountsWithTokens] = useState<AccountType[] | undefined>(undefined);

    FeatherIcons.loadFont();
    Icon.loadFont();

    
    const renderItem = ({ item }) => (
      <View>
        <Text>{item.offical_name}</Text>
      </View>
    );
// Assuming AccountType is the type of each account object within the "accounts" array
interface AccountType {
  account_id: string;
  official_name: string;
  name: string;
  balances: {available: string};
  subtype: string;
  persistent_account_id: string
  // Add other properties based on your account object structure
}

    const createLinkToken = useCallback(async () => {
        await fetch(serverUrl+"/createLinkToken", {
        method: "POST",
        headers: {
          "Environment": "sandbox",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ address: address })
        })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.link_token)
          setLinkToken(data.link_token);
        })
        .catch((err) => {
          console.log("Error: " + err);
        });
      }, [setLinkToken])

      const getAccessTokens = async () => {
        const accessData = {
          userID: user!.userID
        };
        try {
          const response = await axios.post(serverUrl+'/getAccessFromMongo', accessData);
          console.log("Retrieved accesstokens from mongo: " + response.data )
          setAccessTokens(response.data); 
          // Assuming accessToken is in the response data
        } catch (error) {
          console.error('Error fetching access token, user may not have one:', error);
        }
      }
  
      const accountsFunc = async () => {
        console.log("Prior to getting accounts", accessTokens[0]);
      
        const accessData = {
          accessToken: accessTokens,
        };
        try {
          const response = await axios.post(serverUrl + '/getAccount', accessData);
          console.log(response.data.results[0].data.accounts);

          // Flatten the accounts from each result

          const flatAccounts = response.data.results.flatMap((item: any) => item.data.accounts);
          setAccountsWithTokens(response.data.results)
          console.log(flatAccounts)
          setAccounts(flatAccounts);
        } catch (error) {
          console.error('Error fetching accounts:', error);
        }
      };

    useEffect(() => {
      NativeModules.StatusBarManager.getHeight((response: { height: React.SetStateAction<number>; }) => {
        setStatusBarHeight(response.height);
      });
      if (linkToken == "") {
        console.log("Getting Link Token")
        createLinkToken();
      }
      getAccessTokens()

    }, [])
    
    useEffect(() => {
      console.log("here",accessTokens)
      if (accessTokens.length == 0) {
        console.log("no accounts linked")
      } else {
        console.log("ACCOUNTS LINKED")
        accountsFunc();
      }
  }, [linkToken]); // Run accounts only when accessTokens is set

  return (
    <View style={[styles.container, {paddingLeft: 20, paddingRight: 20} ]}>
      <View style={{flexDirection: "row"}}>
        <View style={[styles.header, {marginHorizontal: 0, flex: 0.5}]}>
          <Text style={[styles.headerText, {}]}>My Wallet</Text>
        </View>
        <View style={{flex: 0.5, justifyContent: "center", alignItems: "flex-end"}}>
          <FeatherIcons name="menu" style={{ color: theme.colors.opposite }} size={20}/>
        </View>
      </View>
      <View style={{marginTop: 10}}>

        <View style={{ marginTop: 10, display: 'flex', gap: 10, backgroundColor: theme.colors.primary, borderRadius: 20, padding: 15, borderColor: theme.colors.gameCardGrayBorder, borderWidth: 1}}>
          <Text style={{color: theme.colors.secondaryText, fontSize: 16}}>Current Balance </Text>
          <Text style={{fontSize: 36, color: '#60FFCF', fontWeight: "600"}}>${user.balance?.toFixed(2)}</Text>
          <View style={{display: 'flex', flexDirection: "row", gap: 10}}>
            <TouchableOpacity style={{flex: 1, padding:15, alignItems: "center", borderRadius: 10, backgroundColor: theme.colors.tertiary}} onPress={() => navigation.navigate('Withdrawl', {accountID: accountID, accessTokens: accessTokens})}>
              <Text style={{color: theme.colors.opposite, fontWeight: "600", fontSize: 18}}>Withdrawl</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1, alignItems: "center", padding: 15, backgroundColor: "#60FFCF", borderRadius: 10}} onPress={() => navigation.navigate('Deposit', {accounts: accountsAndTokens})}>
              <Text style={{color: theme.colors.primary, fontWeight: "600", fontSize: 18}}>Deposit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 20, marginBottom: 20}}>
          <Text style={{color: theme.colors.opposite, fontSize: 18, fontWeight: "bold"}}>Bank Accounts</Text>
          <FeatherIcons style={{color:theme.colors.opposite}} name="edit-3" size={20}/>
        </View>
        
        <PlaidLink
          tokenConfig={{
              token: linkToken,
              noLoadingState: false,
          }}
          onSuccess={ async (success: LinkSuccess) => {
            // Fetching access token
            const response = fetch(`${serverUrl}/exchangePublicToken`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
            public_token: success.publicToken, 
            accounts: success.metadata.accounts,
            institution: success.metadata.institution,
            linkSessionId: success.metadata.linkSessionId,
            }),
            })
            .then(response => response.json()) // Parse the response body as JSON
            .then(async data => {
            // Access the values sent back from the server


            const accessToken = data.access_token;
            const itemId = data.item_id;
            
            const updatingData = {
            //email: user!.email,
              accessToken: accessToken,
              userID: user.userID,
              bankName: success.metadata.institution
            };

            await axios.post(serverUrl+'/uploadUserAccessToken', updatingData);

            console.log("Logging Access Token " + accessToken)
            // Call the function to get user's accesstokens to update the client with the most recent ones 
            getAccessTokens()
          })  
            .catch((err) => {
            console.log("Error in Success")
            console.log(err);
            });
          }}
          onExit={(response: LinkExit) => {
              console.log("On exit, printing link token " + linkToken)
              console.log(response);
        }}>
          <View style={{flexDirection: "row", gap: 10, padding: 10, backgroundColor: theme.colors.primary, alignContent: 'center', alignItems: "center", borderWidth: 1, borderColor: theme.colors.gameCardGrayBorder, borderRadius: 10, marginBottom: 15}}>
            <FeatherIcons name="plus-circle" style={{ color: theme.colors.opposite }} size={20}/>
            <Text style={{color:theme.colors.opposite}}>Link Bank</Text>
          </View>
        </PlaidLink>
        <View>
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.account_id}
          renderItem={({ item }) => (
            <View style={{padding: 15, marginBottom: 10, display: 'flex', flexDirection:"row",gap:10, backgroundColor: theme.colors.primary, alignContent: "center", borderRadius: 10, borderColor: theme.colors.gameCardGrayBorder, borderWidth: 1}}>
              <View style={{justifyContent: "center"}}>
                <Icon name="bank" style={{ color: theme.colors.opposite }} size={30}/>
              </View>
              <View>
                <Text style={{color:theme.colors.opposite, fontSize: 18, fontWeight: "700"}}>{item.name}</Text>
                <Text style={{color:theme.colors.opposite}}>{item.subtype.charAt(0).toUpperCase() + item.subtype.slice(1) + ' ' + item.persistent_account_id.slice(-4)}</Text>
                <Text style={{color:theme.colors.opposite}}>Available: ${item.balances.available}</Text>
              </View>
            </View>
          )}
        />
        </View>
        <View style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 20}}>
          <Text style={{color: theme.colors.opposite, fontSize: 18, fontWeight: "bold"}}>Cards</Text>
          <FeatherIcons style={{color:theme.colors.opposite}} name="edit-3" size={20}/>
        </View>

        <View style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 20}}>
          <Text style={{color: theme.colors.opposite, fontSize: 18, fontWeight: "bold"}}>Transactions</Text>
        </View>
      </View>
    </View>
  )
}

export default Bank;