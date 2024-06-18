import { useState, useEffect } from 'react';
import useAuth from './useAuth';

/**
 * information from user for persistence
 * @returns 
 */
const useAuthenticatedUser = () => {
  const { user } = useAuth(); //persisted user
  const [userID, setuserID] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setuserID((user as any).uid); //called uid cause firebase object needs uid 
    }
  }, [user]);

  return { userID, user };
};

export default useAuthenticatedUser;
