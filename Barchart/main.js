import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("Displaying forest area chart for Brazil");

// Declare the chart dimensions and margins.
const width = 1250;
const height = 600;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 100;  // Increase the left margin to make space for the y-axis labels

async function fetchData() {
  const url = "./data.json"; // Path to your forest area data JSON
  let response = await fetch(url);

  if (response.ok) {
    let json = await response.json();
    console.log("Data received:", json);
    drawChart(json); // Draw the chart
    populateDropdowns(json); // Populate dropdowns
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function populateDropdowns(data) {
  const years = data.map(d => d.Year);

  const year1Dropdown = d3.select("#year1");
  const year2Dropdown = d3.select("#year2");

  // Populate both dropdowns with the same year options
  years.forEach(year => {
    year1Dropdown.append("option").attr("value", year).text(year);
    year2Dropdown.append("option").attr("value", year).text(year);
  });

  // Set default selections
  year1Dropdown.property("value", years[0]);
  year2Dropdown.property("value", years[1]);

  // Add event listeners to update the comparison
  year1Dropdown.on("change", () => updateComparison(data));
  year2Dropdown.on("change", () => updateComparison(data));
}

function updateComparison(data) {
  const year1 = +d3.select("#year1").property("value");
  const year2 = +d3.select("#year2").property("value");

  // Find data for the selected years
  const dataYear1 = data.find(d => d.Year === year1);
  const dataYear2 = data.find(d => d.Year === year2);

  if (dataYear1 && dataYear2) {
    const difference = Math.abs(dataYear1["Forest area"] - dataYear2["Forest area"]);
    const comparisonText = `
      In ${year1}, the forest area was ${dataYear1["Forest area"].toLocaleString()} sq. km.
      In ${year2}, it was ${dataYear2["Forest area"].toLocaleString()} sq. km.
      The difference is ${difference.toLocaleString()} sq. km.
    `;

    d3.select("#comparison-text").text(comparisonText);

    // Highlight the selected years in the chart
    d3.selectAll("rect")
      .attr("stroke", d => (d.Year === year1 || d.Year === year2 ? "red" : "none"))
      .attr("stroke-width", d => (d.Year === year1 || d.Year === year2 ? 2 : 0));
  }
}


function drawChart(data) {
  console.log("data:", data);
  

  // Create the SVG container.
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  // Find the maximum forest area value to scale the y-axis.
  const maxForestArea = d3.max(data, (d) => d["Forest area"]);

  const labels = data.map(item => item.Year); // Use Year as the label for x-axis.
  console.log(labels);

  // Declare the x (horizontal position) scale.
  const x = d3
    .scaleBand()
    .domain(labels)
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Declare the y (vertical position) scale.
  const y = d3
    .scaleLinear()
    .domain([0, maxForestArea])
    .range([height - marginBottom, marginTop]);

    const colorScale = d3
  .scaleLinear()
  .domain([d3.min(data, d => d["Forest area"]), d3.max(data, d => d["Forest area"])])
  .range(["#fcfbfd", "#a9a7cf", "#4b1687"]); // Example: light to dark purple

    //trendline
  const line = d3
  .line()
  .x((d) => x(d.Year) + x.bandwidth() / 2)
  .y((d) => y(d["Forest area"]));


  // Add the x-axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

  // Add the y-axis.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft}, 0)`)
    .call(d3.axisLeft(y));


  // Declare the bars for forest area.
    svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("fill", (d) => colorScale(d["Forest area"]))
    .attr("x", (d) => x(d.Year))
    .attr("y", (d) => y(d["Forest area"]))
    .attr("height", (d) => height - y(d["Forest area"]) - marginBottom)
    .attr("width", x.bandwidth())
    .on("mouseover", function (event, d) {
      const tooltip = d3.select("#tooltip")
        .style("opacity", 1)
        .html(`<strong>Year:</strong> ${d.Year}<br><strong>Forest Area:</strong> ${d["Forest area"].toLocaleString()} sq. km`)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("opacity", 0);
    });
    //line  
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("d", line);

  // Add a title.
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", marginTop - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Forest Area in Brazil (1990-2020)");

  // Add y-axis label.
  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("font-size", "12px")
    .attr("font-family", "sans-serif")
    .attr("x", 140)  // Adjust this to position the label further to the right
    .attr("y", 0)
    .attr("dy", ".75em")
    .text("Forest Area (sq. km)");


// Add tooltip container to your HTML
const tooltip = d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("padding", "5px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "5px")
  .style("opacity", 0);

    

  // Append the SVG element.
  const container = document.getElementById("container");
  container.append(svg.node());


  
}



fetchData();
