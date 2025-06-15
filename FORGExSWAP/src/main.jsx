import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { useTheme } from "./contexts/ThemeContext";
import AppProviders from "./components/AppProviders.jsx";
import Trade from "./pages/Trade.jsx";
import Swap from "./pages/swap.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <App />
        <Footer />
      </>
    ),
  },
  {
    path: "/trade",
    element: (
      <>
        <Navbar />
        <Trade />
        <Footer />
      </>
    ),
  },{
    path:"/swap",
    element:(
      <>
        <Navbar/>
        <Swap/>
        <Footer/>
      </>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ThemeProvider>
  </StrictMode>
);
