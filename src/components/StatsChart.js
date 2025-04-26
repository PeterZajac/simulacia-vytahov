import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Importujeme konštantu definovanú v App.js
import { REAL_TIME_FACTOR } from "../constants";

const StatsChart = ({ elevators }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Výpočet celkových štatistík
    const totalRequests = elevators.reduce(
      (sum, elevator) => sum + elevator.stats,
      0
    );
    const totalWaitTime = elevators.reduce(
      (sum, elevator) => sum + elevator.totalWaitTime,
      0
    );
    const avgWaitTime = totalRequests > 0 ? totalWaitTime / totalRequests : 0;
    const totalQueueLength = elevators.reduce(
      (sum, elevator) => sum + elevator.queue.length,
      0
    );
    const totalPeople = elevators.reduce(
      (sum, elevator) =>
        sum + elevator.queue.reduce((people, req) => people + req.people, 0),
      0
    );

    // Reálnejší prepočet času čakania
    // Priemerný čas čakania na výťah v realite je cca 20-60 sekúnd v závislosti od výšky budovy
    // Použijeme konverznú konštantu: simulačný čas * REAL_TIME_FACTOR = reálny čas
    const realAvgWaitTime = avgWaitTime * REAL_TIME_FACTOR;

    const data = [
      {
        name: "Celkový počet požiadaviek",
        value: totalRequests,
        unit: "ks",
      },
      {
        name: "Priemerný čas čakania",
        value: realAvgWaitTime.toFixed(1), // Bez násobenia 10 ako predtým
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
      .domain([0, d3.max(data, (d) => d.value)])
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
  }, [elevators]);

  return (
    <div>
      <h2>Analytika výťahového systému</h2>
      <div ref={chartRef}></div>
    </div>
  );
};

export default StatsChart;
