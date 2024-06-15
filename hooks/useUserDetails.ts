import useAuthenticatedUser from "./useAuthenticatedUser";
import useUserData from "./useUser";

const useUserDetails = () => {
  const { uid, user } = useAuthenticatedUser();
  const { userData, loading, error } = useUserData(uid);

  return { user, userData, loading, error };
};

export default useUserDetails;
