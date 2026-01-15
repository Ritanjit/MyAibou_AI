import { FC } from "react";
import StoreProvider from "./StoreProvider";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
	children: React.ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
	return (
		<StoreProvider>
			{children}
			<Toaster position="bottom-center" />
		</StoreProvider>
	);
};

export default Providers;
