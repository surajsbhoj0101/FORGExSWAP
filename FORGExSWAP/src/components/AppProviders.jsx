import React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig, //configure blockchain networks, wallet connectors, and other settings for RainbowKit + wagmi.
  RainbowKitProvider, //React context provider that wraps your app to supply RainbowKit’s wallet connection functionality
  darkTheme,//darkTheme and lightTheme — built-in themes to style the RainbowKit wallet UI (dark mode & light mode).
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";//Components and hooks like useAccount, useConnect, useBalance, etc. all rely on it to know which blockchain network and wallets to use
import { mainnet, sepolia,monadTestnet } from "wagmi/chains";
import { useMemo } from "react";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
//QueryClient — creates an instance of React Query’s core client, which manages all your queries, caching, and data syncing.
//QueryClientProvider — a React context provider that wraps your app and makes the QueryClient available to all components for using React Query features.
import { useTheme } from "../contexts/ThemeContext";

const queryClient = new QueryClient();
const projectId = import.meta.env.PROJECT_ID;
const config = getDefaultConfig({
  appName: "FORGExSWAP",
  projectId: "449de68e4da511968a82e62574362351",//WalletConnect Cloud project ID
  chains: [ sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const AppProviders = ({ children }) => {
  const { isDarkMode } = useTheme();
  const theme = useMemo(() => {
    return isDarkMode
      ? darkTheme({
          accentColor: "#7b3fe4",
          accentColorForeground: "white",
          borderRadius: "small",
          fontStack: "system",
          overlayBlur: "small",
        })
      : lightTheme({
          accentColor: "cyan",
          accentColorForeground: "white",
          borderRadius: "small",
          fontStack: "system",
          overlayBlur: "small",
        });
  }, [isDarkMode]);
  // It creates a new instance of React Query’s core manager called QueryClient and this query client keeps track of all your qurey, caching and automatic refetching.

  return (
    <WagmiProvider config={config}>
        <RainbowKitProvider
          chains={config.chains}
           
          theme={
            theme
          }
        >
          {children}
        </RainbowKitProvider>
    </WagmiProvider>
  );
};

export default AppProviders;
