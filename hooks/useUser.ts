import {useState, useEffect} from 'react';
import axios from 'axios';
import {serverUrl} from '../constants/global';

interface UserData {
  __v: number;
  _id: string;
  activematches: any[];
  balance: Number
  createdAt: string;
  email: string;
  pastmatches: any[];
  plaidPersonalAccess: string;
  skillRating: Number
  userID: string;
  username: string;
  watchedStocks: [string]
}

/**
 * grabs user data from mongo
 * @param userID 
 * @returns 
 */
const useUserData = (userID?: string) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userID) {
      const fetchUserData = async () => {
        try {
          const response = await axios.post(`${serverUrl}/getActiveUser`, { userID });
          //console.log('Fetched User Data:', response.data);
          setUserData(response.data);
        } catch (error) {
          setError('Error fetching user data');
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userID]);

  return { userData, loading, error };
};

export default useUserData;
