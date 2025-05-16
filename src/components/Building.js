import React, { useState, useEffect, useRef } from "react";
import FloorPanel from "./FloorPanel";
import "./building.css";

const Building = ({ numFloors, elevators = [], onCallElevator }) => {
  const floorHeight = 50;
  const [movingElevators, setMovingElevators] = useState({});
  const movingElevatorsRef = useRef({});

  useEffect(() => {
    if (!Array.isArray(elevators)) return;

    let shouldUpdate = false;
    const newMovingElevators = {};

    elevators.forEach((elevator) => {
      if (elevator && elevator.busy) {
        newMovingElevators[elevator.id] = true;

        if (!movingElevatorsRef.current[elevator.id]) {
          shouldUpdate = true;
        }
      } else if (elevator && movingElevatorsRef.current[elevator.id]) {
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      setMovingElevators(newMovingElevators);

      movingElevatorsRef.current = newMovingElevators;
    }
  }, [elevators]);

  const getElevatorDirection = (elevator) => {
    if (
      !elevator ||
      !elevator.busy ||
      !Array.isArray(elevator.queue) ||
      elevator.queue.length === 0
    )
      return null;

    const currentRequest = elevator.queue[0];
    if (currentRequest.from !== elevator.currentFloor) {
      return currentRequest.from > elevator.currentFloor ? "up" : "down";
    } else {
      return currentRequest.to > elevator.currentFloor ? "up" : "down";
    }
  };

  const getElevatorDestinationInfo = (elevator) => {
    if (
      !elevator ||
      !elevator.busy ||
      !Array.isArray(elevator.queue) ||
      elevator.queue.length === 0
    )
      return null;

    const currentRequest = elevator.queue[0];
    if (currentRequest.from !== elevator.currentFloor) {
      return {
        floor: currentRequest.from,
        type: "pickup",
        text: `→ ${currentRequest.from} (${currentRequest.to})`,
      };
    } else {
      return {
        floor: currentRequest.to,
        type: "dropoff",
        text: `→ ${currentRequest.to}`,
      };
    }
  };

  const safeElevators = Array.isArray(elevators) ? elevators : [];

  return (
    <div className="building-container">
      <div className="building-legend">
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#3498db" }}
          ></div>
          <span>Výťah - voľný</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#e74c3c" }}
          ></div>
          <span>Výťah - zaneprázdnený</span>
        </div>
      </div>

      <div
        className="building"
        style={{ height: `${numFloors * floorHeight}px` }}
      >
        <div className="floors-container">
          {Array.from({ length: numFloors }, (_, i) => {
            const floorNumber = numFloors - i - 1;

            const hasElevator = safeElevators.some(
              (e) => e.currentFloor === floorNumber
            );

            return (
              <div
                key={i}
                className={`floor ${hasElevator ? "active-floor" : ""}`}
                style={{
                  top: `${i * floorHeight}px`,
                  height: `${floorHeight}px`,
                }}
              >
                <div className="floor-info">
                  <span className="floor-number">{floorNumber}</span>

                  {/* Indikátor aktivity na poschodí */}
                  {hasElevator && (
                    <div className="floor-activity-indicator">
                      <div className="activity-dot"></div>
                    </div>
                  )}
                </div>

                <div className="floor-controls">
                  <FloorPanel
                    floorNumber={floorNumber}
                    numFloors={numFloors}
                    onCallElevator={onCallElevator}
                  />
                </div>
              </div>
            );
          })}

          <div className="shafts">
            {safeElevators.map((elevator) => {
              const hasDestination =
                elevator.queue &&
                Array.isArray(elevator.queue) &&
                elevator.queue.length > 0;

              const elevatorDirection = getElevatorDirection(elevator);
              const isMoving = movingElevators[elevator.id];
              const destinationInfo = getElevatorDestinationInfo(elevator);

              return (
                <div key={elevator.id} className="elevator-shaft">
                  <div
                    className={`elevator ${elevator.busy ? "busy" : ""} ${
                      isMoving ? "moving" : ""
                    }`}
                    style={{
                      top: `${
                        (numFloors - elevator.currentFloor - 1) * floorHeight +
                        2
                      }px`,
                    }}
                  >
                    {elevatorDirection && (
                      <div
                        className={`elevator-direction-indicator direction-${elevatorDirection}`}
                      ></div>
                    )}

                    <span className="elevator-id">E{elevator.id}</span>

                    {elevator.busy && hasDestination && destinationInfo && (
                      <div
                        className={`elevator-destination ${destinationInfo.type}`}
                      >
                        {destinationInfo.text}
                      </div>
                    )}

                    {!elevator.busy && elevator.currentScore > 0 && (
                      <div className="elevator-score">
                        Skóre: {elevator.currentScore.toFixed(1)}
                      </div>
                    )}

                    {elevator.busy && (
                      <div className="elevator-movement-trail"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Building;
