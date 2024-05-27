import {GraphPoint} from 'react-native-graph';
import axios from 'axios';
import { serverUrl } from '../constants/global';

const getPrices = async (tickers: string[]) => {
  try {
    // get yesterdays prices for an array of tickers
    const response = await axios.post(serverUrl + '/getYesterdayPrices', {
      tickers
    });



    // if (response) {
    //   const points: GraphPoint[] = response.data.prices.map((obj: any) => ({
    //     value: obj.price,
    //     date: new Date(obj.timeField),
    //   }));
    //   return points;
    // } else {
    //   console.error('Error null or undefined response, in getprices function');
    // }
  } catch {
    console.error('error getting prices');
  }
};
