import { useState, useEffect } from "react";
import React from "react";
import ReactApexChart from "react-apexcharts";
import { gql, request } from 'graphql-request';
import { useTheme } from "../contexts/ThemeContext";

const syncQuery = gql`
  query LatestCandleSync($pair: Bytes!) { 
    candles(first: 1000, orderBy: timestamp, orderDirection: asc, where: {
      pair: $pair,
      interval: "1h"
    }) {
      id
      timestamp
      open
      high
      low
      close
    }
  }
`;

const url = import.meta.env.VITE_GRAPH_URL;
const headers = { Authorization: `Bearer ${import.meta.env.VITE_GRAPH_KEY}` };

const TradeChart = ({ pairAddress, tokenA, tokenB }) => {
    const { isDarkMode } = useTheme()
    const [series, setSeries] = useState();

    function sortTokens(tokenA, tokenB) {
        const [addressA, addressB] = [tokenA.toLowerCase(), tokenB.toLowerCase()];
        return addressA < addressB ? [tokenA, tokenB] : [tokenB, tokenA];
    }

    useEffect(() => {
        async function fetchCandleData() {
            try {
                const [token0, token1] = sortTokens(tokenA, tokenB);
                const isInverted = tokenA.toLowerCase() !== token0.toLowerCase();
                const result = await request(url, syncQuery, { pair: pairAddress }, headers);
                if (isInverted) {
                    const seriesData = result.candles.map(candle => ({
                        x: new Date(Number(candle.timestamp) * 1000),
                        y: [
                            parseFloat(1 / candle.open),
                            parseFloat(1 / candle.high),
                            parseFloat(1 / candle.low),
                            parseFloat(1 / candle.close)
                        ]
                    }));
                    setSeries([{ data: seriesData }]);
                } else {
                    const seriesData = result.candles.map(candle => ({
                        x: new Date(Number(candle.timestamp) * 1000),
                        y: [
                            parseFloat(candle.open),
                            parseFloat(candle.high),
                            parseFloat(candle.low),
                            parseFloat(candle.close)
                        ]
                    }));
                    setSeries([{ data: seriesData }]);
                }

            } catch (error) {
                console.error(error);
            }
        }

        if (pairAddress) fetchCandleData();
    }, [pairAddress]);

    if (!series) return <div>Loading chart...</div>;

    return (
        <div>
            <div id="chart">
                <ReactApexChart
                    options={{
                        chart: { type: "candlestick", height: 350 },
                        xaxis: { type: "datetime" }, tooltip: {
                            theme: isDarkMode ? 'dark' : 'light',
                            style: {
                                color: isDarkMode ? '#000' : '#fff'
                            }
                        },
                        yaxis: { tooltip: { enabled: true } },
                        title: { text: "Price Candles", align: "left" },
                        plotOptions: {
                            candlestick: {
                                colors: {
                                    upward: '#00ff00',
                                    downward: '#ff0000'
                                }
                            }
                        }
                    }}
                    series={series}
                    type="candlestick"
                    height={350}
                />
            </div>
        </div>
    );
};

export default TradeChart;
