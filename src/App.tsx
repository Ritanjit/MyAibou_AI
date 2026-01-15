import { Routes, Route } from "react-router";

import HomePage from "@/pages/home";
import ChatPage from "@/pages/chat";

function App() {
	return (
		<Routes>
			<Route index element={<HomePage />} />
			<Route path="/:animeName/:characterName" element={<ChatPage />} />
		</Routes>
	);
}

export default App;

