import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Dimensions for the SVG and map
const width = 800;
const height = 600;

// Load GeoJSON data
async function fetchData() {
  const geoJsonUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

  const geoJson = await d3.json(geoJsonUrl);
  renderMap(geoJson);
}

// Render Brazil map
function renderMap(geoJson) {
  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select(".tooltip");

  // Initial projection and path generator
  let projection = d3.geoMercator().fitSize([width, height], geoJson);
  let path = d3.geoPath().projection(projection);

  // Draw initial map
  const map = svg
    .selectAll("path")
    .data(geoJson.features)
    .join("path")
    .attr("d", path)
    .attr("fill", "lightgrey")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  // Slider setup
  const yearRange = d3.select("#yearRange");
  const currentYearLabel = d3.select("#currentYear");

  // Scale for map size control (1 = full size, 0.3 = smallest)
  const sizeScale = d3.scaleLinear()
    .domain([1990, 2020])
    .range([0.5, 0.1]);

  function updateMapSize(year) {
    const sizeFactor = sizeScale(year);

    // Recompute projection based on the new size
    projection = d3.geoMercator()
      .fitSize([width * sizeFactor, height * sizeFactor], geoJson)
      .translate([width / 2 + 200, height / 2]); // +150px for the x-axis


    path = d3.geoPath().projection(projection);

    // Update map shapes with smooth transition
    map.transition()
      .duration(1000)
      .attr("d", path);

    // Update the current year label
    currentYearLabel.text(year);
  }

  // Initialize slider behavior
  yearRange.on("input", function () {
    const selectedYear = +this.value;
    updateMapSize(selectedYear);
  });

  // Set initial year and render map
  const initialYear = +yearRange.property("value");
  updateMapSize(initialYear);
}

// Fetch data and render the map
fetchData();
