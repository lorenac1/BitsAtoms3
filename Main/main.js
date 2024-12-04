import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Dimensions for the SVG and map
const width = 800;
const height = 600;

// Load GeoJSON and forest data
async function fetchData() {
  const geoJsonUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";
  const dataUrl = "./data.json"; // Update this path to your actual JSON file

  const [geoJson, forestData] = await Promise.all([
    d3.json(geoJsonUrl),
    d3.json(dataUrl)
  ]);

  renderMap(geoJson, forestData);
}

// Render Brazil map
function renderMap(geoJson, forestData) {
  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const projection = d3.geoMercator().fitSize([width, height], geoJson);
  const path = d3.geoPath().projection(projection);

  // Color scale for forest area
  const forestScale = d3
    .scaleSequential(d3.interpolateGreens)
    .domain(d3.extent(forestData, (d) => d["Forest area"]));

  const tooltip = d3.select(".tooltip");

  // Draw the map
  svg
    .selectAll("path")
    .data(geoJson.features)
    .join("path")
    .attr("d", path)
    .attr("fill", "lightgrey")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  // Interactive slider for year selection
  const yearRange = d3.select("#yearRange");
  const currentYear = d3.select("#currentYear");

  function updateMap(year) {
    const yearData = forestData.find((d) => d.Year === year);
    const forestArea = yearData ? yearData["Forest area"] : 0;

    // Update fill color based on forest area
    svg
      .selectAll("path")
      .attr("fill", (d) => (forestArea ? forestScale(forestArea) : "lightgrey"));

    // Show tooltip
    svg
      .selectAll("path")
      .on("mousemove", (event, d) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")
          .style("display", "block")
          .html(
            `<strong>Year:</strong> ${year}<br><strong>Forest Area:</strong> ${forestArea.toLocaleString()} sq km`
          );
      })
      .on("mouseleave", () => {
        tooltip.style("display", "none");
      });
  }

  // Handle year change
  yearRange.on("input", function () {
    const selectedYear = +this.value;
    currentYear.text(selectedYear);
    updateMap(selectedYear);
  });

  // Initialize map for the first year
  updateMap(+yearRange.property("value"));
}

// Fetch data and render the map
fetchData();
