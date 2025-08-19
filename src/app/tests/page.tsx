'use client';

import { useState } from "react";
import axios from "axios";

export default function Test() {
  const [ticker, setTicker] = useState("BTC");
  const [stable, setStable] = useState("USDT");
  const [data, setData] = useState(null);

  const fetchTicker = async () => {
    if (!ticker) return;
    try {
      setData(null);
      const response = await axios.get(`/api/bybit/ticker/${stable}/${ticker}`);
      setData(response.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching ticker data");
    }
  };

  return (
    <div className="p-8">
      {/* <h1 className="text-2xl font-bold mb-4">Bybit Ticker Fetcher</h1> */}
      <input
        className="border p-2 mr-2"
        type="text"
        placeholder="Enter ticker (e.g. BTC)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
      />      
      <input
        className="border p-2 mr-2"
        type="text"
        placeholder="Enter base (e.g. USDC)"
        value={stable}
        onChange={(e) => setStable(e.target.value)}
      />
      <br/>
      <br/>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={fetchTicker}
      >
        Fetch
      </button>

      {data && (
        <pre className="mt-6 bg-gray-100 dark:bg-gray-900 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
