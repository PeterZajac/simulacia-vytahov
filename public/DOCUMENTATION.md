# Dokumentácia simulácie výťahového systému s fuzzy logikou

Bakalárska práca
Názov práce: SIMULÁCIA DOPRAVNÉHO SYSTÉMU S INTERAKTÍVNYM VIZUÁLNYM ROZHRANÍM
Autor: Peter Zajac
Škola: PEVŠ
Rok: 2025

## 1. Úvod

Tento dokument popisuje implementáciu a používanie simulácie výťahového systému s fuzzy logikou. Simulácia je navrhnutá tak, aby demonštrovala efektívne riadenie viacerých výťahov pomocou pokročilých algoritmov priradenia požiadaviek.

## 2. Technické špecifikácie

### 2.1 Základné parametre systému

- Počet poschodí: 10
- Počet výťahov: 3
- Maximálna kapacita výťahu: 8 osôb
- Rýchlosť výťahu: 1.5 m/s
- Výška poschodia: 3 m
- Čas na otvorenie a zatvorenie dverí: 3 s
- Realistický faktor času (REAL_TIME_FACTOR): 0.5

### 2.2 Technológie

- React.js pre frontend
- D3.js pre vizualizáciu dát
- JavaScript pre implementáciu fuzzy logiky

## 3. Architektúra systému

### 3.1 Hlavné komponenty

1. **App.js** - Hlavná komponenta aplikácie

   - Riadi stav simulácie a životný cyklus výťahov
   - Inicializácia a správa stavov výťahov a požiadaviek
   - Spracovanie a priradenie požiadaviek pomocou algoritmov
   - Animácia pohybu výťahov a aktualizácia ich stavu
   - Spracovanie štatistík a metrík pre všetky algoritmy (Fuzzy, FIFO, Round Robin)
   - Implementuje frontový režim pre hromadné spracovanie požiadaviek
   - Umožňuje reset simulácie a automatický návrat výťahov do základných pozícií

2. **Building.js** - Vizuálna reprezentácia budovy

   - Zobrazuje poschodia a šachty výťahov
   - Animuje pohyb výťahov medzi poschodiami
   - Zobrazuje aktuálny stav výťahov (voľný/zaneprázdnený)
   - Ukazuje smer pohybu a cieľ výťahu
   - Zobrazuje skóre výťahu (pre Fuzzy algoritmus)
   - Integruje ovládacie panely na poschodiach (FloorPanel)

3. **FloorPanel.js** - Ovládací panel na poschodí

   - Umožňuje volať výťah z každého poschodia
   - Nastavovanie počtu osôb a cieľového poschodia
   - Validácia vstupných parametrov

4. **RequestForm.js** - Formulár pre pridávanie požiadaviek

   - Umožňuje zadať parametre novej požiadavky (poschodie, cieľ, počet osôb)
   - Validuje vstupné dáta
   - Odosiela požiadavky na spracovanie hlavnej komponente

5. **RequestList.js** - Zoznam aktuálnych požiadaviek

   - Zobrazuje zoznam požiadaviek vo fronte pre každý výťah
   - Zobrazuje čakajúce požiadavky v režime fronty

6. **StatsChart.js** - Grafická reprezentácia štatistík

   - Vizualizuje celkové štatistiky systému pomocou D3.js
   - Zobrazuje počet požiadaviek, priemerný čas čakania a ďalšie metriky
   - Aktualizuje sa v reálnom čase na základe prevádzky výťahov
   - Používa hodnoty z comparisonStats pre konzistentný priemerný čas čakania

7. **ComparisonStats.js** - Porovnávacie štatistiky algoritmov

   - Zobrazuje tabuľku s porovnaním algoritmu Fuzzy logiky s FIFO a Round Robin
   - Umožňuje zapnúť/vypnúť zobrazenie jednotlivých algoritmov
   - Zobrazuje priemerný čas čakania a počet požiadaviek pre každý algoritmus

8. **DecisionFactors.js** - Detaily rozhodovania Fuzzy logiky

   - Zobrazuje faktory, ktoré ovplyvnili výber výťahu pri poslednej požiadavke
   - Zobrazuje skóre pre každý výťah a faktor

9. **SimulationInfo.js** - Informácie o simulácii
   - Poskytuje návod na používanie simulácie
   - Vysvetľuje funkcionality a algoritmy

### 3.2 Utilities

1. **elevatorControllers.js** - Algoritmy pre priradenie výťahov
   - Implementácia Fuzzy logiky pre priradenie výťahu
   - Implementácia FIFO (First In, First Out) algoritmu
   - Implementácia Round Robin algoritmu
   - Výpočet rôznych faktorov pre Fuzzy logiku

### 3.3 Štruktúra dát

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
  lastRequestTime: number,       // Čas poslednej požiadavky
  currentScore: number,          // Aktuálne fuzzy skóre
  totalTravelDistance: number,   // Celková prejdená vzdialenosť
  totalPassengers: number        // Celkový počet prepravených pasažierov
}
```

#### Porovnávacie štatistiky (ComparisonStats)

```javascript
{
  fuzzy: {
    totalWaitTime: number,     // Celkový čas čakania pre Fuzzy
    totalRequests: number,     // Celkový počet požiadaviek pre Fuzzy
    avgWaitTime: number        // Priemerný čas čakania pre Fuzzy
  },
  fifo: {
    totalWaitTime: number,     // Celkový čas čakania pre FIFO
    totalRequests: number,     // Celkový počet požiadaviek pre FIFO
    avgWaitTime: number        // Priemerný čas čakania pre FIFO
  },
  roundRobin: {
    totalWaitTime: number,     // Celkový čas čakania pre Round Robin
    totalRequests: number,     // Celkový počet požiadaviek pre Round Robin
    avgWaitTime: number        // Priemerný čas čakania pre Round Robin
  }
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

## 5. Hlavné funkcionality v App.js

### 5.1 Spracovanie požiadaviek

- **handleAddRequest** - spracováva pridanie novej požiadavky

  - Validuje požiadavku (počet osôb, poschodia)
  - V režime fronty ukladá požiadavky do zoznamu pre neskoršie spracovanie
  - Mimo režimu fronty priamo priradí požiadavku výťahu pomocou Fuzzy logiky
  - Aktualizuje štatistiky pre Fuzzy, FIFO a Round Robin

- **processNextRequest** - spracováva ďalšiu požiadavku vo fronte výťahu
  - Animuje pohyb výťahu na poschodie nástupu
  - Simuluje nastupovanie a vystupovanie (čakanie)
  - Aktualizuje štatistiky po dokončení
  - Rekurzívne spracováva ďalšie požiadavky vo fronte

### 5.2 Režim fronty

- **toggleQueueMode** - prepína medzi priamym priradením a frontovým režimom
- **startQueuedRequests** - spúšťa spracovanie nahromadených požiadaviek vo fronte
  - Postupne spracováva každú požiadavku
  - Aktualizuje štatistiky pre všetky algoritmy
  - Zabezpečuje správne plánovanie priradenia výťahov

### 5.3 Pohyb výťahov

- **animateElevatorMovement** - zabezpečuje animáciu pohybu výťahu medzi poschodiami
  - Postupne aktualizuje aktuálne poschodie výťahu
  - Počíta celkovú prejdenú vzdialenosť pre štatistiky

### 5.4 Optimalizácia

- Automatické vracanie výťahov do optimálnych východiskových pozícií
- Ochrana pred chybovými stavmi a spracovanie hraničných prípadov
- Konzistentné výpočty štatistík pre všetky algoritmy

## 6. Používanie simulácie

### 6.1 Spustenie aplikácie

1. Nainštalujte závislosti:
   ```bash
   npm install
   ```
2. Spustite aplikáciu:
   ```bash
   npm start
   ```
3. Otvorte prehliadač na adrese `http://localhost:3000`

### 6.2 Pridávanie požiadaviek

1. Vyberte počiatočné poschodie v poli "Od poschodia"
2. Vyberte cieľové poschodie v poli "Na poschodie"
3. Zadajte počet ľudí (1-8)
4. Kliknite na tlačidlo "Pridať požiadavku"

Alebo:

1. Na ľubovoľnom poschodí v budove kliknite na ovládací panel
2. Nastavte počet ľudí pomocou tlačidiel +/-
3. Vyberte cieľové poschodie
4. Kliknite na tlačidlo "Privolať"

### 6.3 Ovládanie simulácie

- **Režim fronty**: Zapnite prepínač "Pridávať do fronty" pre zhromaždenie viacerých požiadaviek
- **Spustiť frontu**: Kliknite na tlačidlo "Spustiť frontu" pre spustenie nahromadených požiadaviek
- **Resetovať simuláciu**: Kliknite na tlačidlo "Resetovať simuláciu" pre obnovenie počiatočného stavu

### 6.4 Sledovanie štatistík

- **Porovnávacie štatistiky** - zobrazujú priemerný čas čakania pre každý algoritmus
- **Graf štatistík** - zobrazuje kľúčové metriky výťahového systému:
  1. Celkový počet požiadaviek (ks)
  2. Priemerný čas čakania (s)
  3. Počet čakajúcich požiadaviek (ks)
  4. Celkový počet ľudí (osôb)

## 7. Záver

Simulácia demonštruje efektívne využitie fuzzy logiky na základe skóre, pre riadenie výťahového systému. Algoritmus zohľadňuje viacero faktorov pre optimalizáciu priradenia požiadaviek, čo vedie k lepšej distribúcii zaťaženia a kratším čakacím časom pre cestujúcich. Porovnanie s jednoduchšími algoritmami FIFO a Round Robin ukazuje výhody inteligentného rozhodovania pri riadení výťahov.
