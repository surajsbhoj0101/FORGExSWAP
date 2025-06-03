import React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useTheme } from "../contexts/ThemeContext";
const config = getDefaultConfig({
  appName: "FORGExSWAP",
  projectId: "449de68e4da511968a82e62574362351",
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const AppProviders = ({ children }) => {
  const { isDarkMode } = useTheme();
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={config.chains}
          key={isDarkMode ? "dark" : "light"} // force re-render
          theme={
            isDarkMode
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
                })
          }
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default AppProviders;
