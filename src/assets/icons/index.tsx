// import { FaPlus } from "react-icons/fa6";

import { LoaderSVGIcon } from "./svg";
import { FaPlus } from "react-icons/fa6";
import { IoLogInOutline, IoLogOutOutline } from "react-icons/io5";

const Icons = {
	// SVGICONs
	LoaderSVGIcon,

	// REACT ICONS
	PlusIcon: FaPlus,
	LoginIcon: IoLogInOutline,
	LogoutIcon: IoLogOutOutline,
};
export type IconType = keyof typeof Icons;
export default Icons;
