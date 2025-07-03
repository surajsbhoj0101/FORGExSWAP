import React from 'react'

const syncQuery = gql`
  query LatestSync($pair: Bytes!) { 
  candles(first: 1, orderBy: timestamp, orderDirection: desc,
   where: {
    pair: $pair,
    interval: "1d"
  }) {
    id
    timestamp
    close
  }
  }
`;

const url = 'https://api.studio.thegraph.com/query/113184/sepolia-v-2-price-feed/version/latest';
const headers = { Authorization: `Bearer ff06a2cbebb8a0e457b1904571cb9b50` };

function tradePriceShow() {
    
  return (
    <div>tradePriceShow</div>
  )
}

export default tradePriceShow