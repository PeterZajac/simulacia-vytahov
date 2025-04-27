import React from "react";
import "./RequestList.css";

const RequestList = ({
  elevators,
  pendingRequests = [],
  queueMode = false,
}) => {
  const safeRequests = Array.isArray(pendingRequests) ? pendingRequests : [];
  const safeElevators = Array.isArray(elevators) ? elevators : [];

  return (
    <div className="request-list">
      <h2>Aktuálne požiadavky</h2>

      {queueMode && safeRequests.length > 0 && (
        <div className="pending-requests">
          <h3>Čakajúce požiadavky v rade</h3>
          <ul>
            {safeRequests.map((request, index) => (
              <li key={index} className="pending-request">
                Od: {request.from}, Na: {request.to}, Ľudia: {request.people}
              </li>
            ))}
          </ul>
        </div>
      )}

      {safeElevators.map((elevator) => (
        <div key={elevator.id} className="elevator-info">
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
