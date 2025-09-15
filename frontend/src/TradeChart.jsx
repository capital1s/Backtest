import React from "react";

import PropTypes from "prop-types";

function TradeChart({ trades }) {
  if (!trades || trades.length === 0) {
    return <div>No trades to display.</div>;
  }
  // Replace with your chart library/component
  return (
    <div>
      <h2>Trade Chart</h2>
      <pre>{JSON.stringify(trades, null, 2)}</pre>
    </div>
  );
}

TradeChart.propTypes = {
  trades: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      symbol: PropTypes.string,
      price: PropTypes.number,
      quantity: PropTypes.number,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
};

export default React.memo(TradeChart);
