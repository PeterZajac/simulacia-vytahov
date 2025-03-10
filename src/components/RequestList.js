import React from "react";

const RequestList = ({ elevators }) => {
  return (
    <div className="request-list">
      <h2>Aktuálne požiadavky</h2>
      {elevators.map((elevator) => (
        <div key={elevator.id}>
          <h3>Výťah E{elevator.id}</h3>
          {elevator.queue.length === 0 ? (
            <p>Žiadne požiadavky</p>
          ) : (
            <ul>
              {elevator.queue.map((request, index) => (
                <li key={index}>
                  Od: {request.from}, Na: {request.to}, Ľudia: {request.people}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default RequestList;
