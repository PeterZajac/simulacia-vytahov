import React from "react";

const SimulationControls = ({ startSimulation }) => {
  return (
    <div className="simulation-controls">
      <button onClick={startSimulation}>Spustiť simuláciu</button>
    </div>
  );
};

export default SimulationControls;
