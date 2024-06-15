import { useState, useEffect } from 'react';
import useAuth from './useAuth';

const useAuthenticatedUser = () => {
  const { user } = useAuth();
  const [userID, setuserID] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setuserID((user as any).uid); //called uid cause firebase object needs uid 
    }
  }, [user]);

  return { userID, user };
};

export default useAuthenticatedUser;
