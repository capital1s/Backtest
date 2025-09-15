import React, { useState } from "react";
import PropTypes from "prop-types";

function SharesHeld({ heldShares }) {
  const [sortBy, setSortBy] = useState("time");
  const [order, setOrder] = useState("asc");

  if (!heldShares || heldShares.length === 0) {
    return <div>No shares held.</div>;
  }

  const sorted = [...heldShares].sort((a, b) => {
    if (sortBy === "time") {
      return order === "asc" ? a.time - b.time : b.time - a.time;
    } else {
      return order === "asc" ? a.grid - b.grid : b.grid - a.grid;
    }
  });

  return (
    <div>
      <h3>Shares Held</h3>
      <div>
        <label htmlFor="sortBySelect">Sort by: </label>
        <select
          id="sortBySelect"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="time">Time</option>
          <option value="grid">Grid Level</option>
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
          </tr>
        </thead>
        <tbody>
          {sorted.map((share, idx) => (
            <tr key={idx}>
              <td>{share.ticker}</td>
              <td>{share.shares}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

SharesHeld.propTypes = {
  heldShares: PropTypes.arrayOf(
    PropTypes.shape({
      ticker: PropTypes.string.isRequired,
      shares: PropTypes.number.isRequired,
      time: PropTypes.number,
      grid: PropTypes.number,
    }),
  ),
};

export default React.memo(SharesHeld);
