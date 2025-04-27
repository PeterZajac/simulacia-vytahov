import React from "react";

const SimulationControls = ({
  queueMode,
  toggleQueueMode,
  pendingRequests,
  startQueuedRequests,
  resetSimulation,
}) => {
  return (
    <div className="action-buttons">
      <div className="queue-controls">
        <label className="queue-mode-toggle">
          <input
            type="checkbox"
            checked={queueMode}
            onChange={toggleQueueMode}
          />
          Pridávať do fronty (bez spustenia)
        </label>
        <button
          onClick={startQueuedRequests}
          disabled={pendingRequests.length === 0}
          className={pendingRequests.length > 0 ? "start-queue-active" : ""}
        >
          Spustiť frontu ({pendingRequests.length})
        </button>
      </div>
      <button onClick={resetSimulation}>Resetovať simuláciu</button>
    </div>
  );
};

export default SimulationControls;
