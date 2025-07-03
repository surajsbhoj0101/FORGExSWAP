import { useState, useEffect } from "react";
import React from "react";
import ReactApexChart from "react-apexcharts";
import { gql, request } from 'graphql-request';

const syncQuery = gql`
  query LatestCandleSync($pair: Bytes!) { 
    candles(first: 1000, orderBy: timestamp, orderDirection: asc, where: {
      pair: $pair,
      interval: "1d"
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

const url = 'https://api.studio.thegraph.com/query/113184/sepolia-v-2-price-feed/version/latest';
const headers = { Authorization: `Bearer ff06a2cbebb8a0e457b1904571cb9b50` };

const TradeChart = ({ pairAddress }) => {
    const [series, setSeries] = useState();

    useEffect(() => {
        async function fetchCandleData() {
            try {
                const result = await request(url, syncQuery, { pair: pairAddress }, headers);
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
                        xaxis: { type: "datetime" },
                        yaxis: { tooltip: { enabled: true } },
                        title: { text: "Price Candles", align: "left" }
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
