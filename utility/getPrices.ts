import {GraphPoint} from 'react-native-graph';
import axios from 'axios';
import { serverUrl } from '../constants/global';

const getPrices = async (ticker: string, timeframe: string) => {
    try {
      interface TickerPricestamp {
        price: number;
        timeField: number;
      }
      console.log("getprices", ticker, timeframe)
      const response = await axios.post(
        serverUrl + '/getMostRecentOneDayPrices',
        {ticker: String(ticker),
        timeframe: timeframe}
      )
      console.log("pass")
      for (let i = 0; i < ticker.length; i++) {
        // Check if response is successful and has data
        if (response && response.data && response.data[ticker]) {
          const tickerData: TickerPricestamp[] = response.data[ticker];

          // Map the data to the format expected by the graphing library
          const points = tickerData.map(tickerData => ({
            value: tickerData.price,
            date: new Date(tickerData.timeField),
          }));

          return points 

        }
      }
    } catch (error) {
      console.error('getPrices error getting prices', error);
    }
  };

  export default getPrices