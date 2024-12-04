import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("Displaying simple bar chart");

// Declare the chart dimensions and margins.
const width = 1250;
const height = 600;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

async function fetchData() {
  const url = "./csvjson.json"; // data from https://opendata.swiss/en/dataset/treibhausgasemissionen-im-kanton-zurich
  let response = await fetch(url);

  if (response.ok) {
    // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await response.json();
    console.log("Finally received the response:");
   // const filteredData = filterData(json);
    drawChart(json.slice(0, 10));
  } else {
    alert("HTTP-Error: " + response.status);
  }
}
// das weg nehmen
// function filterData(data) {
//   return data.filter(
//     (item) => item.thg === "CO2" && item.untergruppe === "Abfallverbrennung"
//   );
// }

function drawChart(data) {
  console.log("data: ", data);

  // Create the SVG container.
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const maxEmission_transport = d3.max(data, (d) => d.food_emissions_transport);
  const maxEmission_farm = d3.max(data, (d) => d.food_emissions_farm);

  const labels = data.map(item => {
    console.log(item)
    return item.Entity})
  console.log(labels);

  // Declare the x (horizontal position) scale.
  const x = d3
  .scaleBand()
  .domain(labels)
  .range([marginLeft, width - marginRight])
  .padding(0.2)


  // Declare the y (vertical position) scale.
  const y = d3
    .scaleLinear()
    .domain([0, maxEmission_farm])
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


    /*function doSomething (){
    return "green"}*/

  // Declare the bars
  svg
    .append("g")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("fill", "blue") //instead of "blue" give a name to this function
    .attr("x", (d) => x(d.Entity)) //arrowfunction: =>
    .attr("y", (d) => y(d.food_emissions_farm))
    .attr("height", (d) => height - y(d.food_emissions_farm) - marginBottom)
    .attr("width", x.bandwidth()); //you can also calculate by hand 1200/data.lenght-10

    svg
    .append("g")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("fill", "orange") //instead of "blue" give a name to this function
    .attr("x", (d) => x(d.Entity)) //arrowfunction: =>
    .attr("y", (d) => y(d.food_emissions_transport))
    .attr("height", (d) => height - y(d.food_emissions_transport) - marginBottom)
    .attr("width", 
      x.bandwidth()/2); //you can also calculate by hand 1200/data.lenght-10

    /* const myName = 'Lorena';
    const myString = 'My name is' + myName;
    console.log("myString", mystring) */

  // Add y-axis label
  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("font-size", "10px")
    .attr("font-family", "sans-serif")
    .attr("x", 140)
    .attr("y", 0)
    .attr("dy", ".75em")
    .text("Emissions CO2 (tons per year)");

  // Append the SVG element.
  const container = document.getElementById("container");
  container.append(svg.node());
}

fetchData();