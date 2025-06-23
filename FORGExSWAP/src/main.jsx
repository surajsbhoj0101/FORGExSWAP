import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import AppProviders from "./components/AppProviders.jsx";
import TradePriceShow from "./pages/trade/tradePriceShow.jsx";
import Swap from "./pages/swap.jsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CreateToken from "./pages/createToken.jsx";

// Create the client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});


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
        <TradePriceShow />
        <Footer />
      </>
    ),
  },
  {
    path: "/swap",
    element: (
      <>
        <Navbar />
        <Swap />
        <Footer />
      </>
    ),
  },
  {
    path:"/createToken",
    element:(
      <>
      <Navbar />
      <CreateToken />
      <Footer />  
      </>
    )
  }
]);

// ✅ Proper root render: wrap with QueryClientProvider
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
