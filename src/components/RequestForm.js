import React, { useState } from "react";
import { MAX_CAPACITY } from "../App";

const RequestForm = ({ numFloors, onAddRequest }) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [people, setPeople] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulár odoslaný:", { from, to, people });
    if (parseInt(from, 10) === parseInt(to, 10)) {
      alert("Poschodie 'od' a 'na' nemôže byť rovnaké!");
      return;
    }
    const request = {
      from: parseInt(from, 10),
      to: parseInt(to, 10),
      people: parseInt(people, 10),
      timestamp: Date.now(),
    };
    onAddRequest(request);
    console.log("Pridaná požiadavka:", request);
  };

  return (
    <div className="request-form">
      <h2>Nová požiadavka</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Od poschodia: </label>
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {Array.from({ length: numFloors }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Na poschodie: </label>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {Array.from({ length: numFloors }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Počet ľudí: </label>
          <input
            type="number"
            value={people}
            min="1"
            max={MAX_CAPACITY}
            onChange={(e) => setPeople(e.target.value)}
          />
        </div>
        <button type="submit">Pridať požiadavku</button>
      </form>
    </div>
  );
};

export default RequestForm;
