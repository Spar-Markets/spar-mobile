import React, {useState, useEffect, useRef} from 'react';
import { ScrollView, Text, TouchableOpacity, View, useColorScheme} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {GraphPoint, LineGraph} from 'react-native-graph';
import {serverUrl, websocketUrl} from '../../constants/global';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import Timer from './Timer';
import GameCardSkeleton from './GameCardSkeleton';
import { Area, CartesianChart, Line, PointsArray, useChartPressState, useLinePath } from 'victory-native';
import { Group, Path, useFont, Circle, useImage, Rect } from '@shopify/react-native-skia';
import HapticFeedback from "react-native-haptic-feedback";
import getCurrentPrice from '../../utility/getCurrentPrice';
//import { addWebSocket, removeWebSocket } from '../../GlobalDataManagment/websocketSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addOrUpdateMatch, initializeMatch, updateOppTickerPrices, updateYourTickerPrices } from '../../GlobalDataManagment/matchesSlice';
import { RootState } from '../../GlobalDataManagment/store';
import { BlurView } from '@react-native-community/blur';
import { Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import PositionCard from '../HeadToHeadComponents/PositionCard';
import createGlobalStyles from '../../styles/createGlobalStyles';
import TrapezoidView from '../GlobalComponents/TrapazoidView';
import { Image } from 'react-native';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase/firebase';
import { Skeleton } from '@rneui/base';
import { runOnJS, SharedValue, useAnimatedReaction, useDerivedValue, useSharedValue } from 'react-native-reanimated';


interface GameCardProps {
  userID: string;
  matchID: string;
  setActiveMatches: React.Dispatch<React.SetStateAction<any[]>>; // Adjust the type as per your needs
  expandMatchSummarySheet: any
  setActiveMatchSummaryMatchID: any
  profileImageUri: string
  activeMatches: string[]
}


const GameCard: React.FC<GameCardProps> = ({ userID, matchID, setActiveMatches, expandMatchSummarySheet, setActiveMatchSummaryMatchID, profileImageUri, activeMatches }) => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();

  FeatherIcon.loadFont()

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);


  interface PortfolioSnapshot {
    value: number;
    timeField: number;
  }

  const [yourPointData, setYourPointData] = useState<any | null>(null);
  const [opponentPointData, setOpponentPointData] = useState<any | null>(null);
  const [opponentUsername, setOpponentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [yourFormattedData, setYourFormattedData] = useState<any[] | null>(null)
  const [oppFormattedData, setOppFormattedData] = useState<any[] | null>(null)
  const [minY, setMinY] = useState(0)
  const [maxY, setMaxY] = useState(0)
  const [yourColor, setYourColor] = useState("#fff")
  const [oppColor, setOppColor] = useState("#fff")
  //const [yourAssets, setYourAssets] = useState<any[] | null>(null)
  //const [opponentAssets, setOpponentAssets] = useState<any[] | null>(null)
  //const [yourTickerPrices, setYourTickerPrices] = useState<{ [ticker: string]: number }>({});


  
  
  //const [oppTickerPrices, setOppTickerPrices] = useState<{ [ticker: string]: number }>({});
  const [match, setMatch] = useState<any | null>(null)
  const [yourTotalPrice, setYourTotalPrice] = useState(100000)
  const [oppTotalPrice, setOppTotalPrice] = useState(100000)
  const [gotInitialPrices, setGotInitialPrices] = useState(false)
  const [initialDataLoad, setInitialDataLoad] = useState(false)
  
  const [yourAssets, setYourAssets] = useState<any[] | null>(null)
  const [opponentAssets, setOpponentAssets] = useState<any[] | null>(null)

  const [yourBuyingPower, setYourBuyingPower] = useState(0)
  const [oppBuyingPower, setOppBuyingPower] = useState(0)
  
  const [you, setYou] = useState("")
  const [opp, setOpp] = useState("")

  const dispatch = useDispatch()

  //const [yourTickerPrices, setYourTickerPrices] = useState({})
  //const [oppTickerPrices, setOppTickerPrices] = useState({})

  const matchAssets = useSelector((state: RootState) => state.matches[matchID]);
  //const yourTickerPrices = matchAssets ? matchAssets.yourTickerPrices : {};
  //const oppTickerPrices = matchAssets ? matchAssets.oppTickerPrices : {};

  const [yourTickerPrices, setYourTickerPrices] = useState<any>({})
  const [oppTickerPrices, setOppTickerPrices] = useState<any>({})
  //const newYourTickerPrices = { ...yourTickerPrices };
  //const newOppTickerPrices = {...oppTickerPrices};

  const [matchIsOver, setMatchIsOver] = useState(false)
  const ws = useRef<WebSocket | null>(null);

  Icon.loadFont()

  //const { yourAssets, opponentAssets } = matches[matchID].;

  useEffect(() => {
    if (matchID) {
      dispatch(initializeMatch({ matchID }));
    }
  }, [matchID]);


  const getMatchData = async () => {
    try {
      console.log("MATCH ID FROM HOME.TSX", matchID)
      const matchDataResponse = await axios.post(serverUrl + '/getMatchData', { matchID: matchID });
      if (matchDataResponse) {
        console.log("About to set match, STEP 2 should run in a sec");
        setMatch(matchDataResponse.data)
      }
    } catch (error) {
      console.error('in get match data error' + error);
    }
  };

  useEffect(() => {
    if (matchAssets && initialDataLoad) {
      //console.log("Updated Match Assets", matchAssets)
      setYourAssets(matchAssets.yourAssets)
      setOpponentAssets(matchAssets.opponentAssets)
    }
  }, [initialDataLoad])

  const setUserMatchData = async (yourUserNumber: string, opponentUserNumber: string) => {
    try {
      // get portfolio snapshots
      const snapshots = await axios.post(serverUrl + '/getSnapshots', { matchID: match.matchID })

      const yourSnapshots: PortfolioSnapshot[] = snapshots.data[`${yourUserNumber}Snapshots`];
      
      const yourPoints: GraphPoint[] = yourSnapshots.map((snapshot) => ({
        value: snapshot.value,
        date: new Date(snapshot.timeField), // Ensure date is in timestamp format
      }));

      console.log("About to set your point data");
      

      const oppSnapshots: PortfolioSnapshot[] = snapshots.data[`${opponentUserNumber}Snapshots`];
      const oppPoints: GraphPoint[] = oppSnapshots.map((snapshot) => ({
        value: snapshot.value,
        date: new Date(snapshot.timeField), // Ensure date is in timestamp format
      }));
      

 
      //console.log("YOUR ASSETS",match[yourUserNumber].assets)
      //console.log("OPP ASSETS",match[opponentUserNumber].assets)
      console.log("YOUR ASSETS FROM MATCH OBJECT:", match[yourUserNumber].assets)



      //initial load to setAssets for the first time from the database
      setYourAssets(match[yourUserNumber].assets)
      setOpponentAssets(match[opponentUserNumber].assets)

      setYourBuyingPower(match[yourUserNumber].buyingPower)
      setOppBuyingPower(match[opponentUserNumber].buyingPower)

      
      dispatch(addOrUpdateMatch({matchID, yourAssets: match[yourUserNumber].assets, opponentAssets: match[opponentUserNumber].assets, yourBuyingPower: match[yourUserNumber].buyingPower, oppBuyingPower: match[opponentUserNumber].buyingPower}))
      console.log("AFTER DISPATCH YOUR ASSETS:", matchAssets.yourAssets)
      console.log("AFTER DISPATCH OPP ASSETS:", matchAssets.opponentAssets)
      
      setYourPointData(yourPoints);
      setOpponentPointData(oppPoints);

      const response = await axios.post(serverUrl + '/getUsernameByID', { userID: match[opponentUserNumber].userID });
      setOpponentUsername(response.data.username);
    } catch (error) {
      console.log('Game card error:', error);
    }
  };

  const setData = async () => {
    if (match.user1.userID === userID) {
      setUserMatchData('user1', 'user2');
      setYou('user1')
      setOpp('user2')
      getOtherProfileImage('user2')
    } else if (match.user2.userID === userID) {
      setUserMatchData('user2', 'user1');
      setYou('user2')
      setOpp('user1')
      getOtherProfileImage('user1')
    } else {
      console.error('Error determining whether active user is user1 or user2.');
    }
    //await getInitialPrices() 
  }

  const formatData = async () => {
    const sourceData = yourPointData.filter((item:any, index:any) => index % 2 === 0)
    const data = sourceData // Select every 10th item
    .map((item:any, index:number) => ({
      value: item.value,
      normalizedValue: item.value - 100000,
      index: index,
      date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
    }));
    setYourFormattedData(data)

    const sourceData2 = opponentPointData.filter((item:any, index:any) => index % 2 === 0)
    const data2 = sourceData2 // Select every 10th item
    .map((item:any, index:number) => ({
      value: item.value,
      normalizedValue: item.value - 100000,
      index: index,
      date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
    }));
    //console.log("DATA 2 TO BECOME OPP FOMRATTED DATA:", data2)
    setOppFormattedData(data2)

    const dataMax = Math.max(...data.map((item:any) => item.normalizedValue))
    const data2Max = Math.max(...data2.map((item:any) => item.normalizedValue))
    const dataMin = Math.min(...data.map((item:any) => item.normalizedValue))
    const data2Min = Math.min(...data2.map((item:any) => item.normalizedValue))
    

    if (data2Max > dataMax) {
      setMaxY(data2Max)
      //console.log("Data: " + data2Max, dataMax)
    } else {
      setMaxY(dataMax)
      //console.log("Data: " + data2Max, dataMax)
    }

    if (data2Min > dataMin) {
      setMinY(dataMin)
    } else {
      setMinY(data2Min)
    }

    console.log("About to run STEP 4");
    await getInitialPrices();
    console.log("Just ran step 4");
  }
  

  // put into loading state when out of focus
  useFocusEffect(
    React.useCallback(() => {
      //console.log("INITIAL DATA LOADED", initialDataLoad)
      if (initialDataLoad) {
        //setLoading(false)
      }
      return () => {
        console.log("INITIAL DATA LOADED", initialDataLoad)
        //setLoading(true);
      }
    }, [initialDataLoad])
  )


  // grab updated match data every time gamecard comes into focus
  useEffect(() => {
    if (!initialDataLoad) {
      console.log("------------------------------------------------------------------")
      console.log("STEP 1: GETTING MATCH DATA FROM MONGO")
      getMatchData()
      console.log("POST STEP 1: Just got match data");
    }
  }, [])

  useEffect(() => {
    if (match) {
      setData()
    }
  }, [match])


  // Log the state to check if data is populated
  useEffect(() => {
    console.log("Just ran useEffect triggered by change in yourPointData");
    if (yourPointData && yourAssets && opponentPointData && opponentAssets && !initialDataLoad) { //setData() was good
      console.log("STEP 3: SETTING FORMATTED DATA")
      formatData()
    }
  }, [opponentPointData]);

  const getInitialPrices = async () => {
    console.log("Your Assets before getting initial prices", yourAssets)
    console.log("Opp Assets before getting initial prices", opponentAssets)
    if (yourAssets && opponentAssets) {
      try {
        const yourInitialTickerPromises = yourAssets.map(async (item) => {
          const currentPrice = await getCurrentPrice(item.ticker);
          return { ticker: item.ticker, currentPrice };
        });
    
        const yourInitialTickerPricesArray:any = await Promise.all(yourInitialTickerPromises);
        const yourInitialTickerPrices = yourInitialTickerPricesArray.reduce((acc:any, item:any) => {
          acc[item.ticker] = item.currentPrice;
          return acc;
        }, {});
        
        //initial dispatch to redux (in case no messages come in when match made)
        //setYourTickerPrices(yourInitialTickerPrices);
        setYourTickerPrices(yourInitialTickerPrices)
        dispatch(updateYourTickerPrices({matchID: matchID, yourTickerPrices: yourInitialTickerPrices}));

    
        const oppInitialTickerPromises = opponentAssets.map(async (item) => {
          const currentPrice = await getCurrentPrice(item.ticker);
          return { ticker: item.ticker, currentPrice };
        });
    
        const oppInitialTickerPricesArray:any = await Promise.all(oppInitialTickerPromises);
        const oppInitialTickerPrices = oppInitialTickerPricesArray.reduce((acc:any, item:any) => {
          acc[item.ticker] = item.currentPrice;
          return acc;
        }, {});
        
        setOppTickerPrices(oppInitialTickerPrices)
        dispatch(updateOppTickerPrices({matchID: matchID, oppTickerPrices: oppInitialTickerPrices}));
    
        //setOppTickerPrices(oppInitialTickerPrices);
        //console.log("Your Prices", yourInitialTickerPrices)
        //console.log("Opp Prices", oppInitialTickerPrices)
        console.log("STEP 4: SETTING INITIAL PRICES FOR HELD ASSETS")
        setGotInitialPrices(true);
      } catch (error) {
        console.error('Error fetching initial prices:', error);
      }
  };
}

 /* useEffect(() => {
    if (yourFormattedData != null && oppFormattedData != null) {
      //check if the formatteddatas have any value //TODO when there is no formatted data so jackson make snapshot always be added at match creation
      if (yourFormattedData[yourFormattedData.length-1]?.value != undefined && oppFormattedData[oppFormattedData.length-1]?.value != undefined) {
        //INTIALIZATION OF COLOR AND PRICES
   
        setYourTotalPrice(yourFormattedData[yourFormattedData.length-1].value)
        //console.log("Opp formatted data", oppFormattedData);

        setOppTotalPrice(oppFormattedData[oppFormattedData.length-1].value)
        if (yourFormattedData[yourFormattedData.length-1].value >= oppFormattedData[oppFormattedData.length-1].value) {
          setYourColor(theme.colors.stockUpAccent)
          setOppColor(theme.colors.tertiary)
        } else {
          setYourColor(theme.colors.stockDownAccent)
          setOppColor(theme.colors.tertiary)
        }
        //getInitialPrices() 
      }
    } else {
      setLoading(true)
    }
  }, [yourFormattedData, oppFormattedData])*/

  useEffect(() => {
    if (yourTickerPrices & oppTickerPrices) {
      console.log("HELP MEEE", yourTickerPrices)
    }
  }, [yourTickerPrices])


  useEffect(() => {
    if (gotInitialPrices == true && !initialDataLoad) {
      console.log("STEP 5: INITIAL PRICES WERE SET")
      //console.log(yourTickerPrices
      setInitialDataLoad(true)
      console.log("SET INITIAL DATA LOAD TO TRUE")
      setLoading(false)
    }
    //FOR DEVELOPMENT SO WEIRD PRICE STUFF DOESNT HAPPEN ON HOT SAVE
    /*if (gotInitialPrices && initialDataLoad) {
      setLoading(false)
    }*/
  }, [gotInitialPrices])

  useEffect(() => {
    console.log("JOE LOG: Initial data load is now", initialDataLoad);
  }, [initialDataLoad])

  //ALL SOCKET STUFF ---------------------------------------
  function uint8ArrayToString(array:any) {
      return array.reduce((data:any, byte:any) => data + String.fromCharCode(byte), '');
  }

  function getNewTickerObject(jsonMessage:any, yourAssets:any) {
    // Convert yourAssets to a map for quick lookup
    const yourAssetsMap = new Map(yourAssets.map((asset:any) => [asset.ticker, asset]));
  
    // Iterate through JSONMessage to find a new object
    for (const company of jsonMessage) {
      if (!yourAssetsMap.has(company.ticker)) {
        return company;
      }
    }
  
    // If no new object is found, return null
    return null;
  }

  useEffect(() => {
    console.log("match is over", matchIsOver)
  }, [matchIsOver])

  /**
   * Use effect for setting game over
   */
  useEffect(() => {
    if (match && match.endAt) {
      // Calculate time until match end
      const end = new Date(match.endAt);
      const now = new Date();
      const timeUntilEnd = end.getTime() - now.getTime();

      console.log(matchID, timeUntilEnd)

      if (timeUntilEnd <= 0) {
        // If the match end time has already passed, set the matchIsOver state variable
        setMatchIsOver(true);
        console.log("CURRENT CLOSING THE GAMECARD WEBSOCKET SINCE MATCH ENDED")
        if (ws.current!) {
          ws.current!.close()
          ws.current = null
          //dispatch(removeWebSocket(matchID))
        }
      } else {
        // Set a timeout to navigate back when the match ends
        const timeoutId = setTimeout(() => {
          // TODO: add popup saying match has ended
          setMatchIsOver(true);
          console.log("CURRENT CLOSING THE GAMECARD WEBSOCKET SINCE MATCH ENDED")
          ws.current!.close()
          ws.current = null
          //dispatch(removeWebSocket(matchID))
        }, timeUntilEnd);

        // Clear timeout if the component unmounts before the match ends
        return () => clearTimeout(timeoutId);
      }
    }
  }, [match]);


  const [retries, setRetries] = useState(0);

  const MAX_RETRIES = 5;  // Maximum number of retry attempts
  const RETRY_DELAY = 2000; // Delay between retries in milliseconds


  /* useEffect(() => {
    console.log("YOUR ASSETS:", yourAssets)
    console.log("OPP ASSETS:", opponentAssets)
  }, [yourAssets, opponentAssets])
  */

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const sendHeartbeat = () => {
    if (ws.current) {
      //console.log("SENDING WS HEARTBEAT FROM GAMECARD")
      //console.log("FROM GAME CARD", ws.current)
      const heartbeat = {type: "heartbeat"}
      ws.current.send(JSON.stringify(heartbeat))
    }
  }

  useEffect(() => {
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // 30 seconds interval

    // Clear the interval when the component unmounts
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [])

  

  if (ws.current!) {
    ws.current.onmessage = async (event) => {
      const buffer = new Uint8Array(event.data);

      if (event.data == "Websocket connected successfully") {
        return;
      }


      const message = uint8ArrayToString(buffer); 
      //const JSONMessage = JSON.parse(message);
      //console.log("MESSAGE:", message);
      // // test tf
      //console.log("EVENT:", event)
      //console.log("event.data:", event.data);
      // console.log("buffer:", buffer);

      
      try {
        //console.log("ABOUT TO PARSE");
        //console.log("CHECK THIS", event.data)
        let JSONMessage
        try {
          JSONMessage = JSON.parse(event.data)
        } catch {
          JSONMessage = JSON.parse(message)
        }
        //console.log("JUST PARSED");
        if (JSONMessage.type == "updatedAssets") {
          // Handle updated assets
          console.log("INSIDE UPDATED ASSETS!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
          const yourUpdatedAssets = JSONMessage[`${you}Assets`];
          const oppUpdatedAssets = JSONMessage[`${opp}Assets`];

          const yourBuyingPower = JSONMessage[`${you}BuyingPower`]
          const oppBuyingPower = JSONMessage[`${opp}BuyingPower`]

          setYourBuyingPower(yourBuyingPower)
          setOppBuyingPower(oppBuyingPower)

          const yourNewAsset = getNewTickerObject(yourUpdatedAssets, yourAssets);
          const oppNewAsset = getNewTickerObject(oppUpdatedAssets, opponentAssets);
          console.log("THIS IS THE RECIEVED MESSAGE", JSONMessage)

          const newYourTickerPrices = yourTickerPrices
          const newOppTickerPrices = oppTickerPrices
           
          // both cases
          //setYourAssets(yourUpdatedAssets);
          //setOpponentAssets(oppUpdatedAssets);
          console.log("UPDATED ASSETS", yourUpdatedAssets)
          //redux version
          
          for (const asset of yourUpdatedAssets) {
            if (!(asset.ticker in yourTickerPrices)) {
              newYourTickerPrices[asset.ticker] = await getCurrentPrice(asset.ticker)
            }
          }

          for (const asset of oppUpdatedAssets) {
            if (!(asset.ticker in oppTickerPrices)) {
              newOppTickerPrices[asset.ticker] = await getCurrentPrice(asset.ticker)
            }
          }
        
          console.log("LOG SUPER IMPORTANT:", newYourTickerPrices);

          dispatch(addOrUpdateMatch({
            matchID,
            yourAssets: yourUpdatedAssets,
            opponentAssets: oppUpdatedAssets,
            yourBuyingPower: yourBuyingPower,
            oppBuyingPower: oppBuyingPower,
            yourTickerPrices: newYourTickerPrices // Add new ticker prices here
          }));

          console.log("AHH", newYourTickerPrices)
          

          //NEED TO REINTIALIZE TICKER PRICES IF NEW TICKER WAS BOUGHT


          //const match = useSelector(state => state.matches[matchID])

          if (yourNewAsset) {
            console.log("YOUR NEW ASSET JUST BOUGHT:", yourNewAsset)
            if (ws.current) {
              console.log("SUBSCRIBING TO YOUR NEW ASSET:", yourNewAsset.ticker)
              ws.current.send(JSON.stringify({ ticker: yourNewAsset.ticker }));
            }
          }

          setYourAssets(yourUpdatedAssets)

          if (oppNewAsset) {
            console.log("OPP NEW ASSET JUST BOUGHT:", oppNewAsset)
            if (ws.current) {
              console.log("SUBSCRIBING TO OPP NEW ASSET:", oppNewAsset.ticker)
              ws.current.send(JSON.stringify({ ticker: oppNewAsset.ticker }));
            }
          }
          setOpponentAssets(oppUpdatedAssets)
   
          //console.log("Updated your assets state:", yourUpdatedAssets);

          //console.log("Updated opp assets state:", oppUpdatedAssets);;
          
          //console.log("UPDATED ASSETS FROM REDUX", matchAssets[matchID].yourAssets, matchAssets[matchID].yourAssets)
        } else if (JSONMessage != "" && gotInitialPrices && yourAssets && opponentAssets) {
          //console.log(JSONMessage)
          //console.log("INSIDE PRICE STUFF THING ------------")
          const { sym, c: currentPrice } = JSONMessage[0];
          const isTickerInYourAssets = yourAssets.some(stock => stock.ticker === sym);
          const isTickerInOppAssets = opponentAssets.some(stock => stock.ticker === sym);

          //console.log(yourAssets)
          if (isTickerInYourAssets) {
            //console.log("UPDATING PRICES!!!!!!!!!!!!!!!!!!!!")
            const updatedPrices = {
              ...yourTickerPrices,
              [sym]: currentPrice,
            };
            dispatch(updateYourTickerPrices({ matchID, yourTickerPrices: updatedPrices }));
            
            setYourTickerPrices((prevPrices:any) => {
              const updatedPrices = {
                ...prevPrices,
                [sym]: currentPrice,
              };
              
              // Dispatch the action with the updated prices
              
              
              return updatedPrices; // Update local state
            });
          }

          if (isTickerInOppAssets) {
            const updatedPrices = {
              ...oppTickerPrices,
              [sym]: currentPrice,
            };
            dispatch(updateOppTickerPrices({ matchID, oppTickerPrices: updatedPrices }));
            setOppTickerPrices((prevPrices:any) => {
              const updatedPrices = {
                ...prevPrices,
                [sym]: currentPrice,
              };
              
              // Dispatch the action with the updated prices
              
              
              return updatedPrices; // Update local state
            });
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
  }
  
  const setupSocket = async () => {    
    console.log("Opening socket with url:", websocketUrl);  
    const socket = new WebSocket(websocketUrl);

    ws.current = socket;
    
    ws.current.onopen = () => {
        console.log(`Connected to GameCard Websocket, but not ready for messages...`);
        if (ws.current! && yourAssets && opponentAssets) {
          //dispatch(addWebSocket({ id: matchID, ws: ws.current }));
          console.log(`Connection for GameCard Websocket is open and ready for messages`);
          // first send match ID
          ws.current!.send(JSON.stringify({ matchID: match.matchID }))
          yourAssets.forEach((asset:any) => {
            ws.current!.send(JSON.stringify({ ticker: asset.ticker}));
          })
          opponentAssets.forEach((asset:any) => {
            ws.current!.send(JSON.stringify({ ticker: asset.ticker}));
          })
        } else {
          console.log('WebSocket is not open');
        }
    };

    ws.current.onerror = (error) => {
        console.log('WebSocket error:', error || JSON.stringify(error));
        if (retries < MAX_RETRIES) {
          console.log(`Retrying connection (${retries + 1}/${MAX_RETRIES})...`);
          setRetries(retries + 1);
          setTimeout(() => {
              setupSocket();
          }, RETRY_DELAY);
        } else {
          console.error('Maximum retry attempts reached. Unable to connect to WebSocket.');
        }
    };

    ws.current.onclose = () => {
      //dispatch(removeWebSocket(matchID));
      console.log(`Connection to GameCard Asset Websocket closed`);
    };
  };

  const yourTotalPriceRef = useRef(yourTotalPrice);
  const oppTotalPriceRef = useRef(oppTotalPrice);

  //const {state, isActive} = useChartPressState({x: 0, y: {normalizedValue: 0}});

  useEffect(() => {
    yourTotalPriceRef.current = yourTotalPrice;
  }, [yourTotalPrice]);

  useEffect(() => {
    oppTotalPriceRef.current = oppTotalPrice;
  }, [oppTotalPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      setYourFormattedData((prevPointData:any) => {
        const newPointData = [...prevPointData];
        newPointData[newPointData.length - 1] = {
          ...newPointData[newPointData.length - 1],
          normalizedValue: yourTotalPriceRef.current - prevPointData[0].value,
          value: yourTotalPriceRef.current,
          date: new Date(Date.now()).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        };
        newPointData.push({
          value: yourTotalPriceRef.current,
          normalizedValue: yourTotalPriceRef.current - prevPointData[0].value,
          date: new Date(Date.now()).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        });
        console.log("adding point", newPointData[newPointData.length-1])
      
        return newPointData
      })
    }, 10000)
    return () => clearInterval(interval);
  }, [])


  //sets total live prices for each user
  useEffect(() => {
    //console.log("Ticker Prices: ", tickerPrices)
    if (yourAssets && opponentAssets && gotInitialPrices && yourTickerPrices && oppTickerPrices) {
      let yourTotalLivePrice = 0;
      yourAssets.forEach(asset => {
        if (yourTickerPrices[asset.ticker]) {
          const livePrice = yourTickerPrices[asset.ticker] * asset.totalShares;
          yourTotalLivePrice += livePrice;
        } else {
          //console.log(`Ticker price for ${asset.ticker} not found`);
        }
      });
      setYourTotalPrice(yourTotalLivePrice + yourBuyingPower)
      if (yourFormattedData && yourFormattedData.length >= 1) {
        yourFormattedData[yourFormattedData.length-1].normalizedValue = yourTotalLivePrice + yourBuyingPower - 100000;
      }

      let oppTotalLivePrice = 0;
      opponentAssets.forEach(asset => {
        if (oppTickerPrices[asset.ticker]) {
          const livePrice = oppTickerPrices[asset.ticker] * asset.totalShares;
          oppTotalLivePrice += livePrice;
        } else {
          //console.log(`Ticker price for ${asset.ticker} not found`);
        }
      });
      setOppTotalPrice(oppTotalLivePrice + oppBuyingPower)
      if (oppFormattedData && oppFormattedData.length >= 1) {
        oppFormattedData[oppFormattedData.length-1].normalizedValue = oppTotalLivePrice + oppBuyingPower - 100000
        
      }
      /**/
      if (yourFormattedData && oppFormattedData) {
        //console.log(yourTotalLivePrice, oppTotalLivePrice)
        if (yourTotalLivePrice + yourBuyingPower >= oppTotalLivePrice + oppBuyingPower) {
          setYourColor(theme.colors.stockUpAccent)
          setOppColor(theme.colors.tertiary)

        } else {
          setYourColor(theme.colors.stockDownAccent)
          setOppColor(theme.colors.tertiary)
        }
        const yourMax = Math.max(...yourFormattedData.map((item:any) => item.normalizedValue))
        const oppMax = Math.max(...oppFormattedData.map((item:any) => item.normalizedValue))
        const yourMin = Math.min(...yourFormattedData.map((item:any) => item.normalizedValue))
        const oppMin = Math.min(...oppFormattedData.map((item:any) => item.normalizedValue))
        

        if (oppMax > yourMax) {
          setMaxY(oppMax)
          //console.log("Data: " + data2Max, dataMax)
        } else {
          setMaxY(yourMax)
          //console.log("Data: " + data2Max, dataMax)
        }

        if (oppMin > yourMin) {
          setMinY(yourMin)
        } else {
          setMinY(oppMin)
        }
      }
    }
}, [yourTickerPrices, oppTickerPrices, yourAssets, opponentAssets, gotInitialPrices])
  //END OF SOCKET STUFF--------------------------------------------------------

  const hexToRGBA = (hex:any, alpha = 1) => {
    let r = 0, g = 0, b = 0;
  
    // Check if hex is in shorthand format (e.g., #fff)
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  function LiveIndicator({ x, y, color }: { x: number, y: number, color: any }) {
    return (
      <Group>
        <Circle cx={x} cy={y} r={12} color={color} opacity={0.05} />
        <Circle cx={x} cy={y} r={7} color={color} opacity={0.2} />
        <Circle cx={x} cy={y} r={3} color={color}/>
      </Group>
    );
  }
  
  const length = 10;
  const arrayWithZeroValues = Array.from({ length }, (_, index) => ({ index, value: 0 }));

  const [otherProfileUri, setOtherProfileUri] = useState<any>(null)

  const getOtherProfileImage = async (user:string) => {
    try {
      const imageRef = ref(storage, `profileImages/${match[user].userID}`);
      const url = await getDownloadURL(imageRef);
      setOtherProfileUri(url)
    } catch (error) {
      console.log("No image in firebase for other user")
    }
  }

  useEffect(() => {
    if (!ws.current && initialDataLoad == true) {
      setupSocket();
    }
  }, [initialDataLoad])
  
  if (loading && initialDataLoad) {
    return (
      <View style={{height: 250, width: width}}></View>
    )
  }

  const handleDismiss = () => {
    setActiveMatches((prevMatches) => {
      console.log('Active Matches', activeMatches)
      console.log('Previous Matches:', prevMatches); // Log previous matches
      console.log('Dismissed matchid:', matchID)
      console.log('Matches after Dismiss', prevMatches.filter((match) => match !== matchID))
      return prevMatches.filter((match) => match != matchID);
    });
  };

  const spacing = useSharedValue(0);

  function ToolTip({
    x,
    y,
    color,
  }: {
    x: SharedValue<number>;
    y: SharedValue<number>;
    color: any;
  }) {
    const adjustedX = useDerivedValue(() => {
      return x.value - spacing.value;
    });

    return (
      <Group>
        <Rect
          x={adjustedX}
          y={0}
          width={1}
          height={400}
          color={theme.colors.opposite}
        />
      </Group>
    );
  }

  /*Math.round(
    ((state.x.position.value / width) * (pointData.length - 1)) /
      marketFraction,
  );*/

  const [animatedIndex, setAnimatedIndex] = useState(0)
  
  const {state, isActive} = useChartPressState({ x: 0, y: { normalizedValue: 0 } })

  const currentIndex = useDerivedValue(() => {
    if (yourFormattedData && match) {
      const startTime = (new Date(match.endAt).getTime() - (match.timeframe * 1000))
      const fraction = (Date.now() - startTime) / (match.timeframe * 1000)
      const positionValue = state.x.position.value;
      console.log((positionValue / (width - 60)) * (yourFormattedData.length) / fraction)
      const index = Math.round((positionValue / (width - 60)) * (yourFormattedData.length) / fraction);
      return index;
    }
    return 0
  }, [state, match, yourFormattedData]);

  useAnimatedReaction(
    () => currentIndex.value,
    () => {runOnJS(setAnimatedIndex)(currentIndex.value); console.log(currentIndex.value)}
  )



  return (
    <View style={{flex: 1}}>
      {matchIsOver && 
      <BlurView style={{position: 'absolute', gap: 20, justifyContent: 'center', alignItems:'center', zIndex: 1000000, top: 0, left: 0, bottom: 0, right: 0, marginHorizontal: 20, borderRadius: 10, marginTop: 10}} blurType="dark" blurAmount={2} reducedTransparencyFallbackColor="black">
        <Icon name="checkmark-circle" color={theme.colors.accent} size={40}/>
        <Text style={{fontSize: 24, color: theme.colors.text, fontFamily: 'InterTight-Black'}}>Match Completed!</Text>
        <View style={{flexDirection: 'row', gap: 5}}>
          <TouchableOpacity onPress={() => {setActiveMatchSummaryMatchID(matchID); expandMatchSummarySheet()}} style={{backgroundColor: theme.colors.background, borderWidth: 1, borderRadius: 5, borderColor: theme.colors.tertiary}}>
            <Text style={{paddingHorizontal: 20, paddingVertical: 5, fontFamily: 'InterTight-Bold', color: theme.colors.text}}>View Results</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDismiss} style={{backgroundColor: theme.colors.background, borderWidth: 1, borderRadius: 5, borderColor: theme.colors.tertiary}}>
            <Text style={{paddingHorizontal: 20, paddingVertical: 5, fontFamily: 'InterTight-Bold', color: theme.colors.text}}>Dismiss</Text>
          </TouchableOpacity>
        </View> 
      </BlurView>}
    {!loading && match && yourFormattedData ?
    <>
      <View style={styles.gameCardContainer}/*style={styles.gameCardContainer}*/ /*onPress={() => {
      navigation.navigate("GameScreen", {
        matchID: match.matchID, 
        userID: userID, 
        endAt: match.endAt,
        opponentUsername: opponentUsername,
      })
      
        HapticFeedback.trigger("impactMedium", {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false
        });
      }
      
      }*/>
        <View style={{flexDirection: 'row', marginTop: 10, marginHorizontal: 10, marginBottom: 5, gap: 5}}>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: theme.colors.background, paddingVertical: 5, paddingHorizontal: 15, borderRadius: 5, gap: 10}}>
            <Timer endDate={match.endAt} timeFrame={match.timeframe} />
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, paddingVertical: 5, paddingHorizontal: 15, borderRadius: 5, gap: 10}}>
            <FontAwesomeIcon name="gamepad" color={theme.colors.text} style={{marginBottom: 3}} size={20}/>
            <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>{match.matchType}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, paddingVertical: 5, paddingHorizontal: 15, borderRadius: 5, gap: 10}}>
            <FontAwesomeIcon name="money" color={theme.colors.text} size={20}/>
            <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>${match.wagerAmt}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{paddingTop: 0}}>
          <View style={{backgroundColor: theme.colors.background, flexDirection: 'row', marginTop: 0, height: 180, gap: 10, justifyContent: 'center', marginHorizontal: 10, borderRadius: 5}}>
            <View style={{marginRight: 10, backgroundColor: 'transparent', flex:1,  borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 5}}>
              <Image source={{uri: profileImageUri}} width={60} height={60} style={{borderRadius: 100}}></Image>
              <Text style={styles.userText}>You</Text>
              {!isActive ?
              <>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>${(yourTotalPrice).toFixed(2)}</Text>
              <View style={[styles.percentIndicator, {backgroundColor: hexToRGBA(yourColor, 0.3)}]}>
                <Text style={[styles.percentText, {color: yourColor}]}>{((yourTotalPrice-100000)/(0.01*100000)).toFixed(2)}%</Text>
              </View>
              </> :
              <>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>${(animatedIndex)}</Text>
              <View style={[styles.percentIndicator, {backgroundColor: hexToRGBA(yourColor, 0.3)}]}>
                <Text style={[styles.percentText, {color: yourColor}]}>{((yourTotalPrice-100000)/(0.01*100000)).toFixed(2)}%</Text>
              </View>
              </>
              }
            
            </View>
            <View style={{backgroundColor: 'transparent', borderRadius: 8, flex:1, justifyContent: 'center', alignItems: 'center', gap: 5}}>
            <Image source={{uri: otherProfileUri}} width={60} height={60} style={{borderRadius: 100}}></Image>
              <Text style={styles.userText}>{opponentUsername}</Text>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>${(oppTotalPrice).toFixed(2)}</Text>
              <View style={[styles.percentIndicator, {backgroundColor: hexToRGBA(oppColor, 0.3)}]}>
                <Text style={[styles.percentText, {color: oppColor}]}>{((oppTotalPrice-100000)/(0.01*100000)).toFixed(2)}%</Text>
              </View>
            </View>
            <View style={{backgroundColor: theme.colors.primary, borderRadius: 100, borderColor: theme.colors.text, borderWidth: 1, position: 'absolute', top: 70, height: 40, width: 40, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-Bold'}}>VS</Text>
            </View>
 
          </View>
          <View style={{
                flexDirection: 'row', 
                marginTop: 5,
                backgroundColor: theme.colors.background,
                padding: 20,
                borderRadius: 5,
                alignItems: 'center',
                gap: 10,
                marginHorizontal: 10
              }}>
              <FontAwesomeIcon name="bank" color={theme.colors.text} size={20}/>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-bold'}}>Buying Power</Text>
              <View style={{flex: 1}}></View>
              <Text style={{color: theme.colors.text, fontFamily: 'InterTight-bold'}}>${(yourBuyingPower.toLocaleString())}</Text>
          
            </View>
      
          <View style={{marginTop: 5, height: 135, backgroundColor: theme.colors.background, marginHorizontal: 10, borderRadius: 5}}>
          <View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
                {/*reference line*/}
                <CartesianChart data={arrayWithZeroValues} xKey="index" yKeys={["value"]} domain={{y: [minY, maxY]}}>
                    {({ points }) => {
                    return (
                    <>
                      <Group>
                      <Line points={points.value} color={theme.colors.tertiary} 
                      strokeWidth={1} /*animate={{ type: "timing", duration: 300 }}*/ curveType='linear'></Line>
                      </Group>
                    </>
                    )
                  
                  }}
                </CartesianChart>
              </View>
            {oppFormattedData && oppFormattedData?.length >= 1 && 
            <View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
            <CartesianChart data={oppFormattedData!} xKey="index" yKeys={["normalizedValue"]}
              domain={{y: [minY, maxY],
                x: [0, oppFormattedData!.length/(((match.timeframe*1000) - ((new Date(match.endAt)).getTime() - Date.now()))/(match.timeframe*1000))]
              }}>
              {({ points }) => (
              // 👇 and we'll use the Line component to render a line path.
                <>
                <Line points={points.normalizedValue} color={hexToRGBA(oppColor, 0.5)} 
                strokeWidth={2} /*animate={{ type: "timing", duration: 50 }}*//>
                <LiveIndicator x={points.normalizedValue[points.normalizedValue.length-1].x}
                y={points.normalizedValue[points.normalizedValue.length-1].y!}
                color={hexToRGBA(oppColor, 0.5)}
                />
                </>
              )}
            </CartesianChart>
            </View>}
            {yourFormattedData && yourFormattedData.length >= 1 && 
            <View style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 10,
              }}>
            <CartesianChart data={yourFormattedData!} xKey="index" yKeys={["normalizedValue"]} chartPressState={state} 
              domain={{y: [minY, maxY],
                x: [0, yourFormattedData!.length/(((match.timeframe*1000) - ((new Date(match.endAt)).getTime() - Date.now()))/(match.timeframe*1000))]
              }}>  
              {({ points }) => {
                //console.log(yourFormattedData)
              // 👇 and we'll use the Line component to render a line path.
              return (
                <>
                <Line points={points.normalizedValue} color={yourColor} 
                strokeWidth={2} /*animate={{ type: "timing", duration: 300 }}*//>
                <LiveIndicator x={points.normalizedValue[points.normalizedValue.length-1].x}
                y={points.normalizedValue[points.normalizedValue.length-1].y!}
                color={yourColor}
                />
                {isActive && 
                  <ToolTip x={state.x.position}
                  y={state.y.normalizedValue.position}
                  color={yourColor}/>
                }
                </>)
              }}
            </CartesianChart>
            </View>}
          </View>
          <View style={{marginHorizontal: 0}}>

            {yourAssets && yourAssets.length >= 1 && 
              <View style={{marginTop: 20}}>
                <Text style={{fontSize: 18, marginHorizontal: 10, color: theme.colors.text, fontFamily: 'InterTight-Bold', marginBottom: 10}}>My Positions</Text>
                {yourAssets.map((asset, index) => (
                  <PositionCard
                    key={index}
                    ticker={asset.ticker}
                    qty={asset.totalShares}
                    matchID={matchID}
                    buyingPower={yourBuyingPower} // Adjust according to your data structure
                    assets={yourAssets} // Adjust according to your data structure
                    endAt={match.endAt}
                  />
                ))}
              </View>}
          </View>
        </ScrollView>
        <View style={{marginHorizontal: 10, gap: 5, flexDirection: 'row'}}>
          <TouchableOpacity onPress={() =>{navigation.navigate("InGameStockSearch", {
              matchID: matchID, 
              userNumber: you, 
              buyingPower: yourBuyingPower, 
              assets: yourAssets,
              endAt: match.endAt   
              })}} style={[{marginVertical: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: hexToRGBA(yourColor, 0.3), justifyContent: 'center', borderRadius: 5 }]}>
              <FeatherIcon name="message-circle" size={24} style={{paddingHorizontal: 10}} color={yourColor}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() =>{navigation.navigate("InGameStockSearch", {
              matchID: matchID, 
              userNumber: you, 
              buyingPower: yourBuyingPower, 
              assets: yourAssets,
              endAt: match.endAt   
              })}} style={[{flex: 1,marginVertical: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: hexToRGBA(yourColor, 0.3), justifyContent: 'center', borderRadius: 5 }]}>
              <Text style={{color: yourColor, fontFamily: 'InterTight-Black', fontSize: 18}}>Trade</Text>
          </TouchableOpacity>

          
        </View>
      </View>

    </>
    : 
    <View style={{width: width-40, flex: 1, marginHorizontal: 20, marginTop: 10}}>
      <Skeleton animation={"pulse"} style={{flex: 1, borderRadius: 10, backgroundColor: theme.colors.secondary}} skeletonStyle={{backgroundColor: theme.colors.primary}}/>
    </View>}
    </View>
  );
};

export default GameCard;