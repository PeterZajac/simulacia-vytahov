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
