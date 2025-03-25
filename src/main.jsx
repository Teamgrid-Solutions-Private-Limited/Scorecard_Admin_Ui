import * as React from "react";
import { createRoot } from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import store from "../redux/store/store.js";


import App from "./App.jsx";
import "./App.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
	<React.StrictMode>
		  <Provider store={store}>
		  <App />
		  </Provider>
			
		 
	</React.StrictMode>
);
