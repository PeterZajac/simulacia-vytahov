// Konštanty pre simuláciu výťahov
export const NUM_FLOORS = 10;
export const NUM_ELEVATORS = 3;
export const MAX_CAPACITY = 8;
export const ELEVATOR_SPEED = 1.5; // m/s - realistická rýchlosť výťahu
export const FLOOR_HEIGHT = 3; // m - výška poschodia
export const ELEVATOR_DOOR_TIME = 3; // s - čas na otvorenie dverí, nástup/výstup a zatvorenie dverí

// Konverzný faktor pre prepočet simulačného času na realistický
// Použije sa pre všetky algoritmy, aby sa zachovala konzistencia v porovnaní
export const REAL_TIME_FACTOR = 5; // simulačný čas * REAL_TIME_FACTOR = reálny čas
