import React from "react";
import "./DecisionFactors.css";

const DecisionFactors = ({ lastDecision }) => {
  if (!lastDecision) {
    return (
      <div className="decision-factors">
        <h3>Faktory rozhodnutia</h3>
        <p>Zatiaľ nebola vykonaná žiadna požiadavka.</p>
      </div>
    );
  }

  return (
    <div className="decision-factors">
      <h3>Faktory posledného rozhodnutia (Fuzzy)</h3>

      {lastDecision && (
        <div className="decision-details">
          <p>
            Vybraný výťah: <strong>E{lastDecision.bestIndex}</strong> so skóre{" "}
            <strong>{lastDecision.bestScore.toFixed(1)}</strong>
          </p>

          <table className="factors-table">
            <thead>
              <tr>
                <th>Výťah</th>
                <th>Vzdialenosť</th>
                <th>Fronta</th>
                <th>Zanepráz.</th>
                <th>Ľudia</th>
                <th>Smer</th>
                <th>Čas</th>
                <th>Zaťaženie</th>
                <th>Celkom</th>
              </tr>
            </thead>
            <tbody>
              {lastDecision.scores.map((score) => (
                <tr
                  key={score.elevatorId}
                  className={
                    score.elevatorId === lastDecision.bestIndex
                      ? "selected-row"
                      : ""
                  }
                >
                  <td>E{score.elevatorId}</td>
                  <td>{score.details.distanceFactor.toFixed(1)}</td>
                  <td>{score.details.queueFactor.toFixed(1)}</td>
                  <td>{score.details.busyFactor.toFixed(1)}</td>
                  <td>{score.details.peopleFactor.toFixed(1)}</td>
                  <td>{score.details.directionFactor.toFixed(1)}</td>
                  <td>{score.details.timeFactor.toFixed(1)}</td>
                  <td>{score.details.loadFactor.toFixed(1)}</td>
                  <td>
                    <strong>{score.details.totalScore.toFixed(1)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="factors-explanation">
            <p>
              <small>
                <strong>Vysvetlenie faktorov:</strong> Nižšie skóre je lepšie.
                Vzdialenosť = vzdialenosť od požiadavky, Fronta = počet
                požiadaviek vo fronte, Zanepráz. = či je výťah momentálne
                zaneprázdnený, Ľudia = počet ľudí v požiadavke, Smer = či je
                rovnaký smer pohybu, Čas = čas od poslednej požiadavky,
                Zaťaženie = celkové zaťaženie výťahu.
              </small>
            </p>
          </div>
        </div>
      )}
      {!lastDecision && <p>Zatiaľ nebola vykonaná žiadna požiadavka.</p>}
    </div>
  );
};

export default DecisionFactors;
