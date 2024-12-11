import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// console.log("Displaying forest area chart for Brazil");

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

  // svg
  //   .append("text")
  //   .attr("x", width / 2)
  //   .attr("y", height / 2)
  //   .attr("text-anchor", "middle")
  //   .attr("font-size", 700) // Font size
  //   .attr("font-weight", "bold")
  //   .attr("fill", "#D6EFD9") // Light gray for subtlety
  //   // .attr("opacity", ) // Semi-transparent
  //   .text("Forest Area");


  // forest area value to scale the y-axis.
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
    .range(["#D1CFD9", "#9488B5", "#6C5F99"]); // Example: light to dark purple

  // // Line for the trendline
  // const line = d3
  //   .line()
  //   .x(d => x(d.Year) + x.bandwidth() / 2)
  //   .y(d => y(d["Forest area"]));

  // Axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));
    
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

 

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
    // .attr('fill', 'darkOrange');

  // Append the SVG element.
  const container = document.getElementById("container");
  container.append(svg.node());

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
     
    //  .attr(fill(#6C5F99, #6C5F99, [#6C5F99], [1]))
     
 })
 .on("mouseout", () => {
   d3.select("#tooltip").style("opacity", 0);
 });

// // Trendline
// svg
//  .append("path")
//  .datum(data)
//  .attr("fill", "none")
//  .attr("stroke", "#D6EFD9")
//  .attr("stroke-width", 2)
//  .attr("d", line);

  // Tooltip container
  d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("padding", "10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("opacity", 0);
}

function updateComparison(data) {
  // Get selected years
  const year1 = parseInt(d3.select("#year1").property("value"));
  const year2 = parseInt(d3.select("#year2").property("value"));

  // Check if the same year is selected
  if (year1 === year2) {
    d3.select("#comparison-text").text("Please select two different years for comparison.");
    return;
  }

  // Find the corresponding data points
  const dataYear1 = data.find(d => d.Year === year1);
  const dataYear2 = data.find(d => d.Year === year2);

  if (!dataYear1 || !dataYear2) {
    d3.select("#comparison-text").text("Data for the selected years is not available.");
    return;
  }

  // Calculate the difference
  const difference = Math.abs(dataYear1["Forest area"] - dataYear2["Forest area"]);

  // Display the comparison text
  d3.select("#comparison-text").text(
    `The difference in forest area between ${year1} and ${year2} is ${difference.toLocaleString()} sq. km.`
  );

  // Highlight bars for the selected years in the main chart
  d3.selectAll("rect")
    .attr("stroke", "none")
    .attr("stroke-width", 0);

  d3.selectAll("rect")
    .filter(d => d.Year === year1 || d.Year === year2)
    .attr("stroke", "#85F7A3")
    .attr("stroke-width", 2);

  // Draw the comparison chart
  drawComparisonChart([dataYear1, dataYear2]);
}

function drawComparisonChart(selectedData) {
  // Clear previous comparison chart
  d3.select("#comparison-container").html("");

  // Set dimensions
  const comparisonWidth = 400;
  const comparisonHeight = 300;

  // Create an SVG container for the comparison chart
  const svg = d3
    .select("#comparison-container")
    .append("svg")
    .attr("width", comparisonWidth)
    .attr("height", comparisonHeight);

  // Scales
  const x = d3
    .scaleBand()
    .domain(selectedData.map(d => d.Year))
    .range([50, comparisonWidth - 50])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(selectedData, d => d["Forest area"])])
    .range([comparisonHeight - 50, 50]);

  // Axes
  svg
    .append("g")
    .attr("transform", `translate(0,${comparisonHeight - 50})`)
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("transform", `translate(50,0)`)
    .call(d3.axisLeft(y));

  // Bars
  svg
    .selectAll("rect")
    .data(selectedData)
    .join("rect")
    .attr("x", d => x(d.Year))
    .attr("y", d => y(d["Forest area"]))
    .attr("width", x.bandwidth())
    .attr("height", d => comparisonHeight - 50 - y(d["Forest area"]))
    .attr("fill", "#D1CFD9");

  // Add labels for the data values
  svg
    .selectAll("text.value")
    .data(selectedData)
    .join("text")
    .attr("class", "value")
    .attr("x", d => x(d.Year) + x.bandwidth() / 2)
    .attr("y", d => y(d["Forest area"]) - 5)
    .attr("text-anchor", "middle")
    .text(d => `${d["Forest area"].toLocaleString()} sq. km`);
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


function resetChart() {
  d3.selectAll("rect").attr("stroke", "none").attr("stroke-width", 0);
  d3.select("#comparison-text").text("");
}

// Fetch data on page load
fetchData();
