import React, { useState } from "react";
import "./ComparisonStats.css";

const ComparisonStats = ({ stats = {} }) => {
  // Zabezpečíme, že stats a jeho vlastnosti sú vždy definované
  const safeStats = {
    fuzzy: {
      totalWaitTime: 0,
      totalRequests: 0,
      avgWaitTime: 0,
      ...(stats?.fuzzy || {}),
    },
    fifo: {
      totalWaitTime: 0,
      totalRequests: 0,
      avgWaitTime: 0,
      ...(stats?.fifo || {}),
    },
    roundRobin: {
      totalWaitTime: 0,
      totalRequests: 0,
      avgWaitTime: 0,
      ...(stats?.roundRobin || {}),
    },
  };

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
              {formatTime(safeStats.fuzzy.avgWaitTime)} s
            </span>
            <span className="req-count">
              ({safeStats.fuzzy.totalRequests} požiadaviek)
            </span>
          </div>
        )}
        {visibleStats.fifo && (
          <div className="stat-item fifo">
            <span className="algo-name">FIFO:</span>
            <span className="value">
              {formatTime(safeStats.fifo.avgWaitTime)} s
            </span>
            <span className="req-count">
              ({safeStats.fifo.totalRequests} požiadaviek)
            </span>
          </div>
        )}
        {visibleStats.roundRobin && (
          <div className="stat-item roundRobin">
            <span className="algo-name">Round Robin:</span>
            <span className="value">
              {formatTime(safeStats.roundRobin.avgWaitTime)} s
            </span>
            <span className="req-count">
              ({safeStats.roundRobin.totalRequests} požiadaviek)
            </span>
          </div>
        )}
      </div>
      <p className="note">
        Pre porovnanie efektívnosti algoritmov:
        <strong>Fuzzy Logic</strong> optimalizuje čas čakania na základe
        viacerých parametrov, čím dosahuje <strong>nižšie časy čakania</strong>{" "}
        oproti konvenčným algoritmom.
        <strong>FIFO</strong> (First In First Out) obsluhuje požiadavky v
        poradí, v akom prišli, bez optimalizácie trasy, čo vedie k dlhším časom
        čakania.
        <strong>Round Robin</strong> priraďuje požiadavky výťahom postupne, čo
        je jednoduchšie, ale menej efektívne ako Fuzzy Logic. Hodnoty
        predstavujú priemerný čas v sekundách.
      </p>
    </div>
  );
};

export default ComparisonStats;
