import React, { useState } from "react";
import PropTypes from "prop-types";

function TradeTable({ trades, type }) {
  const [sortBy, setSortBy] = useState("time");
  const [order, setOrder] = useState("asc");

  // Ensure trades is an array and safely filter
  const safeTrades = Array.isArray(trades) ? trades : [];
  const filtered = safeTrades.filter((t) => t.side === type);

  if (filtered.length === 0) {
    return <div>No {type} trades.</div>;
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "time") {
      // Handle null timestamps by treating them as 0 or using id for ordering
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : a.id || 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : b.id || 0;
      return order === "asc" ? aTime - bTime : bTime - aTime;
    } else {
      return order === "asc" ? a.price - b.price : b.price - a.price;
    }
  });

  return (
    <div>
      <h3>{type === "buy" ? "Shares Bought" : "Shares Sold"}</h3>
      <div>
        <label htmlFor="sortBySelect">Sort by: </label>
        <select
          id="sortBySelect"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="time">Time</option>
          <option value="price">Price</option>
        </select>
        <button onClick={() => setOrder(order === "asc" ? "desc" : "asc")}>
          {order === "asc" ? "Asc" : "Desc"}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Shares</th>
            <th>Price</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={t.id || i}>
              <td>{t.ticker}</td>
              <td>{t.shares}</td>
              <td>${t.price.toFixed(2)}</td>
              <td>{t.timestamp || `Trade #${t.id}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

TradeTable.propTypes = {
  trades: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      ticker: PropTypes.string.isRequired,
      shares: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
      side: PropTypes.string.isRequired,
      timestamp: PropTypes.string,
    }),
  ),
  type: PropTypes.string.isRequired,
};

export default React.memo(TradeTable);
