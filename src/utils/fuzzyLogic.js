export function assignElevator(elevators, request) {
  let bestIndex = 0;
  let bestScore = Infinity;
  elevators.forEach((elevator, i) => {
    const distanceFactor = Math.abs(elevator.currentFloor - request.from);
    const queueFactor = elevator.queue.length * 2;
    const busyFactor = elevator.busy ? 10 : 0;
    const peopleFactor = request.people / 2;
    const score = distanceFactor + queueFactor + busyFactor + peopleFactor;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });
  return bestIndex;
}

export function assignElevatorFuzzy(elevators, request) {
  let bestIndex = 0;
  let bestScore = Infinity;

  elevators.forEach((elevator, i) => {
    // Vzdialenosť od aktuálnej pozície výťahu k požiadavke
    const distanceFactor = Math.abs(elevator.currentFloor - request.from) * 1.5;

    // Faktor fronty (čím dlhšia fronta, tým horšie skóre)
    const queueFactor = elevator.queue.length * 3;

    // Faktor obsadenosti (ak je výťah zaneprázdnený, má horšie skóre)
    const busyFactor = elevator.busy ? 15 : 0;

    // Faktor počtu ľudí (čím viac ľudí, tým horšie skóre)
    const peopleFactor = request.people * 2;

    // Faktor smeru (ak výťah ide v opačnom smere, má horšie skóre)
    const directionFactor =
      elevator.queue.length > 0
        ? (elevator.queue[0].from > elevator.currentFloor &&
            request.from > elevator.currentFloor) ||
          (elevator.queue[0].from < elevator.currentFloor &&
            request.from < elevator.currentFloor)
          ? 0
          : 8
        : 0;

    // Faktor času od poslednej požiadavky (čím dlhšie čakanie, tým lepšie skóre)
    const timeSinceLastRequest = (Date.now() - elevator.lastRequestTime) / 1000; // v sekundách
    const timeFactor = Math.max(0, -timeSinceLastRequest / 10); // negatívny faktor pre dlhšie čakanie

    // Faktor zaťaženia výťahu (čím viac ľudí v rade, tým horšie skóre)
    const totalPeopleInQueue = elevator.queue.reduce(
      (sum, req) => sum + req.people,
      0
    );
    const loadFactor = totalPeopleInQueue * 1.5;

    // Celkové skóre
    const score =
      distanceFactor +
      queueFactor +
      busyFactor +
      peopleFactor +
      directionFactor +
      timeFactor +
      loadFactor;

    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });

  return bestIndex;
}
