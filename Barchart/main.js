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
    // If HTTP status is 200-299
    let json = await response.json();
    console.log("Data received:", json);
    drawChart(json); // Use the entire dataset
  } else {
    alert("HTTP-Error: " + response.status);
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
    .selectAll()
    .data(data)
    .join("rect")
    // .attr("fill", "green") // Bar color for forest area
    .attr("x", (d) => x(d.Year)) // x position based on Year
    .attr("y", (d) => y(d["Forest area"])) // y position based on Forest area
    .attr("height", (d) => height - y(d["Forest area"]) - marginBottom) // bar height
    .attr("width", x.bandwidth()); // bar width

    const colorScale = d3
  .scaleLinear()
  .domain([d3.min(data, d => d["Forest area"]), d3.max(data, d => d["Forest area"])])
  .range(["violet", "pink"]);

svg
  .append("g")
  .selectAll("rect")
  .data(data)
  .join("rect")
  .attr("fill", (d) => colorScale(d["Forest area"]))
  .attr("x", (d) => x(d.Year))
  .attr("y", (d) => y(d["Forest area"]))
  .attr("height", (d) => height - y(d["Forest area"]) - marginBottom)
  .attr("width", x.bandwidth());


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

    const line = d3
  .line()
  .x((d) => x(d.Year) + x.bandwidth() / 2)
  .y((d) => y(d["Forest area"]));

svg
  .append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 2)
  .attr("d", line);

  // svg
  // .append("g")
  // .selectAll("rect")
  // .data(data)
  // .join("rect")
  // .attr("x", (d) => x(d.Year))
  // .attr("y", height - marginBottom)
  // .attr("height", 0)
  // .attr("width", x.bandwidth())
  // .transition()
  // .duration(1000)
  // .attr("y", (d) => y(d["Forest area"]))
  // .attr("height", (d) => height - y(d["Forest area"]) - marginBottom)
  // .attr("fill", "brown");



    

  // Append the SVG element.
  const container = document.getElementById("container");
  container.append(svg.node());
}

fetchData();
