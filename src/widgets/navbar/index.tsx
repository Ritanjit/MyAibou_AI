import { FC } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
	const location = useLocation();

	return (
		<nav className="bg-gray-800 p-4">
			<ul className="flex space-x-4 justify-center items-center">
				<li>
					<a
						href="/"
						className={cn("text-gray-400 hover:text-gray-100 transition-colors", {
							"text-white": location.pathname === "/",
						})}
					>
						Home
					</a>
				</li>
				<li>
					<a
						href="/about"
						className={cn("text-gray-400 hover:text-gray-100 transition-colors", {
							"text-white": location.pathname === "/about",
						})}
					>
						About
					</a>
				</li>
			</ul>
		</nav>
	);
};

export default Navbar;
