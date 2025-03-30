# Dokumentácia simulácie výťahového systému s fuzzy logikou

## 1. Úvod

Tento dokument popisuje implementáciu a používanie simulácie výťahového systému s fuzzy logikou. Simulácia je navrhnutá tak, aby demonštrovala efektívne riadenie viacerých výťahov pomocou pokročilých algoritmov priradenia požiadaviek.

## 2. Technické špecifikácie

### 2.1 Základné parametre systému

- Počet poschodí: 10
- Počet výťahov: 3
- Maximálna kapacita výťahu: 8 osôb
- Rýchlosť výťahu: 2 m/s
- Výška poschodia: 3 m

### 2.2 Technológie

- React.js pre frontend
- D3.js pre vizualizáciu dát
- JavaScript pre implementáciu fuzzy logiky

## 3. Architektúra systému

### 3.1 Hlavné komponenty

1. **App.js** - Hlavná komponenta aplikácie

   - Riadi stav simulácie
   - Spracováva logiku výťahov
   - Koordinuje komunikáciu medzi komponentami

2. **Building.js** - Vizuálna reprezentácia budovy

   - Zobrazuje poschodia
   - Animuje pohyb výťahov

3. **StatsChart.js** - Grafická reprezentácia štatistík

   - Zobrazuje celkové štatistiky systému
   - Aktualizuje sa v reálnom čase

4. **RequestForm.js** - Formulár pre pridávanie požiadaviek

   - Umožňuje zadať parametre novej požiadavky
   - Validuje vstupné dáta

5. **fuzzyLogic.js** - Implementácia algoritmu priradenia výťahov
   - Obsahuje logiku rozhodovania o priradení požiadavky

### 3.2 Štruktúra dát

#### Požiadavka (Request)

```javascript
{
  from: number,      // Počiatočné poschodie
  to: number,        // Cieľové poschodie
  people: number,    // Počet ľudí
  timestamp: number  // Čas vytvorenia požiadavky
}
```

#### Výťah (Elevator)

```javascript
{
  id: number,                    // Identifikátor výťahu
  currentFloor: number,          // Aktuálne poschodie
  queue: Request[],              // Fronta požiadaviek
  busy: boolean,                 // Stav zaneprázdnenia
  stats: number,                 // Počet spracovaných požiadaviek
  avgWaitTime: number,           // Priemerný čas čakania
  totalWaitTime: number,         // Celkový čas čakania
  lastRequestTime: number        // Čas poslednej požiadavky
}
```

## 4. Algoritmus fuzzy logiky

### 4.1 Faktory rozhodovania

Algoritmus používa nasledujúce faktory pre výpočet optimálneho priradenia výťahu:

1. **Vzdialenosť (distanceFactor)**

   - Váha: 1.5
   - Výpočet: `Math.abs(elevator.currentFloor - request.from) * 1.5`
   - Popis: Čím bližšie je výťah k požiadavke, tým lepšie skóre

2. **Dĺžka fronty (queueFactor)**

   - Váha: 3
   - Výpočet: `elevator.queue.length * 3`
   - Popis: Čím dlhšia fronta, tým horšie skóre

3. **Obsadenosť (busyFactor)**

   - Váha: 15
   - Výpočet: `elevator.busy ? 15 : 0`
   - Popis: Zaneprázdnené výťahy dostávajú penalizáciu

4. **Počet ľudí (peopleFactor)**

   - Váha: 2
   - Výpočet: `request.people * 2`
   - Popis: Čím viac ľudí v požiadavke, tým horšie skóre

5. **Smer pohybu (directionFactor)**

   - Váha: 8
   - Výpočet: Kontrola zhodnosti smeru s existujúcou požiadavkou
   - Popis: Penalizácia pre opačný smer pohybu

6. **Čas od poslednej požiadavky (timeFactor)**

   - Váha: -1/10 (negatívna)
   - Výpočet: `Math.max(0, -timeSinceLastRequest / 10)`
   - Popis: Dlho neaktívne výťahy dostávajú bonus

7. **Celkové zaťaženie (loadFactor)**
   - Váha: 1.5
   - Výpočet: `totalPeopleInQueue * 1.5`
   - Popis: Čím viac ľudí v rade, tým horšie skóre

### 4.2 Výpočet celkového skóre

Celkové skóre pre každý výťah sa vypočíta ako súčet všetkých faktorov:

```javascript
score =
  distanceFactor +
  queueFactor +
  busyFactor +
  peopleFactor +
  directionFactor +
  timeFactor +
  loadFactor;
```

Výťah s najnižším skóre je vybraný pre spracovanie požiadavky.

## 5. Používanie simulácie

### 5.1 Spustenie aplikácie

1. Nainštalujte závislosti:
   ```bash
   npm install
   ```
2. Spustite aplikáciu:
   ```bash
   npm start
   ```
3. Otvorte prehliadač na adrese `http://localhost:3000`

### 5.2 Pridávanie požiadaviek

1. Vyberte počiatočné poschodie v poli "Od poschodia"
2. Vyberte cieľové poschodie v poli "Na poschodie"
3. Zadajte počet ľudí (1-8)
4. Kliknite na tlačidlo "Pridať požiadavku"

### 5.3 Ovládanie simulácie

- **Spustiť simuláciu**: Kliknite na tlačidlo "Spustiť simuláciu"
- **Resetovať simuláciu**: Kliknite na tlačidlo "Resetovať simuláciu"
- **Pozastaviť simuláciu**: Zatvorte prehliadač alebo stlačte Ctrl+C v termináli

### 5.4 Sledovanie štatistík

Graf zobrazuje nasledujúce metriky:

1. Celkový počet požiadaviek (ks)
2. Priemerný čas čakania (s)
3. Počet čakajúcich požiadaviek (ks)
4. Celkový počet ľudí (osôb)

## 6. Optimalizácia a vylepšenia

### 6.1 Možné vylepšenia

1. Implementácia rôznych časových profilov (špička, mimošpička)
2. Pridanie prioritných požiadaviek
3. Optimalizácia energetickej náročnosti
4. Implementácia prediktívneho modelu zaťaženia
5. Pridanie možnosti nastavenia parametrov simulácie

### 6.2 Limity systému

1. Maximálna kapacita výťahu je obmedzená na 8 osôb
2. Simulácia neberie do úvahy čas potrebný na nastúpenie/vystúpenie
3. Výťahy sa pohybujú konštantnou rýchlosťou
4. Systém nepodporuje prepravu nákladu

## 7. Záver

Simulácia demonštruje efektívne využitie fuzzy logiky pre riadenie výťahového systému. Algoritmus zohľadňuje viacero faktorov pre optimalizáciu priradenia požiadaviek, čo vedie k lepšej distribúcii zaťaženia a kratším čakacím časom pre cestujúcich.

## 8. Referencie

1. React.js dokumentácia: https://reactjs.org/
2. D3.js dokumentácia: https://d3js.org/
3. Fuzzy Logic in Control Systems: Fuzzy Logic Controller, IEEE Transactions on Systems, Man, and Cybernetics
