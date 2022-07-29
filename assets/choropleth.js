const svg = d3.select("#ug_map"),
  width = svg.attr("width"),
  height = svg.attr("height"),
  data = d3.map(),
  ugMap = "./data/ug_districts3.geojson",
  dataLoc = "./data/UgElections1.csv";

// style of geographic projection and scaling
const projection = d3
  .geoRobinson()
  .center([32.8269, 1.3795])
  .scale(4000)
  .translate([width / 1.4, height / 2]);

// Define color scale
const colorScale = d3
  .scaleThreshold()
  .domain([1000, 10000, 50000, 100000, 200000, 500000])
  .range(d3.schemeOrRd[7]);

// add tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

//Load external data and boot
d3.queue()
  .defer(d3.json, ugMap)
  .defer(d3.csv, dataLoc, function (d) {
    data.set(d.DISTRICT, d);
  })
  .await(ready);

const plotPieChart = function (d) {
  const info = data.get(d.properties.dist);
console.log(info)
  // clear prev title and chart
  document.getElementById("pie-title").innerHTML = "";
  document.getElementById("candidate_pieChart").innerHTML = "";

  // add new title
  document.getElementById("pie-title").innerHTML = info.DISTRICT + ' District';

  // render new chart
  renderPieChart(info, "candidate_pieChart");
};

// ----------------------------
//Start of Choropleth drawing
// ----------------------------

function ready(error, mydata) {


  let mouseOver = function (d) {
    const info = data.get(d.properties.dist);
    // console.log(info);
    d3.selectAll(".district")
      .transition()
      .duration(200)
      .style("opacity", 0.5)
      .style("stroke", "transparent");
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black");

    tooltip
      .style("left", d3.event.pageX + 15 + "px")
      .style("top", d3.event.pageY - 28 + "px")
      .transition()
      .duration(400)
      .style("opacity", 1)
      // .select(this)
      // .attr("data-html", "true")
      // .attr("title", tooltipText)
      // .select(this).html(function(){
      //   return District ${d.properties.dist} + "<br> line 2: this is line 2"
      //   })
      .text(
        `District ${d.properties.dist}` +
        ` Valid Votes ${(parseInt(info.Valid_Votes)/parseInt(info.RegVoters)*100).toFixed(2)}%`+
        ` Inalid Votes ${(parseInt(info.Invalid_votes)/parseInt(info.RegVoters)*100).toFixed(2)}%`+
        ` Didn't Vote ${(parseInt(info.Didnot_Vote)/parseInt(info.RegVoters)*100).toFixed(2)}%`
        )
      ;
  };


  let mouseLeave = function () {
    d3.selectAll(".district")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "transparent");
    tooltip.transition().duration(300).style("opacity", 0);
  };

  // Draw the map
  const ugCountry = svg.append("g").attr("class", "uganda");

  ugCountry
    .selectAll("path")
    .data(mydata.features)
    .enter()
    .append("path")
    // draw each district
     .attr("d", d3.geoPath().projection(projection))

    //retrieve the name of the district from data
    .attr("data-name", function (d) {
      return d.properties.name;
    })

    // set the color of each district
    .attr("fill", function (d) {
      const info = data.get(d.properties.dist);
      return colorScale(info.Valid_Votes);
    })

    // add a class, styling and mouseover/mouseleave and click functions
    .style("stroke", "transparent")
    .attr("class", function (d) {
      return "district";
    })
    .attr("id", function (d) {
      return d.id;
    })
    .style("opacity", 1)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)
    .on("click", plotPieChart);

  // Legend
  const x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

  const legend = svg.append("g").attr("id", "legend");

  const legend_entry = legend
    .selectAll("g.legend")
    .data(
      colorScale.range().map(function (d) {
        d = colorScale.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter()
    .append("g")
    .attr("class", "legend_entry");

  const ls_w = 20,
    ls_h = 20;

  legend_entry
    .append("rect")
    .attr("x", 20)
    .attr("y", function (d, i) {
      return height - i * ls_h - 2 * ls_h;
    })
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function (d) {
      return colorScale(d[0]);
    })
    .style("opacity", 0.8);

  legend_entry
    .append("text")
    .attr("x", 50)
    .attr("y", function (d, i) {
      return height - i * ls_h - ls_h - 6;
    })
    .text(function (d, i) {
      if (i === 0) return "< " + d[1] / 1000 + "k";
      if (d[1] < d[0]) return d[0] / 1000 + "k +";
      return d[0] / 1000 + "k - " + d[1] / 1000 + "k";
    });

  legend
    .append("text")
    .attr("x", 15)
    .attr("y", 280)
    .text("Valid Votes (Thousands)");
}