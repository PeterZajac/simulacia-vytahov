// Implementácia rôznych algoritmov pre výber výťahu

/**
 * Fuzzy logika pre výber výťahu
 */
export function assignElevatorFuzzy(elevators, request) {
  // Inicializácia najlepšieho indexu a najlepšieho skóre
  let bestIndex = 0;
  let bestScore = Infinity;
  const scores = [];
  // Prechádzanie cez všetky výťahy
  elevators.forEach((elevator, i) => {
    // Výpočet faktoru vzdialenosti medzi aktuálnym a požadovaným poschodom
    const distanceFactor = Math.abs(elevator.currentFloor - request.from) * 1.5;
    // Výpočet faktoru dlžky fronty
    const queueFactor = elevator.queue.length * 3;
    // Výpočet faktoru, ak je výťah zaneprázdnený
    const busyFactor = elevator.busy ? 15 : 0;
    // Výpočet faktoru počtu ľudí
    const peopleFactor = request.people * 2;
    // Výpočet faktoru smeru, ak sa zhoduje smer pohybu výťahu a požiadavky
    const directionFactor =
      elevator.queue.length > 0
        ? (elevator.queue[0].from > elevator.currentFloor &&
            request.from > elevator.currentFloor) ||
          (elevator.queue[0].from < elevator.currentFloor &&
            request.from < elevator.currentFloor)
          ? 0
          : 8
        : 0;
    // Výpočet času od poslednej požiadavky
    const timeSinceLastRequest = (Date.now() - elevator.lastRequestTime) / 1000;
    // Výpočet faktoru času od poslednej požiadavky
    const timeFactor = Math.max(0, -timeSinceLastRequest / 10);
    // Výpočet celkového počtu ľudí vo fronte
    const totalPeopleInQueue = elevator.queue.reduce(
      (sum, req) => sum + req.people,
      0
    );
    // Výpočet faktoru zaťaženia výťahu
    const loadFactor = totalPeopleInQueue * 1.5;
    // Výpočet celkového skóre, ktoré sa použije na určenie najlepšieho výťahu
    const score =
      distanceFactor +
      queueFactor +
      busyFactor +
      peopleFactor +
      directionFactor +
      timeFactor +
      loadFactor;

    scores.push({
      elevatorId: i,
      score,
      details: {
        distanceFactor,
        queueFactor,
        busyFactor,
        peopleFactor,
        directionFactor,
        timeFactor,
        loadFactor,
        totalScore: score,
      },
    });

    // Kontrola, či je aktuálne skóre lepšie ako najlepšie doteraz
    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });
  // Vrátenie najlepšieho indexu
  return {
    bestIndex,
    scores,
    bestScore,
  };
}

/**
 * FIFO (First In, First Out) algoritmus pre výber výťahu
 * Priraďuje požiadavku prvému dostupnému výťahu, alebo výťahu s najkratším
 * počtom čakajúcich požiadaviek.
 */
export function assignElevatorFIFO(elevators, request) {
  let bestIndex = 0;
  let shortestQueue = Infinity;

  // Nájdeme výťah s najmenším počtom požiadaviek
  elevators.forEach((elevator, i) => {
    if (elevator.queue.length < shortestQueue) {
      shortestQueue = elevator.queue.length;
      bestIndex = i;
    }
  });

  // Vytvoríme správu o rozhodnutí
  const decisionDetails = elevators.map((elevator, i) => ({
    elevatorId: i,
    queueLength: elevator.queue.length,
    selected: i === bestIndex,
  }));

  return {
    bestIndex,
    scores: decisionDetails,
    bestScore: shortestQueue,
    decisionReason: `Výťah ${bestIndex} má najkratšiu frontu: ${shortestQueue} požiadaviek`,
  };
}

/**
 * Round Robin algoritmus pre výber výťahu
 * Priraďuje požiadavky cyklicky medzi výťahy, bez ohľadu na ich obsadenosť alebo pozíciu.
 */
export function assignElevatorRoundRobin(
  elevators,
  request,
  lastAssignedIndex
) {
  // V round robin algoritme jednoducho vyberieme ďalší výťah v rade
  const bestIndex = (lastAssignedIndex + 1) % elevators.length;

  // Vytvoríme správu o rozhodnutí
  const decisionDetails = elevators.map((elevator, i) => ({
    elevatorId: i,
    selected: i === bestIndex,
  }));

  return {
    bestIndex,
    scores: decisionDetails,
    bestScore: 0,
    decisionReason: `Round Robin: Výťah ${bestIndex} vybratý ako ďalší v poradí`,
  };
}
