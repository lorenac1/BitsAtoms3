import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("Displaying forest area chart for Brazil");

// Declare the chart dimensions and margins.
const width = 1250;
const height = 600;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 100; // Increased for y-axis labels

async function fetchData() {
  const url = "./data.json"; // Path to your forest area data JSON
  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);

    const json = await response.json();
    console.log("Data received:", json);

    drawChart(json); // Draw the chart
    createYearSelectors(json); // Initialize dropdowns and buttons
  } catch (error) {
    alert(error.message);
  }
}

function drawChart(data) {
  console.log("Data:", data);


  
  // Create the SVG container.
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  // Find the maximum forest area value to scale the y-axis.
  const maxForestArea = d3.max(data, (d) => d["Forest area"]);

  // Scales
  const x = d3
    .scaleBand()
    .domain(data.map(d => d.Year))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, maxForestArea])
    .range([height - marginBottom, marginTop]);

  const colorScale = d3
    .scaleLinear()
    .domain([d3.min(data, d => d["Forest area"]), maxForestArea])
    .range(["#3f007d", "#a9a7cf", "#4b1687 "]); // Example: light to dark purple


  // Line for the trendline
  const line = d3
    .line()
    .x(d => x(d.Year) + x.bandwidth() / 2)
    .y(d => y(d["Forest area"]));

  // Axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));
    

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

  // Bars
  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("fill", d => colorScale(d["Forest area"]))
    .attr("x", d => x(d.Year))
    .attr("y", d => y(d["Forest area"]))
    .attr("height", d => height - marginBottom - y(d["Forest area"]))
    .attr("width", x.bandwidth())
    .on("mouseover", (event, d) => {
      const tooltip = d3.select("#tooltip")
        .style("opacity", 1)
        .html(`<strong>Year:</strong> ${d.Year}<br><strong>Forest Area:</strong> ${d["Forest area"].toLocaleString()} sq. km`)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("opacity", 0);
    });

    

  // Trendline
  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", marginTop - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    // .text("Forest Area in Brazil (1990-2020)");

  // Y-axis label
  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("font-size", "12px")
    .attr("font-family", "sans-serif")
    .attr("x", 140)
    .attr("y", 0)
    .attr("dy", ".75em")
    .text("Forest Area (sq. km)");

  // Append the SVG element.
  const container = document.getElementById("container");
  container.append(svg.node());

  // Tooltip container
  d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("opacity", 0);
}

function createYearSelectors(data) {
  const yearOptions = data.map(d => d.Year);

  // Populate year selectors
  const year1Select = d3.select("#year1");
  const year2Select = d3.select("#year2");

  yearOptions.forEach(year => {
    year1Select.append("option").text(year).attr("value", year);
    year2Select.append("option").text(year).attr("value", year);
  });

  // Set default selections
  year1Select.property("value", yearOptions[0]);
  year2Select.property("value", yearOptions[1]);

  // Add event listeners
  d3.select("#compare-button").on("click", () => updateComparison(data));
  d3.select("#reset-button").on("click", resetChart);
}

function updateComparison(data) {
  const year1 = +d3.select("#year1").property("value");
  const year2 = +d3.select("#year2").property("value");

  const dataYear1 = data.find(d => d.Year === year1);
  const dataYear2 = data.find(d => d.Year === year2);

  if (dataYear1 && dataYear2) {
    const forestArea1 = dataYear1["Forest area"];
    const forestArea2 = dataYear2["Forest area"];
    const difference = Math.abs(forestArea1 - forestArea2);
    const decreasePercentage = ((forestArea1 - forestArea2) / forestArea1) * 100;

    const comparisonText = `
      In ${year1}, the forest area was ${forestArea1.toLocaleString()} sq. km.
      In ${year2}, it was ${forestArea2.toLocaleString()} sq. km.
      The difference is ${difference.toLocaleString()} sq. km.
      ${
        forestArea1 > forestArea2
          ? `The forest area decreased by ${decreasePercentage.toFixed(2)}%.`
          : "No significant decrease."
      }
    `;

    d3.select("#comparison-text").text(comparisonText);

    // Highlight selected years
    d3.selectAll("rect")
      .attr("stroke", d => (d.Year === year1 || d.Year === year2 ? "fuchsia" : "none"))
      .attr("stroke-width", d => (d.Year === year1 || d.Year === year2 ? 2 : 0));
  }
}

function resetChart() {
  d3.selectAll("rect").attr("stroke", "none").attr("stroke-width", 0);
  d3.select("#comparison-text").text("");
}

// Fetch data on page load
fetchData();
