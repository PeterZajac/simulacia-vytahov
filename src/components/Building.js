import React from "react";
import "./building.css";

const Building = ({ numFloors, elevators }) => {
  const floorHeight = 40;

  return (
    <div
      className="building"
      style={{ height: `${numFloors * floorHeight}px` }}
    >
      {Array.from({ length: numFloors }, (_, i) => {
        return (
          <div
            key={i}
            className="floor"
            style={{ top: `${i * floorHeight}px`, height: `${floorHeight}px` }}
          >
            <span className="floor-number">Poschodie {numFloors - i - 1}</span>
          </div>
        );
      })}

      <div className="shafts">
        {elevators.map((elevator) => (
          <div key={elevator.id} className="elevator-shaft">
            <div
              className="elevator"
              style={{
                top: `${
                  (numFloors - elevator.currentFloor - 1) * floorHeight
                }px`,
              }}
            >
              <span>E{elevator.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Building;
