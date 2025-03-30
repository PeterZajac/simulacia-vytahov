import RequestList from "./components/RequestList"; // nový komponent na zobrazovanie požiadaviek

import React, { useState, useRef, useEffect } from "react";
import RequestForm from "./components/RequestForm";
import Building from "./components/Building";
import StatsChart from "./components/StatsChart";
import SimulationControls from "./components/SimulationControls";
import { assignElevatorFuzzy } from "./utils/fuzzyLogic";

const NUM_FLOORS = 10;
const NUM_ELEVATORS = 3;
export const MAX_CAPACITY = 8;
const ELEVATOR_SPEED = 2; // m/s
const FLOOR_HEIGHT = 3; // m

const App = () => {
  const [elevators, setElevators] = useState(() => {
    const arr = [];
    for (let i = 0; i < NUM_ELEVATORS; i++) {
      arr.push({
        id: i,
        currentFloor: 0,
        queue: [],
        busy: false,
        stats: 0,
        avgWaitTime: 0,
        totalWaitTime: 0,
        lastRequestTime: Date.now(),
      });
    }
    return arr;
  });

  const elevatorsRef = useRef(elevators);
  useEffect(() => {
    elevatorsRef.current = elevators;
  }, [elevators]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const calculateDistance = (from, to) => Math.abs(from - to) * FLOOR_HEIGHT;
  const calculateTime = (distance) => distance / ELEVATOR_SPEED;

  const animateElevatorMovement = async (elevatorIndex, targetFloor) => {
    const startTime = Date.now();
    const startFloor = elevatorsRef.current[elevatorIndex].currentFloor;
    const distance = calculateDistance(startFloor, targetFloor);

    while (true) {
      const currentFloor = elevatorsRef.current[elevatorIndex].currentFloor;
      if (currentFloor === targetFloor) break;
      const direction = targetFloor > currentFloor ? 1 : -1;
      setElevators((prev) => {
        const newElevators = [...prev];
        newElevators[elevatorIndex] = {
          ...newElevators[elevatorIndex],
          currentFloor: newElevators[elevatorIndex].currentFloor + direction,
        };
        return newElevators;
      });
      await sleep(500);
    }

    const endTime = Date.now();
    const actualTime = (endTime - startTime) / 1000;
    const speed = distance / actualTime;

    setElevators((prev) => {
      const newElevators = [...prev];
      newElevators[elevatorIndex] = {
        ...newElevators[elevatorIndex],
        avgSpeed: speed,
      };
      return newElevators;
    });
  };

  const processNextRequest = async (elevatorIndex) => {
    const elevator = elevatorsRef.current[elevatorIndex];
    if (!elevator || elevator.queue.length === 0) {
      return;
    }
    if (elevator.busy) {
      return;
    }

    elevator.busy = true;
    setElevators((prev) => {
      const newElevators = [...prev];
      newElevators[elevatorIndex] = {
        ...newElevators[elevatorIndex],
        busy: true,
      };
      return newElevators;
    });

    const currentRequest = elevator.queue[0];
    const distance = calculateDistance(
      elevator.currentFloor,
      currentRequest.from
    );
    const waitTime = calculateTime(distance);

    await animateElevatorMovement(elevatorIndex, currentRequest.from);
    await sleep(500);
    await animateElevatorMovement(elevatorIndex, currentRequest.to);
    await sleep(500);

    setElevators((prev) => {
      const newElevators = [...prev];
      const updatedQueue = newElevators[elevatorIndex].queue.slice(1);
      newElevators[elevatorIndex] = {
        ...newElevators[elevatorIndex],
        queue: updatedQueue,
        busy: false,
        stats: newElevators[elevatorIndex].stats + 1,
        totalWaitTime: newElevators[elevatorIndex].totalWaitTime + waitTime,
        avgWaitTime:
          (newElevators[elevatorIndex].totalWaitTime + waitTime) /
          (newElevators[elevatorIndex].stats + 1),
        lastRequestTime: Date.now(),
      };
      elevatorsRef.current[elevatorIndex] = newElevators[elevatorIndex];
      return newElevators;
    });

    if (elevatorsRef.current[elevatorIndex].queue.length > 0) {
      processNextRequest(elevatorIndex);
    }
  };

  const handleAddRequest = (request) => {
    if (request.people > MAX_CAPACITY) {
      alert(`Maximálny počet ľudí vo výťahu je ${MAX_CAPACITY}.`);
      return;
    }

    const index = assignElevatorFuzzy(elevatorsRef.current, request);

    setElevators((prev) => {
      const newElevators = [...prev];
      newElevators[index] = {
        ...newElevators[index],
        queue: [...newElevators[index].queue, request],
      };
      return newElevators;
    });

    if (!elevatorsRef.current[index].busy) {
      processNextRequest(index);
    }
  };

  const startSimulation = () => {
    elevatorsRef.current.forEach((elevator, index) => {
      if (!elevator.busy && elevator.queue.length > 0) {
        processNextRequest(index);
      }
    });
  };

  const resetSimulation = () => {
    const resetElevators = [];
    for (let i = 0; i < NUM_ELEVATORS; i++) {
      resetElevators.push({
        id: i,
        currentFloor: 0,
        queue: [],
        busy: false,
        stats: 0,
        avgWaitTime: 0,
        totalWaitTime: 0,
        lastRequestTime: Date.now(),
      });
    }
    setElevators(resetElevators);
  };

  return (
    <div className="App">
      <h1>Simulácia výťahového systému s fuzzy logikou</h1>
      <div className="container">
        <div className="left-panel">
          <RequestForm numFloors={NUM_FLOORS} onAddRequest={handleAddRequest} />
          <SimulationControls startSimulation={startSimulation} />
          <button onClick={resetSimulation}>Resetovať simuláciu</button>
          <RequestList elevators={elevators} />
          <StatsChart elevators={elevators} />
        </div>
        <div className="right-panel">
          <Building numFloors={NUM_FLOORS} elevators={elevators} />
        </div>
      </div>
    </div>
  );
};

export default App;
