import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const StatsChart = ({ elevators }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const data = elevators.map((elevator) => ({
      id: `E${elevator.id}`,
      processed: elevator.stats,
    }));

    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    d3.select(chartRef.current).select("svg").remove();

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.id))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.processed) || 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.id))
      .attr("y", (d) => y(d.processed))
      .attr("height", (d) => y(0) - y(d.processed))
      .attr("width", x.bandwidth());

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Výťahy");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Spracované požiadavky");
  }, [elevators]);

  return (
    <div>
      <h2>Štatistiky spracovaných požiadaviek</h2>
      <div ref={chartRef}></div>
    </div>
  );
};

export default StatsChart;
