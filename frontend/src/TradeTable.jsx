import React, { useState } from "react";
import PropTypes from "prop-types";

function TradeTable({ trades, type }) {
  const [sortBy, setSortBy] = useState("time");
  const [order, setOrder] = useState("asc");

  const filtered = trades ? trades.filter((t) => t.type === type) : [];

  if (filtered.length === 0) {
    return <div>No {type} trades.</div>;
  }

  TradeTable.propTypes = {
    trades: PropTypes.arrayOf(
      PropTypes.shape({
        ticker: PropTypes.string.isRequired,
        shares: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired,
        time: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
      }),
    ),
    type: PropTypes.string.isRequired,
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "time") {
      return order === "asc" ? a.time - b.time : b.time - a.time;
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
            <tr key={i}>
              <td>{t.ticker}</td>
              <td>{t.shares}</td>
              <td>{t.price.toFixed(2)}</td>
              <td>{t.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(TradeTable);
