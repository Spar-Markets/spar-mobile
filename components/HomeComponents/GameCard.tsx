import React, { useState, useEffect, useRef, act, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, useColorScheme, Platform, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { GraphPoint, LineGraph } from 'react-native-graph';
import { serverUrl, websocketUrl } from '../../constants/global';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather'
import EntypoIcon from 'react-native-vector-icons/Entypo'
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
import { addOrUpdateMatch, deleteMatch, initializeMatch, updateOppTickerPrices, updateYourTickerPrices } from '../../GlobalDataManagment/matchesSlice';
import { RootState } from '../../GlobalDataManagment/store';
import { BlurView } from '@react-native-community/blur';
import { Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import PositionCard from '../HeadToHeadComponents/PositionCard';
import createGlobalStyles from '../../styles/createGlobalStyles';
import TrapezoidView from '../GlobalComponents/TrapazoidView';


import { Image } from 'react-native';
import { getDownloadURL, ref } from 'firebase/storage';
import { Skeleton } from '@rneui/base';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { removeMatch } from '../../GlobalDataManagment/activeMatchesSlice';
import { debounce, min } from 'lodash';
import getProfileImage from '../../utility/getProfileImage';


interface GameCardProps {
  userID: string;
  matchID: string;
  expandMatchSummarySheet: any
  setActiveMatchSummaryMatchID: any
  profileImageUri: string
}

const imageMap = [
  '',
  require('../../assets/images/profile1.png'),
  require('../../assets/images/profile2.png'),
  require('../../assets/images/profile3.png'),
];





const GameCard: React.FC<GameCardProps> = ({ userID, matchID, expandMatchSummarySheet, setActiveMatchSummaryMatchID, profileImageUri }) => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();

  FeatherIcon.loadFont()
  EntypoIcon.loadFont()

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createHomeStyles(theme, width);
  const globalStyles = createGlobalStyles(theme, width);

  const activeMatches = useSelector((state: RootState) => state.activeMatches.activeMatches)



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

  const hasDefaultProfileImage = useSelector(
    (state: RootState) => state.user.hasDefaultProfileImage,
  );

  const [addPointInterval, setAddPointInterval] = useState<any>(null)

  const getMatchData = async () => {
    try {

      console.log('MATCH ID FROM HOME.TSX', matchID);
      const matchDataResponse = await axios.post(serverUrl + '/getMatchData', {
        matchID: matchID,
      });
      console.log('grant rahhhhh', matchDataResponse.data);

      if (matchDataResponse) {
        console.log("About to set match, STEP 2 should run in a sec");
        console.log("SETTING MATCH DATA GAMECARD", matchDataResponse.data)
        setMatch(matchDataResponse.data)
        console.log(matchDataResponse.data.timeframe)
        if (matchDataResponse.data.timeframe == 900) {
          setAddPointInterval(10000)
        } else if (matchDataResponse.data.timeframe == 86400) {
          setAddPointInterval(60000)
        } else {
          setAddPointInterval(300000)
        }
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


      dispatch(addOrUpdateMatch({ matchID, yourAssets: match[yourUserNumber].assets, opponentAssets: match[opponentUserNumber].assets, yourBuyingPower: match[yourUserNumber].buyingPower, oppBuyingPower: match[opponentUserNumber].buyingPower }))
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
    const sourceData = yourPointData.filter((item: any, index: any) => index % 2 === 0)
    const data = sourceData // Select every 10th item
      .map((item: any, index: number) => ({
        value: item.value,
        normalizedValue: item.value - 100000,
        index: index,
        date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
      }));
    setYourFormattedData(data)
    setYourFormattedDataLength(data.length)

    const sourceData2 = opponentPointData.filter((item: any, index: any) => index % 2 === 0)
    const data2 = sourceData2 // Select every 10th item
      .map((item: any, index: number) => ({
        value: item.value,
        normalizedValue: item.value - 100000,
        index: index,
        date: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as HH:MM
      }));
    //console.log("DATA 2 TO BECOME OPP FOMRATTED DATA:", data2)
    setOppFormattedData(data2)

    const dataMax = Math.max(...data.map((item: any) => item.normalizedValue))
    const data2Max = Math.max(...data2.map((item: any) => item.normalizedValue))
    const dataMin = Math.min(...data.map((item: any) => item.normalizedValue))
    const data2Min = Math.min(...data2.map((item: any) => item.normalizedValue))


    if (data2Max > dataMax) {
      setMaxY(data2Max)
      //console.log("Data: " + data2Max, dataMax)
    } else {
      setMaxY(dataMax)
      //console.log("Data: " + data2Max, dataMax)
    }

    if (data2Min > dataMin) {

      setMinY(dataMin);
      console.log('rahh', dataMin);
    } else {
      setMinY(data2Min);
      console.log('Rahh', data2Min);

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

        const yourInitialTickerPricesArray: any = await Promise.all(yourInitialTickerPromises);
        const yourInitialTickerPrices = yourInitialTickerPricesArray.reduce((acc: any, item: any) => {
          acc[item.ticker] = item.currentPrice;
          return acc;
        }, {});

        //initial dispatch to redux (in case no messages come in when match made)
        //setYourTickerPrices(yourInitialTickerPrices);
        setYourTickerPrices(yourInitialTickerPrices)
        dispatch(updateYourTickerPrices({ matchID: matchID, yourTickerPrices: yourInitialTickerPrices }));


        const oppInitialTickerPromises = opponentAssets.map(async (item) => {
          const currentPrice = await getCurrentPrice(item.ticker);
          return { ticker: item.ticker, currentPrice };
        });

        const oppInitialTickerPricesArray: any = await Promise.all(oppInitialTickerPromises);
        const oppInitialTickerPrices = oppInitialTickerPricesArray.reduce((acc: any, item: any) => {
          acc[item.ticker] = item.currentPrice;
          return acc;
        }, {});

        setOppTickerPrices(oppInitialTickerPrices)
        dispatch(updateOppTickerPrices({ matchID: matchID, oppTickerPrices: oppInitialTickerPrices }));

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
  function uint8ArrayToString(array: any) {
    return array.reduce((data: any, byte: any) => data + String.fromCharCode(byte), '');
  }

  function getNewTickerObject(jsonMessage: any, yourAssets: any) {
    // Convert yourAssets to a map for quick lookup
    const yourAssetsMap = new Map(yourAssets.map((asset: any) => [asset.ticker, asset]));

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
        console.log("SETTING MATCH OVER TO TRUE")
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
      const heartbeat = { type: "heartbeat" }
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

            setYourTickerPrices((prevPrices: any) => {
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
            setOppTickerPrices((prevPrices: any) => {
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
        yourAssets.forEach((asset: any) => {
          ws.current!.send(JSON.stringify({ ticker: asset.ticker }));
        })
        opponentAssets.forEach((asset: any) => {
          ws.current!.send(JSON.stringify({ ticker: asset.ticker }));
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

  const [yourFormattedDataLength, setYourFormattedDataLength] = useState(0)

  useEffect(() => {


    if (matchIsOver) {
      if (ws.current) {
        ws.current.close();
      }
      return;
    }


    const interval = setInterval(() => {
      setYourFormattedData((prevPointData: any) => {
        const newPointData = [...prevPointData];
        newPointData[newPointData.length - 1] = {
          ...newPointData[newPointData.length - 1],
          normalizedValue: yourTotalPriceRef.current - prevPointData[0].value,
          value: yourTotalPriceRef.current,
          date: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        newPointData.push({
          value: yourTotalPriceRef.current,
          normalizedValue: yourTotalPriceRef.current - prevPointData[0].value,
          date: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        setYourFormattedDataLength(newPointData.length)
        //console.log("adding point", newPointData[newPointData.length - 1])

        return newPointData
      })

      setOppFormattedData((prevPointData: any) => {
        const newPointData = [...prevPointData];
        newPointData[newPointData.length - 1] = {
          ...newPointData[newPointData.length - 1],
          normalizedValue: oppTotalPriceRef.current - prevPointData[0].value,
          value: oppTotalPriceRef.current,
          date: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        newPointData.push({
          value: oppTotalPriceRef.current,
          normalizedValue: oppTotalPriceRef.current - prevPointData[0].value,
          date: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        //setYourFormattedDataLength(newPointData.length)      
        return newPointData
      })
    }, 10000)


    return () => clearInterval(interval);

  }, [matchIsOver])



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
        yourFormattedData[yourFormattedData.length - 1].normalizedValue = yourTotalLivePrice + yourBuyingPower - 100000;
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
        oppFormattedData[oppFormattedData.length - 1].normalizedValue = oppTotalLivePrice + oppBuyingPower - 100000

      }
      /**/
      if (yourFormattedData && oppFormattedData) {
        //console.log(yourTotalLivePrice, oppTotalLivePrice)
        if (yourTotalLivePrice + yourBuyingPower >= oppTotalLivePrice + oppBuyingPower) {
          setYourColor(theme.colors.stockUpAccent)
          setOppColor(theme.colors.stockDownAccent)

        } else {
          setYourColor(theme.colors.stockDownAccent)
          setOppColor(theme.colors.stockUpAccent)
        }
        const yourMax = Math.max(...yourFormattedData.map((item: any) => item.normalizedValue))
        const oppMax = Math.max(...oppFormattedData.map((item: any) => item.normalizedValue))
        const yourMin = Math.min(...yourFormattedData.map((item: any) => item.normalizedValue))
        const oppMin = Math.min(...oppFormattedData.map((item: any) => item.normalizedValue))


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

  const hexToRGBA = (hex: any, alpha = 1) => {
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
        <Circle cx={x} cy={y} r={3} color={color} />
      </Group>
    );
  }


  const referenceLineObject = Array.from({ length: 50 }, (_, index) => ({
    index: index,
    normalizedValue: 0,
  }));

  const [otherProfileUri, setOtherProfileUri] = useState<any>(null)

  const [otherHasDefaultProfileImage, setOtherHasDefaultProfileImage] = useState(false)

  const getOtherProfileImage = async (user: string) => {
    getProfileImage(match[user].userID)
      .then(profileImageResponse => {
        if (profileImageResponse) {
          setOtherHasDefaultProfileImage(profileImageResponse.hasDefaultProfileImage)
          setOtherProfileUri(profileImageResponse.profileImage)
          setLoading(false)
        }
      })
      .catch(error => {
        console.error("error setting profile image", error)
      })
  }

  useEffect(() => {
    if (!ws.current && initialDataLoad == true) {
      setupSocket();
    }
  }, [initialDataLoad])

  if (loading && initialDataLoad) {
    return (
      <View style={{ height: 250, width: width }}></View>
    )
  }

  const handleDismiss = () => {
    /*setActiveMatches((prevMatches) => {
      console.log('Active Matches', activeMatches)
      console.log('Previous Matches:', prevMatches); // Log previous matches
      console.log('Dismissed matchid:', matchID)
      console.log('Matches after Dismiss', prevMatches.filter((match) => match !== matchID))
      return prevMatches.filter((match) => match != matchID);
    });*/
    console.log("Predismiss", activeMatches)
    console.log("Dismissed ID:", matchID)
    console.log("Dismissed Match:", match)
    dispatch(deleteMatch({ matchID }))
    dispatch(removeMatch(matchID))
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

  const { state, isActive } = useChartPressState({ x: 0, y: { normalizedValue: 0 } })

  const sharedIndex = useSharedValue(0);

  useDerivedValue(() => {
    'worklet';
    if (yourFormattedDataLength !== 0 && match) {
      const startTime = new Date(match.endAt).getTime() - match.timeframe * 1000;
      const fraction = (Date.now() - startTime) / (match.timeframe * 1000);
      const positionValue = state.x.position.value;
      const index = Math.round((positionValue / (width - 40)) * (yourFormattedDataLength / fraction));
      sharedIndex.value = index;
    }
  }, [state, match, yourFormattedDataLength]);

  const updateIndex = useCallback(() => {
    setAnimatedIndex(sharedIndex.value);
  }, [sharedIndex]);

  useEffect(() => {
    const id = setInterval(updateIndex, 20);
    return () => clearInterval(id);
  }, [updateIndex]);



  return (
    <View style={{ flex: 1 }}>
      {matchIsOver &&
        <BlurView style={{ position: 'absolute', gap: 20, justifyContent: 'center', alignItems: 'center', zIndex: 1000000, top: 0, left: 0, bottom: 0, right: 0, marginHorizontal: 20, borderRadius: 20, marginTop: 10, borderWidth: 2, borderColor: theme.colors.tertiary }} blurType="dark" blurAmount={10} reducedTransparencyFallbackColor="black">
          <Icon name="checkmark-circle" color={theme.colors.accent} size={40} />
          <Text style={{ fontSize: 24, color: theme.colors.text, fontFamily: 'InterTight-Black' }}>Match Completed!</Text>
          <View style={{ flexDirection: 'row', gap: 5 }}>
            <TouchableOpacity onPress={() => { setActiveMatchSummaryMatchID(matchID); expandMatchSummarySheet() }} style={{ backgroundColor: theme.colors.background, borderWidth: 1, borderRadius: 5, borderColor: theme.colors.tertiary }}>
              <Text style={{ paddingHorizontal: 20, paddingVertical: 5, fontFamily: 'InterTight-Bold', color: theme.colors.text }}>View Results</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDismiss} style={{ backgroundColor: theme.colors.background, borderWidth: 1, borderRadius: 5, borderColor: theme.colors.tertiary }}>
              <Text style={{ paddingHorizontal: 20, paddingVertical: 5, fontFamily: 'InterTight-Bold', color: theme.colors.text }}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </BlurView>}
      {!loading && match && yourFormattedData && oppFormattedData ?

        <View style={styles.gameCardContainer}>

          {/*<View style={{ flexDirection: 'row', marginTop: 10, marginHorizontal: 10, marginBottom: 5, gap: 5 }}>
            <View style={{ flex: 1 }}></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 5, gap: 10 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>{match.matchType}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 5, gap: 10 }}>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>${match.wagerAmt}</Text>
            </View>
          </View>*/}

          <ScrollView showsVerticalScrollIndicator={false} style={{ paddingTop: 0 }}>
            <View style={{ flexDirection: 'row', marginTop: 20, gap: 10, marginHorizontal: 20, borderRadius: 5 }}>
              <View style={{ backgroundColor: 'transparent', flex: 1, borderRadius: 8, justifyContent: 'center', gap: 5, }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {hasDefaultProfileImage == true && (
                    <Image
                      style={[
                        { width: 30, height: 30, borderRadius: 100 },
                      ]}
                      source={{ uri: profileImageUri }}
                    />
                  )}
                  {hasDefaultProfileImage == false && (
                    <Image
                      style={[
                        { width: 30, height: 30, borderRadius: 100 },
                      ]}
                      source={{ uri: profileImageUri }}
                    />
                  )}
                  <Text style={styles.userText}>You</Text>
                </View>
                {!isActive ?
                  <>
                    <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-black', fontSize: 20 }}>
                      ${yourTotalPrice.toFixed(2)}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={[styles.percentIndicator, { backgroundColor: hexToRGBA(yourColor, 0.3), paddingHorizontal: 2, borderColor: yourColor, borderWidth: 0.5 }]}>
                        <EntypoIcon name="triangle-up" color={yourColor} size={18} />
                        <Text style={[styles.percentText, { color: yourColor }]}>{((yourTotalPrice - 100000) / (0.01 * 100000)).toFixed(2)}%</Text>
                      </View>
                    </View>
                  </> :
                  <>
                    <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Black', fontSize: 20 }}>
                      ${yourFormattedData[animatedIndex] ? yourFormattedData[animatedIndex].value.toFixed(2) : yourTotalPrice.toFixed(2)}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={[styles.percentIndicator, { backgroundColor: hexToRGBA(yourColor, 0.3), paddingHorizontal: 2, borderColor: yourColor, borderWidth: 0.5 }]}>
                        <EntypoIcon name="triangle-up" color={yourColor} size={18} />
                        <Text style={[styles.percentText, { color: yourColor }]}>{((yourTotalPrice - 100000) / (0.01 * 100000)).toFixed(2)}%</Text>
                      </View>
                    </View>
                  </>
                }

              </View>
              <View style={{ backgroundColor: 'transparent', flex: 1, borderRadius: 8, justifyContent: 'center', gap: 5, }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                  <Text style={styles.userText}>{opponentUsername}</Text>
                  {otherHasDefaultProfileImage == true && (
                    <Image
                      style={[
                        { width: 30, height: 30, borderRadius: 100 },
                      ]}
                      source={otherProfileUri as any}
                    />
                  )}
                  {otherHasDefaultProfileImage == false && (
                    <Image
                      style={[
                        { width: 30, height: 30, borderRadius: 100 },
                      ]}
                      source={{ uri: otherProfileUri } as any}
                    />
                  )}
                </View>
                {!isActive ?
                  <>
                    <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Black', fontSize: 20, textAlign: 'right' }}>
                      ${oppTotalPrice.toFixed(2)}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <View style={[styles.percentIndicator, { backgroundColor: hexToRGBA(oppColor, 0.3), paddingHorizontal: 2, borderColor: oppColor, borderWidth: 0.5 }]}>
                        <EntypoIcon name="triangle-down" color={oppColor} size={18} />
                        <Text style={[styles.percentText, { color: oppColor }]}>{((oppTotalPrice - 100000) / (0.01 * 100000)).toFixed(2)}%</Text>
                      </View>
                    </View>
                  </> :
                  <>
                    <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Black', fontSize: 20, textAlign: 'right' }}>${oppFormattedData[animatedIndex] ? (oppFormattedData[animatedIndex].value).toFixed(2) : oppTotalPrice.toFixed(2)}</Text>
                    <View style={[styles.percentIndicator, { justifyContent: 'flex-end' }]}>
                      <View style={[styles.percentIndicator, { backgroundColor: hexToRGBA(oppColor, 0.3), paddingHorizontal: 2, borderColor: oppColor, borderWidth: 0.5 }]}>
                        <EntypoIcon name="triangle-down" color={oppColor} size={18} />
                        <Text style={[styles.percentText, { color: oppColor }]}>{((oppTotalPrice - 100000) / (0.01 * 100000)).toFixed(2)}%</Text>
                      </View>
                    </View>
                  </>
                }

              </View>
              {/* <View style={{ backgroundColor: 'transparent', borderRadius: 100, borderColor: theme.colors.text, borderWidth: 1, position: 'absolute', top: 70, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-Bold' }}>VS</Text>
              </View>*/}


            </View>


            <View style={{ marginTop: 5, height: 200, marginHorizontal: 0, borderRadius: 5 }}>
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}>
                {/*reference line*/}
                <CartesianChart data={referenceLineObject} xKey="index" yKeys={["normalizedValue"]} domain={{ y: [minY == 0 ? minY - 1 : minY < 0 ? 1.04 * minY : 0.96 * minY, maxY == 0 ? maxY + 1 : maxY < 0 ? 0.96 * maxY : 1.04 * maxY] }}>
                  {({ points }) => {

                    const repeatedPoints = points.normalizedValue.map(
                      point => ({
                        x: point.x, // Keep x as it is
                        y: point.y, // Set y to the first normalized point's y value
                        xValue: 0,
                        yValue: 0,
                      }),

                    );
                    return (
                      <>
                        <Group>
                          {repeatedPoints.map((point, index) => (
                            <Circle
                              key={index}
                              cx={point.x}
                              cy={point.y!}
                              r={1} // radius of the dot
                              color={theme.colors.secondaryText}
                            />
                          ))}
                        </Group>
                      </>
                    )

                  }}
                </CartesianChart>
              </View>
              {oppFormattedData &&
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,

                }}>
                  <CartesianChart data={oppFormattedData!} xKey="index" yKeys={["normalizedValue"]}
                    domain={{
                      y: [minY == 0 ? minY - 1 : minY < 0 ? 1.04 * minY : 0.96 * minY, maxY == 0 ? maxY + 1 : maxY < 0 ? 0.96 * maxY : 1.04 * maxY],
                      x: [0, oppFormattedData!.length == 1 ? 1 : (oppFormattedData!.length - 1) / (((match.timeframe * 1000) - ((new Date(match.endAt)).getTime() - Date.now())) / (match.timeframe * 1000))]
                    }}>
                    {({ points }) => (
                      // 👇 and we'll use the Line component to render a line path.
                      <>
                        <Line points={points.normalizedValue} color={hexToRGBA(oppColor, 0.5)}
                          strokeWidth={2} /*animate={{ type: "timing", duration: 50 }}*/ />
                        <LiveIndicator x={points.normalizedValue[points.normalizedValue.length - 1].x}
                          y={points.normalizedValue[points.normalizedValue.length - 1].y!}
                          color={hexToRGBA(oppColor, 0.5)}
                        />
                      </>
                    )}
                  </CartesianChart>
                </View>}
              {yourFormattedData &&
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,

                }}>
                  <CartesianChart data={yourFormattedData!} xKey="index" yKeys={["normalizedValue"]} chartPressState={state}
                    domain={{
                      y: [minY == 0 ? minY - 1 : minY < 0 ? 1.04 * minY : 0.96 * minY, maxY == 0 ? maxY + 1 : maxY < 0 ? 0.96 * maxY : 1.04 * maxY],
                      x: [0, yourFormattedData!.length == 1 ? 1 : (yourFormattedData!.length - 1) / (((match.timeframe * 1000) - ((new Date(match.endAt)).getTime() - Date.now())) / (match.timeframe * 1000))]
                    }}>
                    {({ points }) => {
                      //console.log(yourFormattedData)
                      // 👇 and we'll use the Line component to render a line path.
                      return (
                        <>
                          <Line points={points.normalizedValue} color={yourColor}
                            strokeWidth={2} /*animate={{ type: "timing", duration: 300 }}*/ />
                          <LiveIndicator x={points.normalizedValue[points.normalizedValue.length - 1].x}
                            y={points.normalizedValue[points.normalizedValue.length - 1].y!}
                            color={yourColor}
                          />
                          {isActive &&
                            <ToolTip x={state.x.position}
                              y={state.y.normalizedValue.position}
                              color={yourColor} />
                          }
                        </>)
                    }}
                  </CartesianChart>
                </View>}
            </View>
            <View>


              <View style={{ marginTop: 20 }}>
                <Text style={{ marginHorizontal: 20, color: theme.colors.text, fontFamily: 'InterTight-semibold', marginBottom: 10 }}>My Positions</Text>
                {yourAssets && yourAssets.length >= 1 &&
                  <>
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
                    ))}</>
                }
              </View>
            </View>
          </ScrollView>
          <View style={{ flexDirection: 'row', marginHorizontal: 20, gap: 5, paddingTop: 10 }}>
            <View style={{ flex: 1, backgroundColor: theme.colors.gameCardGrayAccent, borderColor: theme.colors.gameCardGrayBorder, borderWidth: 1, borderRadius: 8, padding: 10 }}>
              <Text style={{ fontFamily: 'InterTight-semibold', color: theme.colors.secondaryText, fontSize: 12 }}>Buying Power</Text>
              <Text style={{ color: theme.colors.text, fontFamily: 'InterTight-bold' }}>${(yourBuyingPower.toLocaleString())}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: theme.colors.gameCardGrayAccent, borderColor: theme.colors.gameCardGrayBorder, borderWidth: 1, borderRadius: 8, padding: 10 }}>
              <Text style={{ fontFamily: 'InterTight-semibold', color: theme.colors.secondaryText, fontSize: 12 }}>Time Remaining</Text>
              <Timer endDate={match.endAt} timeFrame={match.timeframe} yourColor={yourColor} />
            </View>
          </View>


          <View style={{ marginHorizontal: 20, marginBottom: 5, gap: 5, flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Chat", {
                  matchID: matchID,
                  userID: userID,
                  endAt: match.endAt,
                  yourColor: yourColor,
                  otherProfileUri: otherProfileUri,
                  otherHasDefaultProfileImage: otherHasDefaultProfileImage,
                  otherUsername: opponentUsername
                })
              }}
              style={{
                marginVertical: 10,
                height: 50,
                width: 50,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 500
              }}
            >
              <LinearGradient colors={[yourColor, yourColor == theme.colors.stockUpAccent ? theme.colors.darkAccent : theme.colors.darkStockDownAccent]} style={{ width: '100%', height: '100%', borderRadius: 500, justifyContent: 'center', alignItems: 'center' }}>
                <FeatherIcon name="message-circle" size={24} color={theme.colors.opposite} />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("InGameStockSearch", {
                  matchID: matchID,
                  userNumber: you,
                  buyingPower: yourBuyingPower,
                  assets: yourAssets,
                  endAt: match.endAt
                });
              }}
              style={{
                marginVertical: 10,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 500,
                flex: 1
              }}
            >
              <LinearGradient colors={[yourColor, yourColor == theme.colors.stockUpAccent ? theme.colors.darkAccent : theme.colors.darkStockDownAccent]} style={{ width: '100%', height: '100%', borderRadius: 500, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.opposite, fontFamily: 'InterTight-Bold', fontSize: 16 }}>Trade</Text>
              </LinearGradient>
            </TouchableOpacity>


          </View>
        </View >


        :
        <View style={{ width: width - 40, flex: 1, marginHorizontal: 20, marginTop: 10 }}>
          <Skeleton animation={"pulse"} style={{ flex: 1, borderRadius: 10, backgroundColor: theme.colors.tertiary, borderColor: theme.colors.tertiary, borderWidth: 1 }} skeletonStyle={{ backgroundColor: theme.colors.secondary }} />
        </View>}
    </View >
  );
};

export default GameCard;