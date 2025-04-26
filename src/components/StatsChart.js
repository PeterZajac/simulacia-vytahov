import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Importujeme konštantu definovanú v App.js

const StatsChart = ({ elevators = [], stats = {} }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Zabezpečíme, že elevators je pole
    const safeElevators = Array.isArray(elevators) ? elevators : [];

    // Výpočet celkových štatistík s ochranou pred chýbajúcimi hodnotami
    const totalRequests = safeElevators.reduce(
      (sum, elevator) => sum + (elevator.stats || 0),
      0
    );
    const totalWaitTime = safeElevators.reduce(
      (sum, elevator) => sum + (elevator.totalWaitTime || 0),
      0
    );

    // Priemerný čas čakania berieme priamo zo stats pre konzistenciu s ComparisonStats
    let avgWaitTime = 0;

    if (stats && stats.fuzzy && typeof stats.fuzzy.avgWaitTime === "number") {
      // Ak máme platné stats, použijeme hodnotu z nich
      avgWaitTime = stats.fuzzy.avgWaitTime;
    } else if (totalRequests > 0) {
      // Ak nemáme stats, použijeme vlastný výpočet (len ako fallback)
      avgWaitTime = totalWaitTime / totalRequests;
    }

    const totalQueueLength = safeElevators.reduce(
      (sum, elevator) =>
        sum + (Array.isArray(elevator.queue) ? elevator.queue.length : 0),
      0
    );
    const totalPeople = safeElevators.reduce(
      (sum, elevator) =>
        sum +
        (Array.isArray(elevator.queue)
          ? elevator.queue.reduce(
              (people, req) => people + (req?.people || 0),
              0
            )
          : 0),
      0
    );

    // REÁLNE HODNOTY - už neaplikujeme REAL_TIME_FACTOR
    // pretože hodnota avgWaitTime už obsahuje REAL_TIME_FACTOR
    const realAvgWaitTime = avgWaitTime;

    const data = [
      {
        name: "Celkový počet požiadaviek",
        value: totalRequests,
        unit: "ks",
      },
      {
        name: "Priemerný čas čakania",
        value: realAvgWaitTime.toFixed(1),
        unit: "s",
      },
      {
        name: "Počet čakajúcich požiadaviek",
        value: totalQueueLength,
        unit: "ks",
      },
      {
        name: "Celkový počet ľudí",
        value: totalPeople,
        unit: "osôb",
      },
    ];

    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 200 };

    d3.select(chartRef.current).select("svg").remove();

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 1]) // Ochrana pred prázdnymi dátami
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    // Pridanie osí
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Pridanie stĺpcov
    svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", margin.left)
      .attr("y", (d) => y(d.name))
      .attr("width", (d) => x(d.value) - margin.left)
      .attr("height", y.bandwidth());

    // Pridanie hodnôt nad stĺpce
    svg
      .append("g")
      .attr("fill", "black")
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("x", (d) => x(d.value) - 5)
      .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .text((d) => `${d.value} ${d.unit}`);

    // Pridanie popisov osí
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Hodnoty");

    // Pridanie nadpisu
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Celkové štatistiky výťahového systému");
  }, [elevators, stats]);

  return (
    <div>
      <h2>Analytika výťahového systému</h2>
      <div ref={chartRef}></div>
    </div>
  );
};

export default StatsChart;
