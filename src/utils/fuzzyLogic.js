export function assignElevatorFuzzy(elevators, request) {
  let bestIndex = 0;
  let bestScore = Infinity;
  elevators.forEach((elevator, i) => {
    const distanceFactor = Math.abs(elevator.currentFloor - request.from) * 1.5;
    const queueFactor = elevator.queue.length * 3;
    const busyFactor = elevator.busy ? 15 : 0;
    const peopleFactor = request.people * 2;
    const directionFactor =
      elevator.queue.length > 0
        ? (elevator.queue[0].from > elevator.currentFloor &&
            request.from > elevator.currentFloor) ||
          (elevator.queue[0].from < elevator.currentFloor &&
            request.from < elevator.currentFloor)
          ? 0
          : 8
        : 0;
    const timeSinceLastRequest = (Date.now() - elevator.lastRequestTime) / 1000;
    const timeFactor = Math.max(0, -timeSinceLastRequest / 10);
    const totalPeopleInQueue = elevator.queue.reduce(
      (sum, req) => sum + req.people,
      0
    );
    const loadFactor = totalPeopleInQueue * 1.5;
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
