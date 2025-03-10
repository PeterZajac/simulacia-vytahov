import RequestList from "./components/RequestList"; // nový komponent na zobrazovanie požiadaviek

import React, { useState, useRef, useEffect } from "react";
import RequestForm from "./components/RequestForm";
import Building from "./components/Building";
import StatsChart from "./components/StatsChart";
import SimulationControls from "./components/SimulationControls";
import { assignElevator } from "./utils/fuzzyLogic";

const NUM_FLOORS = 10;
const NUM_ELEVATORS = 3;
export const MAX_CAPACITY = 8;

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
      });
    }
    return arr;
  });

  const elevatorsRef = useRef(elevators);
  useEffect(() => {
    elevatorsRef.current = elevators;
  }, [elevators]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const animateElevatorMovement = async (elevatorIndex, targetFloor) => {
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
      console.log(
        `Výťah ${elevatorIndex} sa posúva z ${currentFloor} na ${
          currentFloor + direction
        }`
      );
      await sleep(500);
    }
  };

  const processNextRequest = async (elevatorIndex) => {
    const elevator = elevatorsRef.current[elevatorIndex];
    if (!elevator || elevator.queue.length === 0) {
      console.log(`Výťah ${elevatorIndex} nemá žiadnu požiadavku`);
      return;
    }
    // Ak je už výťah označený ako busy, nebudeme ho spúšťať znovu.
    if (elevator.busy) {
      console.log(`Výťah ${elevatorIndex} je už spracovávaný.`);
      return;
    }
    // Nastav busy na true okamžite v referencii aj vo vnútri stavu
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
    console.log(
      `Výťah ${elevatorIndex} spracováva požiadavku:`,
      currentRequest
    );

    await animateElevatorMovement(elevatorIndex, currentRequest.from);
    await sleep(500);
    await animateElevatorMovement(elevatorIndex, currentRequest.to);
    await sleep(500);

    setElevators((prev) => {
      const newElevators = [...prev];
      const updatedQueue = newElevators[elevatorIndex].queue.slice(1);
      // Po spracovaní požiadavky nastavíme busy na false a aktualizujeme štatistiky
      newElevators[elevatorIndex] = {
        ...newElevators[elevatorIndex],
        queue: updatedQueue,
        busy: false,
        stats: newElevators[elevatorIndex].stats + 1,
      };
      // Aktualizujeme aj referenciu
      elevatorsRef.current[elevatorIndex] = newElevators[elevatorIndex];
      return newElevators;
    });
    console.log(
      `Výťah ${elevatorIndex} dokončil požiadavku. Zostávajúca fronta:`,
      elevatorsRef.current[elevatorIndex].queue
    );

    if (elevatorsRef.current[elevatorIndex].queue.length > 0) {
      processNextRequest(elevatorIndex);
    }
  };

  const handleAddRequest = (request) => {
    if (request.people > MAX_CAPACITY) {
      alert(`Maximálny počet ľudí vo výťahu je ${MAX_CAPACITY}.`);
      return;
    }
    console.log("Pridávame požiadavku:", request);
    const index = assignElevator(elevatorsRef.current, request);
    setElevators((prev) => {
      const newElevators = [...prev];
      newElevators[index] = {
        ...newElevators[index],
        queue: [...newElevators[index].queue, request],
      };
      return newElevators;
    });
    console.log(`Priradená požiadavka výťahu ${index}`);
    if (!elevatorsRef.current[index].busy) {
      processNextRequest(index);
    }
  };

  const startSimulation = () => {
    console.log("Simulácia sa spúšťa manuálne");
    elevatorsRef.current.forEach((elevator, index) => {
      if (!elevator.busy && elevator.queue.length > 0) {
        processNextRequest(index);
      }
    });
  };

  const resetSimulation = () => {
    console.log("Resetovanie simulácie");
    const resetElevators = [];
    for (let i = 0; i < NUM_ELEVATORS; i++) {
      resetElevators.push({
        id: i,
        currentFloor: 0,
        queue: [],
        busy: false,
        stats: 0,
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
