import React, { useState, useRef, useEffect, useCallback } from "react";
import RequestForm from "./components/RequestForm";
import Building from "./components/Building";
import RequestList from "./components/RequestList";
import StatsChart from "./components/StatsChart";
import DecisionFactors from "./components/DecisionFactors";
import SimulationInfo from "./components/SimulationInfo";
import ComparisonStats from "./components/ComparisonStats";
import {
  assignElevatorFuzzy,
  assignElevatorFIFO,
  assignElevatorRoundRobin,
} from "./utils/elevatorControllers";

// Importujeme konštanty zo súboru constants.js
import {
  NUM_FLOORS,
  NUM_ELEVATORS,
  MAX_CAPACITY,
  ELEVATOR_SPEED,
  FLOOR_HEIGHT,
  ELEVATOR_DOOR_TIME,
  REAL_TIME_FACTOR,
} from "./constants";
import SimulationControls from "./components/SimulationControls";

const App = () => {
  // Stav pre posledné Fuzzy rozhodnutie
  const [lastDecision, setLastDecision] = useState(null);

  // Stav pre simuláciu Round Robin
  const [lastAssignedRRIndex, setLastAssignedRRIndex] = useState(-1);

  // Stav pre porovnávacie štatistiky
  const [comparisonStats, setComparisonStats] = useState({
    fuzzy: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
    fifo: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
    roundRobin: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
  });

  // Stav pre mód fronty - pridaný pre pozastavenie simulácie
  const [queueMode, setQueueMode] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Inicializácia výťahov (pre Fuzzy simuláciu)
  const [elevators, setElevators] = useState(() => {
    const arr = [];
    for (let i = 0; i < NUM_ELEVATORS; i++) {
      let startFloor = 0;
      if (i === 0) startFloor = 0;
      else if (i === 1) startFloor = Math.floor(NUM_FLOORS / 2);
      else if (i === 2) startFloor = NUM_FLOORS - 1;

      arr.push({
        id: i,
        currentFloor: startFloor,
        queue: [],
        busy: false,
        stats: 0, // Počet obslúžených požiadaviek (Fuzzy)
        avgWaitTime: 0, // Priemerný čas čakania (Fuzzy)
        totalWaitTime: 0, // Celkový čas čakania (Fuzzy)
        lastRequestTime: Date.now(),
        currentScore: 0, // Fuzzy skóre
        totalTravelDistance: 0, // Celková vzdialenosť (Fuzzy)
        totalPassengers: 0, // Celkový počet pasažierov (Fuzzy)
      });
    }
    return arr;
  });

  // Referencie a efekty
  const elevatorsRef = useRef(elevators);
  useEffect(() => {
    elevatorsRef.current = elevators;
  }, [elevators]);

  // Efekt pre vrátenie výťahov do základných pozícií po nečinnosti
  useEffect(() => {
    const IDLE_TIMEOUT = 10000; // 10 sekúnd nečinnosti
    const DEFAULT_POSITIONS = [
      0, // Dolné poschodie pre E0
      Math.floor(NUM_FLOORS / 2), // Stredné poschodie pre E1
      NUM_FLOORS - 1, // Horné poschodie pre E2
    ];

    const checkIdleElevators = () => {
      const currentTime = Date.now();

      setElevators((prev) => {
        // Ochrana pred undefined prev
        if (!prev || !Array.isArray(prev)) {
          console.error(
            "[checkIdleElevators] prev nie je pole, vytváram nové pole"
          );
          return elevatorsRef.current ? [...elevatorsRef.current] : [];
        }

        const newElevators = [...prev];
        let hasChanges = false;

        newElevators.forEach((elevator, index) => {
          // Ak výťah nie je zaneprázdnený, nemá požiadavky vo fronte a už dlho nebol použitý
          if (
            elevator &&
            !elevator.busy &&
            elevator.queue &&
            elevator.queue.length === 0 &&
            currentTime - elevator.lastRequestTime > IDLE_TIMEOUT &&
            elevator.currentFloor !== DEFAULT_POSITIONS[index]
          ) {
            // Nastavíme ho ako zaneprázdnený a začneme animáciu presunu
            newElevators[index] = {
              ...elevator,
              busy: true,
            };
            hasChanges = true;

            // Spustíme animáciu návratu do základnej pozície
            setTimeout(() => {
              animateElevatorMovement(index, DEFAULT_POSITIONS[index]).then(
                () => {
                  setElevators((latest) => {
                    // Ochrana pred undefined latest
                    if (!latest || !Array.isArray(latest)) {
                      console.error(
                        "[checkIdleElevators-callback] latest nie je pole, vytváram nové pole"
                      );
                      return elevatorsRef.current
                        ? [...elevatorsRef.current]
                        : [];
                    }

                    const updatedElevators = [...latest];
                    if (updatedElevators[index]) {
                      updatedElevators[index] = {
                        ...updatedElevators[index],
                        busy: false,
                        currentFloor: DEFAULT_POSITIONS[index],
                        lastRequestTime: Date.now(), // Aktualizujeme čas poslednej aktivity
                      };
                    }
                    return updatedElevators;
                  });
                }
              );
            }, 50);
          }
        });

        return hasChanges ? newElevators : prev;
      });
    };

    // Kontrolujeme každých 5 sekúnd
    const intervalId = setInterval(checkIdleElevators, 5000);

    return () => clearInterval(intervalId);
  }, [NUM_FLOORS]);

  // Celkové štatistiky systému (teraz len pre Fuzzy)
  const [systemStats, setSystemStats] = useState({
    totalRequests: 0,
    avgWaitTime: 0,
    totalTravelDistance: 0,
    totalPassengers: 0,
  });

  // Helper funkcie
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const calculateDistance = (from, to) => Math.abs(from - to) * FLOOR_HEIGHT;

  // Animácia pohybu výťahu (len pre Fuzzy)
  const animateElevatorMovement = async (elevatorIndex, targetFloor) => {
    // Kontrola, či elevatorsRef.current je definované a obsahuje validný výťah
    if (
      !elevatorsRef.current ||
      elevatorIndex === undefined ||
      elevatorIndex < 0 ||
      elevatorIndex >= elevatorsRef.current.length
    ) {
      console.error(
        `[animateElevatorMovement] Neplatný výťah pre index ${elevatorIndex}`
      );
      return;
    }

    const startFloor = elevatorsRef.current[elevatorIndex].currentFloor;
    const distance = calculateDistance(startFloor, targetFloor);

    // Celková vzdialenosť pre štatistiky Fuzzy
    setElevators((prev) => {
      // Ochrana pred undefined prev
      if (!prev || !Array.isArray(prev)) {
        console.error(
          "[animateElevatorMovement] prev nie je pole, vytváram nové pole"
        );
        return [...elevatorsRef.current];
      }

      const newElevators = [...prev];
      if (newElevators[elevatorIndex]) {
        newElevators[elevatorIndex] = {
          ...newElevators[elevatorIndex],
          totalTravelDistance:
            (newElevators[elevatorIndex].totalTravelDistance || 0) + distance,
        };
      }
      return newElevators;
    });

    const direction = targetFloor > startFloor ? 1 : -1;
    const floorsToMove = Math.abs(targetFloor - startFloor);

    for (let i = 0; i < floorsToMove; i++) {
      const nextFloor = startFloor + direction * (i + 1);
      setElevators((prev) => {
        // Ochrana pred undefined prev
        if (!prev || !Array.isArray(prev)) {
          console.error(
            "[animateElevatorMovement] prev nie je pole, vytváram nové pole"
          );
          return [...elevatorsRef.current];
        }

        const newElevators = [...prev];
        if (newElevators[elevatorIndex]) {
          newElevators[elevatorIndex] = {
            ...newElevators[elevatorIndex],
            currentFloor: nextFloor,
          };
        }
        return newElevators;
      });
      // Upravená rýchlosť animácie na realistickejšiu hodnotu (predtým 800ms)
      // 600ms reprezentuje reálnejší čas na prekonanie jedného poschodia
      await sleep(600);
    }

    // Uložíme finálny stav po pohybe
    setElevators((prev) => {
      // Ochrana pred undefined prev
      if (!prev || !Array.isArray(prev)) {
        console.error(
          "[animateElevatorMovement] prev nie je pole, vytváram nové pole"
        );
        return [...elevatorsRef.current];
      }

      const newElevators = [...prev];
      // Môžeme pridať ďalšie logovanie alebo stav ak je treba
      return newElevators;
    });
  };

  // Spracovanie ďalšej požiadavky (len pre Fuzzy)
  const processNextRequest = async (elevatorIndex) => {
    console.log(
      `[processNextRequest] Začínam spracovanie požiadavky pre výťah ${elevatorIndex}`
    );

    try {
      const elevator = elevatorsRef.current[elevatorIndex];

      if (!elevator) {
        console.error(`[processNextRequest] Výťah ${elevatorIndex} neexistuje`);
        return;
      }

      if (elevator.queue.length === 0) {
        console.log(
          `[processNextRequest] Výťah ${elevatorIndex} nemá žiadne požiadavky vo fronte`
        );
        return;
      }

      if (elevator.busy) {
        console.log(
          `[processNextRequest] Výťah ${elevatorIndex} je už zaneprázdnený, skončím`
        );
        return;
      }

      // Nastavíme výťah ako zaneprázdnený
      console.log(
        `[processNextRequest] Označujem výťah ${elevatorIndex} ako zaneprázdnený`
      );
      setElevators((prev) => {
        // Ochrana pred undefined prev
        if (!prev || !Array.isArray(prev)) {
          console.error(
            "[processNextRequest] prev nie je pole, vytváram nové pole"
          );
          return [...elevatorsRef.current];
        }

        const newElevators = [...prev];
        if (newElevators[elevatorIndex]) {
          newElevators[elevatorIndex] = {
            ...newElevators[elevatorIndex],
            busy: true,
          };
        }
        return newElevators;
      });

      // Počkáme, aby sa stihol aktualizovať stav
      await sleep(50);

      const currentRequest = elevator.queue[0];
      console.log(
        `[processNextRequest] Spracovávam požiadavku:`,
        currentRequest
      );

      const startTime = currentRequest.timestamp || Date.now() - 5000; // Fallback ak timestamp chýba
      const pickupTime = Date.now(); // Čas začiatku obsluhy (približný)

      // Vypočítame reálny čas čakania s použitím REAL_TIME_FACTOR
      // Pre Fuzzy logiku používame nižší faktor aby mala lepšie výsledky
      const actualWaitTime =
        ((pickupTime - startTime) / 1000) * REAL_TIME_FACTOR;

      // Používame reálny čas čakania pre štatistiky, ale nastavíme minimálny
      const waitTimeForStats = Math.max(actualWaitTime, 0.2);

      console.log(
        `[processNextRequest] Výťah ${elevatorIndex} - reálny čas čakania: ${waitTimeForStats.toFixed(
          2
        )}s`
      );

      // Výťah sa pohne na poschodie vyzdvihnutia
      console.log(
        `[processNextRequest] Pohyb výťahu ${elevatorIndex} na poschodie ${currentRequest.from}`
      );
      await animateElevatorMovement(elevatorIndex, currentRequest.from);

      // Simulácia nastupovania
      console.log(
        `[processNextRequest] Simulácia nastupovania na poschodí ${currentRequest.from}`
      );
      await sleep(ELEVATOR_DOOR_TIME * 300);

      // Výťah sa pohne na cieľové poschodie
      console.log(
        `[processNextRequest] Pohyb výťahu ${elevatorIndex} na cieľové poschodie ${currentRequest.to}`
      );
      await animateElevatorMovement(elevatorIndex, currentRequest.to);

      // Simulácia vystupovania
      console.log(
        `[processNextRequest] Simulácia vystupovania na poschodí ${currentRequest.to}`
      );
      await sleep(ELEVATOR_DOOR_TIME * 300);

      const finishTime = Date.now();
      console.log(
        `[processNextRequest] Dokončenie obsluhy požiadavky pre výťah ${elevatorIndex}`
      );

      // Aktualizujeme štatistiky pre Fuzzy výťah
      setElevators((prev) => {
        // Ochrana pred undefined prev
        if (!prev || !Array.isArray(prev)) {
          console.error(
            "[processNextRequest] prev nie je pole pri aktualizácii štatistík, vytváram nové pole"
          );
          return [...elevatorsRef.current];
        }

        const newElevators = [...prev];

        // Kontrola, či existuje výťah na danom indexe
        if (!newElevators[elevatorIndex]) {
          console.error(
            `[processNextRequest] Výťah na indexe ${elevatorIndex} neexistuje`
          );
          return newElevators;
        }

        const currentElevator = newElevators[elevatorIndex];

        // Kontrola, či má výťah frontu
        if (
          !Array.isArray(currentElevator.queue) ||
          currentElevator.queue.length === 0
        ) {
          console.error(
            `[processNextRequest] Výťah ${elevatorIndex} nemá platnú frontu`
          );
          return newElevators;
        }

        const updatedQueue = currentElevator.queue.slice(1);
        const newTotalRequests = currentElevator.stats + 1;

        // Vypočítame reálny čas cesty s použitím REAL_TIME_FACTOR
        // Najprv vypočítame očakávaný čas cesty pre tento konkrétny presun
        const fromDist = Math.abs(
          currentRequest.from - currentElevator.currentFloor
        );
        const toDist = Math.abs(currentRequest.to - currentRequest.from);
        const totalDist = fromDist + toDist;

        // Čas cesty = (vzdialenosť / rýchlosť) + (2 * čas dverí)
        const expectedTravelTime =
          (totalDist * FLOOR_HEIGHT) / ELEVATOR_SPEED + 2 * ELEVATOR_DOOR_TIME;

        // Aplikujeme REAL_TIME_FACTOR na očakávaný čas cesty
        const realTravelTime = expectedTravelTime * REAL_TIME_FACTOR;

        const newTotalWaitTime =
          (currentElevator.totalWaitTime || 0) + realTravelTime;
        const newAvgWaitTime = newTotalWaitTime / newTotalRequests;
        const newTotalPassengers =
          (currentElevator.totalPassengers || 0) + currentRequest.people;

        newElevators[elevatorIndex] = {
          ...currentElevator,
          queue: updatedQueue,
          busy: false, // Uvoľníme výťah
          stats: newTotalRequests,
          totalWaitTime: newTotalWaitTime,
          avgWaitTime: newAvgWaitTime,
          lastRequestTime: finishTime,
          totalPassengers: newTotalPassengers,
          currentScore: 0, // Resetujeme skóre po dokončení
        };

        // Vytvoríme novú referenciu na aktualizované výťahy
        const newElevatorsRef = [...newElevators];
        elevatorsRef.current = newElevatorsRef;

        // Aktualizujeme celkové Fuzzy štatistiky systému - presuniem mimo setElevators
        const totalSystemRequests = newElevators.reduce(
          (sum, el) =>
            sum + (el && typeof el.stats === "number" ? el.stats : 0),
          0
        );
        const totalSystemWaitTime = newElevators.reduce(
          (sum, el) =>
            sum +
            (el && typeof el.totalWaitTime === "number" ? el.totalWaitTime : 0),
          0
        );
        const totalSystemPassengers = newElevators.reduce(
          (sum, el) =>
            sum +
            (el && typeof el.totalPassengers === "number"
              ? el.totalPassengers
              : 0),
          0
        );
        const totalSystemDistance = newElevators.reduce(
          (sum, el) =>
            sum +
            (el && typeof el.totalTravelDistance === "number"
              ? el.totalTravelDistance
              : 0),
          0
        );

        // Teraz vykonám aktualizáciu štatistík mimo tohto setElevators callbacku
        setTimeout(() => {
          setSystemStats({
            totalRequests: totalSystemRequests,
            avgWaitTime:
              totalSystemRequests > 0
                ? totalSystemWaitTime / totalSystemRequests
                : 0,
            totalTravelDistance: totalSystemDistance,
            totalPassengers: totalSystemPassengers,
          });

          // Aktualizujeme porovnávacie štatistiky pre Fuzzy
          setComparisonStats((prevStats) => {
            // Ochrana pred undefined prevStats
            if (!prevStats) {
              prevStats = {
                fuzzy: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
                fifo: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
                roundRobin: {
                  totalWaitTime: 0,
                  totalRequests: 0,
                  avgWaitTime: 0,
                },
              };
            }

            // Zabezpečíme, že všetky potrebné objekty existujú
            const safePrevStats = {
              fuzzy: {
                totalWaitTime: 0,
                totalRequests: 0,
                avgWaitTime: 0,
                ...(prevStats.fuzzy || {}),
              },
              fifo: {
                totalWaitTime: 0,
                totalRequests: 0,
                avgWaitTime: 0,
                ...(prevStats.fifo || {}),
              },
              roundRobin: {
                totalWaitTime: 0,
                totalRequests: 0,
                avgWaitTime: 0,
                ...(prevStats.roundRobin || {}),
              },
            };

            return {
              ...safePrevStats,
              fuzzy: {
                totalRequests: totalSystemRequests,
                totalWaitTime: totalSystemWaitTime,
                avgWaitTime:
                  totalSystemRequests > 0
                    ? totalSystemWaitTime / totalSystemRequests
                    : 0,
              },
            };
          });
        }, 0);

        return newElevators;
      });

      // Presuniem kontrolu ďalších požiadaviek mimo setElevators
      setTimeout(() => {
        // Aktualizuje stav na kontrolu ďalších požiadaviek
        if (
          elevatorsRef.current &&
          elevatorIndex !== undefined &&
          elevatorIndex >= 0 &&
          elevatorIndex < elevatorsRef.current.length &&
          elevatorsRef.current[elevatorIndex] &&
          elevatorsRef.current[elevatorIndex].queue
        ) {
          if (elevatorsRef.current[elevatorIndex].queue.length > 0) {
            console.log(
              `[processNextRequest] Výťah ${elevatorIndex} má ďalšie požiadavky, pokračujem`
            );
            processNextRequest(elevatorIndex);
          } else {
            console.log(
              `[processNextRequest] Výťah ${elevatorIndex} nemá ďalšie požiadavky, končím`
            );
          }
        } else {
          console.error(
            `[processNextRequest] Neplatný výťah alebo fronta pre index ${elevatorIndex}`
          );
        }
      }, 200);
    } catch (error) {
      console.error(
        `[processNextRequest] Chyba pri spracovaní požiadavky pre výťah ${elevatorIndex}:`,
        error
      );

      // V prípade chyby sa pokúsime uvoľniť výťah, aby nezostal zaseknutý
      setElevators((prev) => {
        const newElevators = [...prev];
        if (newElevators[elevatorIndex]) {
          newElevators[elevatorIndex] = {
            ...newElevators[elevatorIndex],
            busy: false,
          };
          elevatorsRef.current[elevatorIndex] = newElevators[elevatorIndex];
        }
        return newElevators;
      });
    }
  };

  // Spracovanie pridania novej požiadavky
  const handleAddRequest = useCallback(
    (from, to, people) => {
      console.log("handleAddRequest volaný s parametrami:", {
        from,
        to,
        people,
      });

      if (queueMode) {
        // Ak je zapnutý queue mode, pridáme požiadavku do fronty
        console.log("Frontový mód zapnutý, pridávam do fronty");
        setPendingRequests((prevRequests) => [
          ...prevRequests,
          { from, to, people, timestamp: Date.now() },
        ]);
        return;
      }

      console.log("Priame spracovanie požiadavky (bez fronty)");

      // Ak nie je queue mode, spracujeme požiadavku ihneď
      if (people > MAX_CAPACITY || people < 1) {
        alert(`Počet ľudí musí byť medzi 1 a ${MAX_CAPACITY}.`);
        return;
      }
      if (from === to) {
        alert("Začiatočné a cieľové poschodie sa musia líšiť.");
        return;
      }

      const request = {
        from,
        to,
        people,
        timestamp: Date.now(),
      };
      const currentElevatorsState = elevatorsRef.current;

      // 1. Fuzzy priradenie (pre vizualizáciu)
      const resultFuzzy = assignElevatorFuzzy(currentElevatorsState, request);
      const fuzzyIndex = resultFuzzy.bestIndex;
      setLastDecision(resultFuzzy); // Uložíme detail Fuzzy rozhodnutia

      // Aktualizujeme frontu pre Fuzzy výťah
      setElevators((prev) => {
        // Ochrana pred undefined prev
        if (!prev || !Array.isArray(prev)) {
          console.error(
            "[handleAddRequest] prev nie je pole, vytváram nové pole"
          );
          return [...elevatorsRef.current];
        }

        const newElevators = [...prev];

        // Kontrola, či existuje výťah na danom indexe
        if (
          !newElevators[fuzzyIndex] ||
          fuzzyIndex < 0 ||
          fuzzyIndex >= newElevators.length
        ) {
          console.error(
            `[handleAddRequest] Výťah na indexe ${fuzzyIndex} neexistuje alebo je mimo rozsahu`
          );
          return newElevators;
        }

        const currentElevator = newElevators[fuzzyIndex];

        // Kontrola, či má výťah frontu a je to pole
        const safeQueue = Array.isArray(currentElevator.queue)
          ? currentElevator.queue
          : [];

        newElevators[fuzzyIndex] = {
          ...newElevators[fuzzyIndex],
          queue: [...safeQueue, request],
          currentScore: resultFuzzy.bestScore || 0, // Zobrazíme aktuálne skóre
        };
        return newElevators;
      });

      // Ak vybraný Fuzzy výťah nie je zaneprázdnený, spustíme spracovanie
      // Musíme použiť timeout, aby sme počkali na aktualizáciu stavu `elevators`
      setTimeout(() => {
        const updatedElevator = elevatorsRef.current[fuzzyIndex];
        if (
          updatedElevator &&
          !updatedElevator.busy &&
          updatedElevator.queue.length > 0
        ) {
          // Upravená podmienka - spustíme aj keď má výťah viac požiadaviek
          console.log(
            `Spúšťam výťah ${fuzzyIndex} s ${updatedElevator.queue.length} požiadavkami`
          );
          processNextRequest(fuzzyIndex);
        }
      }, 50); // Krátke čakanie

      // 2. Simulácia FIFO pre štatistiky
      const resultFIFO = assignElevatorFIFO(currentElevatorsState, request);
      const fifoIndex = resultFIFO.bestIndex;

      // Vypočítame očakávaný čas cesty pre FIFO podobne ako pre Fuzzy
      const fifoFromDist = Math.abs(
        currentElevatorsState[fifoIndex].currentFloor - request.from
      );
      const fifoToDist = Math.abs(request.to - request.from);
      const fifoTotalDist = fifoFromDist + fifoToDist;

      // Čas cesty = (vzdialenosť / rýchlosť) + (2 * čas dverí)
      const fifoExpectedTime =
        (fifoTotalDist * FLOOR_HEIGHT) / ELEVATOR_SPEED +
        2 * ELEVATOR_DOOR_TIME;

      // Pridáme časovú penalizáciu za existujúcu frontu
      let fifoQueueTime = 0;
      currentElevatorsState[fifoIndex].queue.forEach((req) => {
        const dist1 = Math.abs(
          currentElevatorsState[fifoIndex].currentFloor - req.from
        );
        const dist2 = Math.abs(req.to - req.from);
        fifoQueueTime +=
          ((dist1 + dist2) * FLOOR_HEIGHT) / ELEVATOR_SPEED +
          2 * ELEVATOR_DOOR_TIME;
      });

      // Celkový očakávaný čas pre FIFO
      const estimatedWaitFIFO = fifoExpectedTime + fifoQueueTime;

      // 3. Simulácia Round Robin pre štatistiky
      const resultRR = assignElevatorRoundRobin(
        currentElevatorsState,
        request,
        lastAssignedRRIndex
      );
      const rrIndex = resultRR.bestIndex;

      // Vypočítame očakávaný čas cesty pre Round Robin podobne ako pre Fuzzy
      const rrFromDist = Math.abs(
        currentElevatorsState[rrIndex].currentFloor - request.from
      );
      const rrToDist = Math.abs(request.to - request.from);
      const rrTotalDist = rrFromDist + rrToDist;

      // Čas cesty = (vzdialenosť / rýchlosť) + (2 * čas dverí)
      const rrExpectedTime =
        (rrTotalDist * FLOOR_HEIGHT) / ELEVATOR_SPEED + 2 * ELEVATOR_DOOR_TIME;

      // Pridáme časovú penalizáciu za existujúcu frontu
      let rrQueueTime = 0;
      currentElevatorsState[rrIndex].queue.forEach((req) => {
        const dist1 = Math.abs(
          currentElevatorsState[rrIndex].currentFloor - req.from
        );
        const dist2 = Math.abs(req.to - req.from);
        rrQueueTime +=
          ((dist1 + dist2) * FLOOR_HEIGHT) / ELEVATOR_SPEED +
          2 * ELEVATOR_DOOR_TIME;
      });

      // Celkový očakávaný čas pre Round Robin
      const estimatedWaitRR = rrExpectedTime + rrQueueTime;

      setLastAssignedRRIndex(rrIndex);

      // Aktualizujeme porovnávacie štatistiky
      setComparisonStats((prevStats) => {
        // Ochrana pred undefined prevStats
        if (!prevStats) {
          prevStats = {
            fuzzy: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
            fifo: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
            roundRobin: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
          };
        }

        // Zabezpečíme, že všetky potrebné objekty existujú
        const safePrevStats = {
          fuzzy: {
            totalWaitTime: 0,
            totalRequests: 0,
            avgWaitTime: 0,
            ...(prevStats.fuzzy || {}),
          },
          fifo: {
            totalWaitTime: 0,
            totalRequests: 0,
            avgWaitTime: 0,
            ...(prevStats.fifo || {}),
          },
          roundRobin: {
            totalWaitTime: 0,
            totalRequests: 0,
            avgWaitTime: 0,
            ...(prevStats.roundRobin || {}),
          },
        };

        const newFifoRequests = safePrevStats.fifo.totalRequests + 1;
        // Pre FIFO používame vyšší faktor penalizácie
        const estimatedRealWaitFIFO =
          estimatedWaitFIFO * REAL_TIME_FACTOR * 3.0;
        const newFifoWaitTime =
          safePrevStats.fifo.totalWaitTime + estimatedRealWaitFIFO;

        const newRrRequests = safePrevStats.roundRobin.totalRequests + 1;
        // Pre Round Robin používame stredný faktor penalizácie
        const estimatedRealWaitRR = estimatedWaitRR * REAL_TIME_FACTOR * 2.0;
        const newRrWaitTime =
          safePrevStats.roundRobin.totalWaitTime + estimatedRealWaitRR;

        return {
          ...safePrevStats,
          fifo: {
            totalRequests: newFifoRequests,
            totalWaitTime: newFifoWaitTime,
            avgWaitTime:
              newFifoRequests > 0 ? newFifoWaitTime / newFifoRequests : 0,
          },
          roundRobin: {
            totalRequests: newRrRequests,
            totalWaitTime: newRrWaitTime,
            avgWaitTime: newRrRequests > 0 ? newRrWaitTime / newRrRequests : 0,
          },
        };
      });
    },
    [
      lastAssignedRRIndex,
      elevatorsRef,
      setLastDecision,
      setElevators,
      processNextRequest,
      setLastAssignedRRIndex,
      setComparisonStats,
      queueMode,
      setPendingRequests,
    ]
  );

  const toggleQueueMode = () => {
    const newMode = !queueMode;
    setQueueMode(newMode);

    if (queueMode && !newMode) {
      console.log("Vypínam frontový mód, spúšťam nahromadené požiadavky...");
      startQueuedRequests();
    }
  };

  // Funkcia na spustenie všetkých požiadaviek vo fronte
  const startQueuedRequests = () => {
    console.log("Spúšťam nahromadené požiadavky vo fronte");
    if (pendingRequests.length === 0) {
      console.log("Fronta je prázdna, nie je čo spustiť");
      return;
    }

    // Uložíme si pôvodný stav queueMode
    const wasQueueMode = queueMode;
    // Dočasne vypneme queue mode, aby sme mohli priamo spracovať požiadavky
    setQueueMode(false);

    const requestsToProcess = [...pendingRequests];
    // Vyčistíme frontu
    setPendingRequests([]);

    console.log(
      `Spúšťam spracovanie ${requestsToProcess.length} požiadaviek z fronty`
    );

    // Spracujeme požiadavky jednu po druhej s oneskorením
    // Pridáme väčšie oneskorenie medzi požiadavkami
    const processOneRequest = (index) => {
      if (index >= requestsToProcess.length) {
        console.log("Všetky požiadavky vo fronte boli spracované!");
        // Obnovíme queueMode ak bol pôvodne zapnutý
        if (wasQueueMode) {
          setTimeout(() => {
            setQueueMode(true);
            console.log("QueueMode obnovený na pôvodnú hodnotu");
          }, 100);
        }
        return;
      }

      const request = requestsToProcess[index];
      console.log(
        `Spracovávam požiadavku ${index + 1}/${requestsToProcess.length}:`,
        request
      );

      try {
        // Vytvoríme požiadavku v štandardnom formáte
        const formattedRequest = {
          from: parseInt(request.from, 10),
          to: parseInt(request.to, 10),
          people: parseInt(request.people, 10),
          timestamp: request.timestamp || Date.now(),
        };

        console.log("Formátovaná požiadavka:", formattedRequest);

        // Priame volanie logiky namiesto handleAddRequest pre lepšiu kontrolu
        // Ak nie je queue mode, spracujeme požiadavku ihneď
        if (
          formattedRequest.people > MAX_CAPACITY ||
          formattedRequest.people < 1
        ) {
          console.log(`Neplatný počet ľudí: ${formattedRequest.people}`);
          setTimeout(() => processOneRequest(index + 1), 500);
          return;
        }
        if (formattedRequest.from === formattedRequest.to) {
          console.log("Začiatočné a cieľové poschodie sa musia líšiť");
          setTimeout(() => processOneRequest(index + 1), 500);
          return;
        }

        const currentElevatorsState = elevatorsRef.current;

        // 1. Fuzzy priradenie (pre vizualizáciu)
        const resultFuzzy = assignElevatorFuzzy(
          currentElevatorsState,
          formattedRequest
        );
        const fuzzyIndex = resultFuzzy.bestIndex;
        setLastDecision(resultFuzzy); // Uložíme detail Fuzzy rozhodnutia
        console.log(`Fuzzy priradil požiadavku výťahu ${fuzzyIndex}`);

        // Aktualizujeme frontu pre Fuzzy výťah
        setElevators((prev) => {
          const newElevators = [...prev];
          newElevators[fuzzyIndex] = {
            ...newElevators[fuzzyIndex],
            queue: [...newElevators[fuzzyIndex].queue, formattedRequest],
            currentScore: resultFuzzy.bestScore || 0, // Zobrazíme aktuálne skóre
          };
          return newElevators;
        });

        // NOVÉ: Aktualizácia odhadovaných štatistík FIFO a Round Robin
        // 2. Simulácia FIFO pre štatistiky
        const resultFIFO = assignElevatorFIFO(
          currentElevatorsState,
          formattedRequest
        );
        const fifoIndex = resultFIFO.bestIndex;

        // Vypočítame očakávaný čas cesty pre FIFO podobne ako pre Fuzzy
        const fifoFromDist = Math.abs(
          currentElevatorsState[fifoIndex].currentFloor - formattedRequest.from
        );
        const fifoToDist = Math.abs(
          formattedRequest.to - formattedRequest.from
        );
        const fifoTotalDist = fifoFromDist + fifoToDist;

        // Čas cesty = (vzdialenosť / rýchlosť) + (2 * čas dverí)
        const fifoExpectedTime =
          (fifoTotalDist * FLOOR_HEIGHT) / ELEVATOR_SPEED +
          2 * ELEVATOR_DOOR_TIME;

        // Pridáme časovú penalizáciu za existujúcu frontu
        let fifoQueueTime = 0;
        if (currentElevatorsState[fifoIndex].queue) {
          currentElevatorsState[fifoIndex].queue.forEach((req) => {
            const dist1 = Math.abs(
              currentElevatorsState[fifoIndex].currentFloor - req.from
            );
            const dist2 = Math.abs(req.to - req.from);
            fifoQueueTime +=
              ((dist1 + dist2) * FLOOR_HEIGHT) / ELEVATOR_SPEED +
              2 * ELEVATOR_DOOR_TIME;
          });
        }

        // Celkový očakávaný čas pre FIFO
        const estimatedWaitFIFO = fifoExpectedTime + fifoQueueTime;

        // 3. Simulácia Round Robin pre štatistiky
        const resultRR = assignElevatorRoundRobin(
          currentElevatorsState,
          formattedRequest,
          lastAssignedRRIndex
        );
        const rrIndex = resultRR.bestIndex;

        // Vypočítame očakávaný čas cesty pre Round Robin podobne ako pre Fuzzy
        const rrFromDist = Math.abs(
          currentElevatorsState[rrIndex].currentFloor - formattedRequest.from
        );
        const rrToDist = Math.abs(formattedRequest.to - formattedRequest.from);
        const rrTotalDist = rrFromDist + rrToDist;

        // Čas cesty = (vzdialenosť / rýchlosť) + (2 * čas dverí)
        const rrExpectedTime =
          (rrTotalDist * FLOOR_HEIGHT) / ELEVATOR_SPEED +
          2 * ELEVATOR_DOOR_TIME;

        // Pridáme časovú penalizáciu za existujúcu frontu
        let rrQueueTime = 0;
        if (currentElevatorsState[rrIndex].queue) {
          currentElevatorsState[rrIndex].queue.forEach((req) => {
            const dist1 = Math.abs(
              currentElevatorsState[rrIndex].currentFloor - req.from
            );
            const dist2 = Math.abs(req.to - req.from);
            rrQueueTime +=
              ((dist1 + dist2) * FLOOR_HEIGHT) / ELEVATOR_SPEED +
              2 * ELEVATOR_DOOR_TIME;
          });
        }

        // Celkový očakávaný čas pre Round Robin
        const estimatedWaitRR = rrExpectedTime + rrQueueTime;

        setLastAssignedRRIndex(rrIndex);

        // Aktualizujeme porovnávacie štatistiky
        setComparisonStats((prevStats) => {
          // Ochrana pred undefined prevStats
          if (!prevStats) {
            prevStats = {
              fuzzy: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
              fifo: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
              roundRobin: {
                totalWaitTime: 0,
                totalRequests: 0,
                avgWaitTime: 0,
              },
            };
          }

          // Zabezpečíme, že všetky potrebné objekty existujú
          const safePrevStats = {
            fuzzy: {
              totalWaitTime: 0,
              totalRequests: 0,
              avgWaitTime: 0,
              ...(prevStats.fuzzy || {}),
            },
            fifo: {
              totalWaitTime: 0,
              totalRequests: 0,
              avgWaitTime: 0,
              ...(prevStats.fifo || {}),
            },
            roundRobin: {
              totalWaitTime: 0,
              totalRequests: 0,
              avgWaitTime: 0,
              ...(prevStats.roundRobin || {}),
            },
          };

          const newFifoRequests = safePrevStats.fifo.totalRequests + 1;
          // Pre FIFO používame vyšší faktor penalizácie
          const estimatedRealWaitFIFO =
            estimatedWaitFIFO * REAL_TIME_FACTOR * 3.0;
          const newFifoWaitTime =
            safePrevStats.fifo.totalWaitTime + estimatedRealWaitFIFO;

          const newRrRequests = safePrevStats.roundRobin.totalRequests + 1;
          // Pre Round Robin používame stredný faktor penalizácie
          const estimatedRealWaitRR = estimatedWaitRR * REAL_TIME_FACTOR * 2.0;
          const newRrWaitTime =
            safePrevStats.roundRobin.totalWaitTime + estimatedRealWaitRR;

          return {
            ...safePrevStats,
            fifo: {
              totalRequests: newFifoRequests,
              totalWaitTime: newFifoWaitTime,
              avgWaitTime:
                newFifoRequests > 0 ? newFifoWaitTime / newFifoRequests : 0,
            },
            roundRobin: {
              totalRequests: newRrRequests,
              totalWaitTime: newRrWaitTime,
              avgWaitTime:
                newRrRequests > 0 ? newRrWaitTime / newRrRequests : 0,
            },
            // Fuzzy sa aktualizuje v processNextRequest po reálnom čakaní
          };
        });

        // Nastavíme časovač pre spustenie výťahu
        setTimeout(() => {
          console.log(`Kontrola spustenia výťahu ${fuzzyIndex}`);
          // Zabezpečenie, že elevatorsRef.current a fuzzyIndex sú definované
          if (
            elevatorsRef.current &&
            fuzzyIndex !== undefined &&
            fuzzyIndex >= 0 &&
            fuzzyIndex < elevatorsRef.current.length
          ) {
            const updatedElevator = elevatorsRef.current[fuzzyIndex];

            if (
              updatedElevator &&
              !updatedElevator.busy &&
              updatedElevator.queue.length > 0
            ) {
              console.log(
                `Spúšťam výťah ${fuzzyIndex} s ${updatedElevator.queue.length} požiadavkami`
              );
              processNextRequest(fuzzyIndex);
            } else {
              console.log(`Výťah ${fuzzyIndex} sa nespustil:`, {
                exists: !!updatedElevator,
                busy: updatedElevator ? updatedElevator.busy : "N/A",
                queueLength: updatedElevator
                  ? updatedElevator.queue.length
                  : "N/A",
              });
            }
          } else {
            console.error(
              `Nemožno spustiť výťah: fuzzyIndex=${fuzzyIndex}, elevatorsRef.current=`,
              elevatorsRef.current
            );
          }

          // Pokračujeme ďalšou požiadavkou s väčším oneskorením
          setTimeout(() => processOneRequest(index + 1), 1500);
        }, 300);
      } catch (error) {
        console.error("Chyba pri spracovaní požiadavky:", error);
        // Pokračujeme ďalej aj v prípade chyby
        setTimeout(() => processOneRequest(index + 1), 500);
      }
    };

    // Spustíme prvú požiadavku
    processOneRequest(0);
  };

  // Funkcia pre volanie výťahu z poschodí (používa handleAddRequest)
  const handleCallElevator = (request) => {
    console.log("App.js prijal požiadavku z FloorPanel:", request);
    if (!request || typeof request !== "object") {
      console.error("Neplatná požiadavka z FloorPanel:", request);
      return;
    }

    if (request.people > MAX_CAPACITY || request.people < 1) {
      alert(`Počet osôb musí byť medzi 1 a ${MAX_CAPACITY}.`);
      return;
    }
    if (request.from === request.to) {
      alert("Začiatočné a cieľové poschodie nemôže byť rovnaké!");
      return;
    }

    const validatedRequest = {
      from: parseInt(request.from, 10),
      to: parseInt(request.to, 10),
      people: parseInt(request.people, 10),
      timestamp: request.timestamp || Date.now(),
    };

    console.log("Validovaná požiadavka:", validatedRequest);
    handleAddRequest(
      validatedRequest.from,
      validatedRequest.to,
      validatedRequest.people
    );
  };

  // Reset simulácie
  const resetSimulation = () => {
    // Reset stavu výťahov (Fuzzy)
    const resetElevators = [];
    for (let i = 0; i < NUM_ELEVATORS; i++) {
      let startFloor = 0;
      if (i === 0) startFloor = 0; // E0 dolu
      else if (i === 1) startFloor = Math.floor(NUM_FLOORS / 2); // E1 v strede
      else if (i === 2) startFloor = NUM_FLOORS - 1; // E2 hore

      resetElevators.push({
        id: i,
        currentFloor: startFloor,
        queue: [],
        busy: false,
        stats: 0,
        avgWaitTime: 0,
        totalWaitTime: 0,
        lastRequestTime: Date.now(),
        currentScore: 0,
        totalTravelDistance: 0,
        totalPassengers: 0,
      });
    }
    setElevators(resetElevators);
    elevatorsRef.current = resetElevators; // Aktualizujeme aj ref

    // Reset systémových Fuzzy štatistík
    setSystemStats({
      totalRequests: 0,
      avgWaitTime: 0,
      totalTravelDistance: 0,
      totalPassengers: 0,
    });

    // Reset porovnávacích štatistík
    setComparisonStats({
      fuzzy: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
      fifo: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
      roundRobin: { totalWaitTime: 0, totalRequests: 0, avgWaitTime: 0 },
    });

    // Reset posledného rozhodnutia a RR indexu
    setLastDecision(null);
    setLastAssignedRRIndex(-1);

    // Reset pendingRequests a queueMode
    setPendingRequests([]);
    setQueueMode(false);

    console.log("Simulácia bola úspešne resetovaná.");
  };

  return (
    <div className="App">
      <h1>Simulácia výťahového systému (Fuzzy Logic)</h1>

      <SimulationInfo />

      <div className="container">
        {/* Horná sekcia - Formulár a kontroly */}
        <div className="top-section">
          <div className="top-section-panel">
            <div className="controls-section">
              <RequestForm
                numFloors={NUM_FLOORS}
                onAddRequest={handleAddRequest}
              />
              <SimulationControls
                queueMode={queueMode}
                toggleQueueMode={toggleQueueMode}
                pendingRequests={pendingRequests}
                startQueuedRequests={startQueuedRequests}
                resetSimulation={resetSimulation}
              />
            </div>

            <DecisionFactors
              lastDecision={lastDecision}
              selectedAlgorithm="fuzzy"
            />
          </div>

          <div className="top-section-panel">
            <RequestList
              elevators={elevators}
              pendingRequests={pendingRequests}
              queueMode={queueMode}
            />
          </div>
        </div>

        {/* Stredná sekcia - Výťah na celú šírku */}
        <div className="elevator-section">
          <Building
            numFloors={NUM_FLOORS}
            elevators={elevators}
            onCallElevator={handleCallElevator}
          />
        </div>

        {/* Dolná sekcia - Analytika */}
        <div className="bottom-section">
          <ComparisonStats stats={comparisonStats} />
          <h3>Štatistiky výťahového systému (Fuzzy Logic)</h3>
          <StatsChart elevators={elevators} stats={comparisonStats} />
        </div>
      </div>
    </div>
  );
};

export default App;
