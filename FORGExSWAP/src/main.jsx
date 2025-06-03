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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <App className="pb-20" />
        <Footer className="flex bg-red-500" />
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
