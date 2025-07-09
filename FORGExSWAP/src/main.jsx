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
import SwapPage from "./pages/SwapPage.jsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CreateToken from "./pages/createToken.jsx";
import TradePage from "./pages/trade/tradePair/tradePage.jsx";
import LiquidityPage from "./pages/liquidityPage.jsx";
import { useMemo } from "react";

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
        <SwapPage/>
        <Footer />
      </>
    ),
  },
  {
    path: "/createToken",
    element: (
      <>
        <Navbar />
        <CreateToken />
        <Footer />
      </>
    )
  },
  {
    path: "/trade/:pairAddress",
    element: (
      <>
        <Navbar />
        <TradePage />
        <Footer />
      </>
    )
  },
  {
    path: "/liquidity",
    element: (
      <>
        <Navbar />
        <LiquidityPage />
        <Footer />
      </>
    )
  }
]);


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
