import {GraphPoint} from 'react-native-graph';
import axios from 'axios';
import { serverUrl } from '../constants/global';

const getPrices = async (ticker: string) => {
    try {
      interface TickerPricestamp {
        price: number;
        timeField: number;
      }

      const response = await axios.post(
        serverUrl + '/getMostRecentOneDayPrices',
        [ticker],
      );

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
    } catch (error) {
      console.error('getPrices error getting prices');
    }
  };

  export default getPrices