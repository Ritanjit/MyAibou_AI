import { Routes, Route } from "react-router";

import HomePage from "@/pages/home";
import ChatPage from "@/pages/chat";
import AnimeCollectionPage from "@/pages/collection";

function App() {
	return (
		<Routes>
			<Route index element={<HomePage />} />
			<Route path="/anime-collection" element={<AnimeCollectionPage />} />
			<Route path="/:animeName/:characterName" element={<ChatPage />} />
		</Routes>
	);
}

export default App;

