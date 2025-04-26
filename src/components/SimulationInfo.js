import React, { useState } from "react";
import "./SimulationInfo.css";

const SimulationInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="simulation-info">
      <button className="info-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Skryť návod" : "Ako simulácia funguje?"}
      </button>

      {isOpen && (
        <div className="info-content">
          <h3>Návod na používanie simulácie výťahového systému</h3>

          <div className="info-section">
            <h4>Výťahový systém a jeho ovládanie</h4>
            <ol>
              <li>
                V budove máte <strong>3 výťahy</strong> riadené inteligentným
                algoritmom s <strong>Fuzzy logikou</strong>, ktorý optimalizuje
                pridelenie výťahov na základe viacerých faktorov.
              </li>
              <li>
                <strong>Modrý výťah</strong> je voľný, <strong>červený</strong>{" "}
                je zaneprázdnený a obsluhuje požiadavku.
              </li>
              <li>
                Šípka ↑ a ↓ ukazuje aktuálny smer pohybu výťahu. Číslo "→ 5"
                ukazuje cieľové poschodie.
              </li>
              <li>
                Výťahy sa po 10 sekundách nečinnosti automaticky presunú do
                optimálnych východiskových polôh:
                <ul>
                  <li>Výťah 0 sa presunie na spodné poschodie (0)</li>
                  <li>
                    Výťah 1 sa presunie na stredné poschodie (polovica budovy)
                  </li>
                  <li>Výťah 2 sa presunie na horné poschodie</li>
                </ul>
                Toto zabezpečuje, že výťahy sú vždy v optimálnych pozíciách pre
                rýchle obslúženie požiadaviek z rôznych častí budovy.
              </li>
            </ol>
          </div>

          <div className="info-section">
            <h4>Ako zadať novú požiadavku</h4>
            <ol>
              <li>
                <strong>Formulár v hornej časti:</strong> Zadajte východiskové
                poschodie, cieľové poschodie a počet osôb, potom kliknite
                "Pridať požiadavku".
              </li>
              <li>
                <strong>Panely na poschodiach:</strong> Na každom poschodí
                budovy nájdete ovládací panel, kde môžete nastaviť počet osôb
                (+/-), vybrať cieľové poschodie a kliknúť "Privolať".
              </li>
              <li>
                <strong>Fronta požiadaviek:</strong> Zaškrtnutím "Pridávať do
                fronty" môžete najprv nazbierať viacero požiadaviek a potom ich
                všetky spustiť naraz tlačidlom "Spustiť frontu".
              </li>
            </ol>
          </div>

          <div className="info-section">
            <h4>Analytika a štatistiky</h4>
            <ul>
              <li>
                <strong>Porovnanie algoritmov:</strong> V spodnej časti vidíte
                reálny priemerný čas čakania pre Fuzzy logiku a odhadované časy
                pre porovnanie s algoritmami FIFO a Round Robin.
              </li>
              <li>
                <strong>Faktory rozhodovania:</strong> Tabuľka ukazuje, ako sa
                Fuzzy logika rozhoduje pri výbere výťahu. Nižšie skóre je lepšie
                a vyznačený riadok zobrazuje vybraný výťah.
              </li>
              <li>
                <strong>Detailné štatistiky:</strong> Graf a tabuľka zobrazujú
                štatistické údaje o výťahovom systéme vrátane počtu prepravených
                osôb, priemerného času čakania a ďalších metrík.
              </li>
            </ul>
          </div>

          <div className="info-section">
            <h4>Ako funguje Fuzzy logika v systéme</h4>
            <p>
              Algoritmus Fuzzy logiky prideľuje výťahy na základe komplexného
              hodnotenia viacerých faktorov:
            </p>
            <ul>
              <li>
                <strong>Vzdialenosť</strong> - ako ďaleko je výťah od miesta
                požiadavky
              </li>
              <li>
                <strong>Fronta</strong> - koľko požiadaviek už výťah spracováva
              </li>
              <li>
                <strong>Vyťaženosť</strong> - či je výťah momentálne
                zaneprázdnený
              </li>
              <li>
                <strong>Počet osôb</strong> - koľko ľudí chce použiť výťah
              </li>
              <li>
                <strong>Smer pohybu</strong> - či výťah ide rovnakým smerom ako
                požiadavka
              </li>
              <li>
                <strong>Čas od poslednej požiadavky</strong> - rovnomerné
                rozdelenie záťaže
              </li>
              <li>
                <strong>Celkové zaťaženie</strong> - dlhodobá vyťaženosť výťahu
              </li>
            </ul>
            <p>
              Tento prístup prináša efektívnejšie využitie výťahov, kratšie
              čakacie doby a lepší komfort pre používateľov v porovnaní s
              jednoduchšími algoritmami ako FIFO a Round Robin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationInfo;
