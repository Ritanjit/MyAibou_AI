import { StrictMode } from "react";
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

import App from "@/App";
import Providers from "@/lib/providers/index.tsx";

import "@/globals.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Providers>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</Providers>
	</StrictMode>
);
