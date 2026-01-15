import useStore from "./useStore";

const useAppStore = () => {
	const [user, setUser, isUserLoading] = useStore<User>("user", {} as User);
	const [session, setSession, isSessionLoading] = useStore<string>("session", "");
	const [isLoggedIn, setIsLoggedIn, isLoggedInLoading] = useStore<boolean>("isLoggedIn", user !== null && session !== "");

	return { user, setUser, isUserLoading, session, setSession, isSessionLoading, isLoggedIn, setIsLoggedIn, isLoggedInLoading };
};

export default useAppStore;
