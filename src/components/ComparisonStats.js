import React, { useState } from "react";
import "./ComparisonStats.css";

const ComparisonStats = ({ stats }) => {
  const [visibleStats, setVisibleStats] = useState({
    fuzzy: true,
    fifo: true,
    roundRobin: true,
  });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setVisibleStats((prev) => ({ ...prev, [name]: checked }));
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) {
      return "0.00";
    }
    // Už neaplikujeme REAL_TIME_FACTOR, pretože je aplikovaný v App.js
    return time.toFixed(2);
  };

  return (
    <div className="comparison-stats">
      <h3>Porovnanie algoritmov (priemerný čas čakania)</h3>

      <div className="stat-checkboxes">
        <label>
          <input
            type="checkbox"
            name="fuzzy"
            checked={visibleStats.fuzzy}
            onChange={handleCheckboxChange}
          />{" "}
          Fuzzy Logic
        </label>
        <label>
          <input
            type="checkbox"
            name="fifo"
            checked={visibleStats.fifo}
            onChange={handleCheckboxChange}
          />{" "}
          FIFO
        </label>
        <label>
          <input
            type="checkbox"
            name="roundRobin"
            checked={visibleStats.roundRobin}
            onChange={handleCheckboxChange}
          />{" "}
          Round Robin
        </label>
      </div>

      <div className="stats-display">
        {visibleStats.fuzzy && (
          <div className="stat-item fuzzy">
            <span className="algo-name">Fuzzy Logic:</span>
            <span className="value">
              {formatTime(stats.fuzzy.avgWaitTime)} s
            </span>
            <span className="req-count">
              ({stats.fuzzy.totalRequests} požiadaviek)
            </span>
          </div>
        )}
        {visibleStats.fifo && (
          <div className="stat-item fifo">
            <span className="algo-name">FIFO:</span>
            <span className="value">
              {formatTime(stats.fifo.avgWaitTime)} s
            </span>
            <span className="req-count">
              ({stats.fifo.totalRequests} požiadaviek)
            </span>
          </div>
        )}
        {visibleStats.roundRobin && (
          <div className="stat-item roundRobin">
            <span className="algo-name">Round Robin:</span>
            <span className="value">
              {formatTime(stats.roundRobin.avgWaitTime)} s
            </span>
            <span className="req-count">
              ({stats.roundRobin.totalRequests} požiadaviek)
            </span>
          </div>
        )}
      </div>
      <p className="note">
        Štatistiky pre FIFO a Round Robin sú *odhadované* na základe aktuálneho
        stavu výťahov pri pridaní požiadavky. Fuzzy štatistika používa reálny
        čas čakania. Hodnoty predstavujú reálne sekundy.
      </p>
    </div>
  );
};

export default ComparisonStats;
