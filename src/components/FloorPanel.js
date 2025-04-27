import React, { useState } from "react";
import { MAX_CAPACITY } from "../constants";
import "./FloorPanel.css";

const FloorPanel = ({ floorNumber, numFloors, onCallElevator }) => {
  const [people, setPeople] = useState(1);

  const getDefaultDestination = () => {
    if (floorNumber === 0) return 1;
    return 0;
  };
  const [destination, setDestination] = useState(getDefaultDestination());

  const handleCallElevator = () => {
    if (destination === floorNumber) {
      alert("Cieľové poschodie nemôže byť rovnaké ako aktuálne!");
      return;
    }

    const peopleValue = parseInt(people, 10);
    if (isNaN(peopleValue) || peopleValue < 1 || peopleValue > MAX_CAPACITY) {
      alert(`Počet osôb musí byť medzi 1 a ${MAX_CAPACITY}.`);
      return;
    }

    const request = {
      from: floorNumber,
      to: parseInt(destination, 10),
      people: peopleValue,
      timestamp: Date.now(),
    };

    if (typeof onCallElevator === "function") {
      onCallElevator(request);
    }
  };

  return (
    <div className="floor-panel">
      <div className="floor-panel-controls">
        <div className="panel-row">
          <div className="people-control">
            <span>Počet:</span>
            <button
              onClick={() => setPeople((p) => Math.max(1, p - 1))}
              className="counter-button"
            >
              -
            </button>
            <span className="counter-value">{people}</span>
            <button
              onClick={() => setPeople((p) => Math.min(MAX_CAPACITY, p + 1))}
              className="counter-button"
            >
              +
            </button>
          </div>

          <select
            value={destination}
            onChange={(e) => setDestination(parseInt(e.target.value, 10))}
            className="destination-select"
            title="Cieľové poschodie"
          >
            {Array.from({ length: numFloors }, (_, i) => {
              if (i !== floorNumber) {
                return (
                  <option key={i} value={i}>
                    {i}
                  </option>
                );
              }
              return null;
            })}
          </select>

          <button
            onClick={handleCallElevator}
            className="call-button"
            title="Privolať výťah"
          >
            Privolať
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloorPanel;
