import { useState, useEffect } from 'react';
import useAuth from './useAuth';

const useAuthenticatedUser = () => {
  const { user } = useAuth();
  const [uid, setUid] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setUid((user as any).uid);
    }
  }, [user]);

  return { uid, user };
};

export default useAuthenticatedUser;
