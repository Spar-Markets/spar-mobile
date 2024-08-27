import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createStockSearchStyles from '../../styles/createStockStyles';
import { useNavigation } from '@react-navigation/native';
import { Area, CartesianChart, Line } from 'victory-native';
import getPrices from '../../utility/getPrices';
import axios from 'axios'
import { polygonKey, serverUrl } from '../../constants/global';
import { useSelector } from 'react-redux';
import { RootState } from '../../GlobalDataManagment/store';
import fuzzysort from 'fuzzysort';
import { Group, loadData, RoundedRect } from '@shopify/react-native-skia';
import { Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { Skeleton } from '@rneui/base';
import EntypoIcon from 'react-native-vector-icons/Entypo'


const PositionCard = (props: any) => {

  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createStockSearchStyles(theme, width);
  const navigation = useNavigation<any>();
  const [pointData, setPointData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true)

  const [name, setName] = useState("")

  const [yourLivePrice, setYourLivePrice] = useState()

  const [initialLoad, setInitialLoad] = useState(false)


  const matches = useSelector((state: RootState) => state.matches);
  const { yourTickerPrices } = matches[props.matchID]

  const [tickerData, setTickerData] = useState<any>(null)

  useEffect(() => {
    const getStockCardData = async () => {
      try {
        const response = await axios.post(serverUrl + "/getStockCardData", { ticker: props.ticker })
        if (response.status === 200) {
          console.log("branding", response.data.branding.icon_url + '?apikey=' + polygonKey)
          setTickerData(response.data)
        }
      } catch (error) {
        console.error("stock card", error)
      }

    }
    getStockCardData()
  }, [])





  useEffect(() => {
    const getPricesForSelectedTime = async () => {
      const allPoints = await getPrices(props.ticker, true);
      if (allPoints) {
        //console.log("ALL POINT DATA:", allPoints["3M"])
        setPointData(allPoints["1D"])
      }
      try {
        const tickerResponse = await axios.post(serverUrl + '/getTickerDetails', {
          ticker: props.ticker,
        });
        if (tickerResponse) {
          setName(tickerResponse.data.detailsResponse.results.name);
          console.log(tickerResponse.data.detailsResponse.results.name)
        }
      } catch {
        console.error('Error getting details in StockDetails.tsx');
      } finally {
        setIsLoading(false)
      }
    }
    if (!initialLoad) {
      console.log("getting initial prices")
      getPricesForSelectedTime()
    }
  }, [props.ticker]);


  useEffect(() => {
    if (pointData.length >= 0 && tickerData) {
      //console.log(yourTickerPrices)
      if (yourTickerPrices[props.ticker]) {
        setIsLoading(false)
        setInitialLoad(true)
      }
    } else {
      setIsLoading(true);
    }
  }, [pointData, tickerData, yourTickerPrices]);


  const [percentDiff, setPercentDiff] = useState("")
  const [valueDiff, setValueDiff] = useState("")
  const [currentAccentColor, setCurrentAccentColor] = useState(theme.colors.tertiary)


  //FIX CALCULATE PERCENT DIFFERENCE MAYBE MAKE PERCENRT DIFF A UTILITY SINCE ELSEWHERE
  const calculatePercentAndValueDiffAndColor = () => {
    if (pointData.length > 0) {
      const percentDiff =
        ((yourTickerPrices[props.ticker]) - pointData[0].value) /
        Math.abs(pointData[0].value);
      const percentDiffValue = (100 * percentDiff).toFixed(2);
      setPercentDiff(percentDiffValue);

      const valueDiff =
        (yourTickerPrices[props.ticker]) - pointData[0].value;

      if (valueDiff < 0) {
        setValueDiff("$" + Math.abs(valueDiff).toFixed(2));
        setCurrentAccentColor(theme.colors.stockDownAccent)
      } else {
        setValueDiff("$" + Math.abs(valueDiff).toFixed(2));
        setCurrentAccentColor(theme.colors.stockUpAccent)
      }
    } else {
      setPercentDiff("0.00");
      setValueDiff("0.00");
    }
  };

  useEffect(() => {
    calculatePercentAndValueDiffAndColor();
  }, [pointData, yourTickerPrices[props.ticker]]);


  if (isLoading) {
    return <View style={{ flex: 1, marginHorizontal: 10, width: width - 40, marginBottom: 10 }}><Skeleton animation={"pulse"} height={132} width={width - 60} style={{ backgroundColor: '#050505', borderRadius: 10 }} skeletonStyle={{ backgroundColor: theme.colors.primary }}></Skeleton></View>
  }

  return (
    <TouchableOpacity style={styles.positionCardContainer} onPress={() =>
      navigation.navigate('StockDetails', {

        ticker: props.ticker,
        name: name,
        matchID: props.matchID,
        buyingPower: props.buyingPower,
        inGame: true,
        owns: true,
        assets: props.assets,
        qty: props.qty,
        endAt: props.endAt

      })}>

      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <View>
            {tickerData != null && <Image source={{ uri: tickerData.branding.icon_url + '?apiKey=' + polygonKey }} height={40} width={40} style={{ borderRadius: 500 }} />}
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Text style={styles.stockCardTicker}>{props.ticker}</Text>
            <Text style={[styles.stockCardDiff, { color: theme.colors.secondaryText }]}>{props.qty} Shares</Text>
          </View>
        </View>
        {/*<View style={{ height: 40, flex: 1, marginHorizontal: 20 }}>
          {pointData &&
            <CartesianChart data={pointData} xKey="index" yKeys={["value"]}
            >
              {({ points, chartBounds }) => (
                <>
                  <Line points={points.value} color={currentAccentColor} strokeWidth={1.5} />
                </>
              )}
            </CartesianChart>}
        </View>*/}
        <View style={{ justifyContent: 'center', flex: 1 }}>
          {yourTickerPrices[props.ticker] && <Text style={styles.stockCardValue}>${(yourTickerPrices[props.ticker]).toFixed(2)}</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
            <EntypoIcon name="triangle-up" color={currentAccentColor} size={16} />
            <Text style={[styles.stockCardDiff, { color: currentAccentColor }]}>{isNaN(Number(valueDiff)) ? valueDiff : 0} ({isNaN(Number(percentDiff)) ? percentDiff : 0}%)</Text>
          </View>
        </View>
      </View>

      {/* <View style={{ height: 50 }}>
        {pointData &&
          <CartesianChart data={pointData} xKey="index" yKeys={["value"]}
          >
            {({ points, chartBounds }) => (
              <>
                <Line points={points.value} color={currentAccentColor} strokeWidth={1.5} />
              </>
            )}
          </CartesianChart>}
        <View style={{ height: 10, width: '100%' }}></View>
      </View>*/}

    </TouchableOpacity>
  )
}

export default PositionCard

