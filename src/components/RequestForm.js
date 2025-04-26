import React, { useState } from "react";
import { MAX_CAPACITY } from "../constants";

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
    const fromValue = parseInt(from, 10);
    const toValue = parseInt(to, 10);
    const peopleValue = parseInt(people, 10);

    onAddRequest(fromValue, toValue, peopleValue);
    console.log("Pridaná požiadavka:", {
      from: fromValue,
      to: toValue,
      people: peopleValue,
    });
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
