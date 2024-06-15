import useAuthenticatedUser from "./useAuthenticatedUser";
import useUserData from "./useUser";

const useUserDetails = () => {
  const { userID, user } = useAuthenticatedUser();
  const { userData, loading, error } = useUserData(userID);

  return { user, userData, loading, error };
};

export default useUserDetails;
