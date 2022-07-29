//set the dimensions and margins of the barcharts
const margin = {top: 20, right: 30, bottom: 40, left: 100},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom
c_width = 800 - margin.left - margin.right,
    c_height = 400 - margin.top - margin.bottom
;

const candidates_barChart = d3.select("#c_barChart")
.append("svg")
 .attr("width", c_width + margin.left + margin.right)
 .attr("height", c_height + margin.top + margin.bottom)
.append("g")
 .attr("transform", `translate(${150}, ${margin.top})`);

// append to top districts div
const district_top_svg = d3.select("#top_e_barChart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// append to worst districts div
const district_worst_svg = d3.select("#worst_e_barChart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parse the Data
d3.csv("./data/UgElections1.csv").then( function(data) {

// Get every column value
var elements = Object.keys(data[0])
.filter(function(d){
return ((d != "DISTRICT") & (d != "DISTRICT_ID") & (d != "RegVoters") & (d != "Valid_Votes") & (d != "Invalid_votes") & (d != "Total_Votes") & (d != "Received_Stations") & (d != "Total_Stations") & (d != "not_counted_votes") & (d != "Didnot_Vote") & (d != "Not_Received_Stations")
);
});


var selection = "";

let allCandidateTotals = [];
elements.forEach(function(item, index) {
    allCandidateTotals.push([item,d3.sum(data, d => +d[item])]);
});

// arrange bars by results
allCandidateTotals
.sort(function(a,b){
   return b[1] - a[1];
});

// Add X axis for candidates
const x_all_c = d3.scaleLinear()
    .domain([0,  allCandidateTotals[0][1]])
    .range([ 0, c_width]);
    
candidates_barChart.append("g")
    .attr("transform", `translate(0, ${c_height})`)
    // .call(d3.axisBottom(x_all_c))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis or candidates
const y_all_c = d3.scaleBand()
   .range([ 0, c_height ])
   .domain(allCandidateTotals.map(d => d[0]))
   .padding(.4);
candidates_barChart.append("g")
   .call(d3.axisLeft(y_all_c));

//Bar All candidates
var bar_all_candidates = candidates_barChart.selectAll("myRect")
.data(allCandidateTotals)
.join("rect")
.attr("x", x_all_c(0) )
.attr("y", d => y_all_c(d[0]))
.attr("width", d => x_all_c(d[1]/1.2))
.attr("height", y_all_c.bandwidth())
.attr("fill", "transparent")
.attr("stroke", "#000")
.append("title")
.text(function(d){
return d[0] + " : " + parseInt(d[1]).toLocaleString('en');
})


// ON DROPDOWNSELECT update best and worst barcharts
//===================================================

const plot_TW_BarCharts = function (d) {

  // clear prev title and barcharts
    district_top_svg.selectAll("*").remove();
    district_worst_svg.selectAll("*").remove();
  

  // add new title
  document.getElementById("candidate-title").innerHTML = selection;

  // render new chart
  update(selection);
};

d3.select("#candidateSelector")
    .on("change", function(event,d) {
        
        const selectedOption = d3.select(this)
        .property("value")
        selection = selectedOption;
        plot_TW_BarCharts(d)

    })

//================================================
// Update best and worst districts for candidate
//================================================

function update(selectedGroup) {

    // GET BEST DISTRICTS FOR CANDIDATES
    //============================================

    // generate top district data
    let top5DistrictsbyCandidate = [];
    data.forEach(function(item, index) {
        top5DistrictsbyCandidate
        .push([item.DISTRICT,+item[selectedGroup]]);
    });

    top5DistrictsbyCandidate
    .sort(function(a,b){
       return b[1] - a[1];
    })
    top5DistrictsbyCandidate = top5DistrictsbyCandidate.splice(0, 5);


    // Add X axis for top districts
    const td_x = d3.scaleLinear()
        .domain([0,  top5DistrictsbyCandidate[0][1]])
        .range([ 0, width]);

        district_top_svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        // .call(d3.axisBottom(x_all_c))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

      // Y axis for top districts
    const td_y = d3.scaleBand()
       .range([ 0, height ])
       .domain(top5DistrictsbyCandidate.map(d => d[0]))
       .padding(.2);

       district_top_svg.append("g")
       .call(d3.axisLeft(td_y));

    //Bar for top candidate top districts
    var bar_wd_candidate = district_top_svg.selectAll("myRect")
        .data(top5DistrictsbyCandidate)
        .join("rect")
        .attr("x", td_x(0) )
        .attr("y", d => td_y(d[0]))
        .attr("width", d => td_x(d[1]))
        .attr("height", td_y.bandwidth())
        .attr("fill", "transparent")
        .attr("stroke", "#000")
        .append("title")
        .text(function(d){
        return d[0] + " : " + parseInt(d[1]).toLocaleString('en');
        })


    // GET WORST DISTRICTS FOR CANDIDATES
    //============================================

    // generate worst district data
    let worst5DistrictsbyCandidate = [];
    data.forEach(function(item, index) {
        worst5DistrictsbyCandidate
        .push([item.DISTRICT,+item[selectedGroup]]);
    });

    worst5DistrictsbyCandidate
    .sort(function(a,b){
       return b[1] - a[1];
    })

    // console.log(worst5DistrictsbyCandidate)
    worst5DistrictsbyCandidate = worst5DistrictsbyCandidate.slice(1).slice(-5);

    worst5DistrictsbyCandidate
    .sort(function(a,b){
      return a[1] - b[1];
    })

// console.log(worst5DistrictsbyCandidate)
    // Add X axis for worst districts
    const wd_x = d3.scaleLinear()
        .domain([0,  worst5DistrictsbyCandidate[0][1]])
        .range([ 0, width/100]);
        district_worst_svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        // .call(d3.axisBottom(x_all_c))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

      // Y axis for worst districts
    const wd_y = d3.scaleBand()
       .range([ 0, height ])
       .domain(worst5DistrictsbyCandidate.map(d => d[0]))
       .padding(.2);
       district_worst_svg.append("g")
       .call(d3.axisLeft(wd_y));

    //Bar for word candidate top districts
    var bar_wd_candidate = district_worst_svg.selectAll("myRect")
        .data(worst5DistrictsbyCandidate)
        .join("rect")
        .attr("x", wd_x(0) )
        .attr("y", d => wd_y(d[0]))
        .attr("width", d => wd_x(d[1]))
        .attr("height", wd_y.bandwidth())
        .attr("fill", "transparent")
        .attr("stroke", "#000")
        .append("title")
        .text(function(d){
        return d[0] + " : " + parseInt(d[1]).toLocaleString('en');
        })
    }
        
    // add the candidates to the selector
    d3.select("#candidateSelector")
    .selectAll('options')
    .data(elements.sort())
    .enter()
    .append('option')
    .text(function (d) { return d; }) 
    .attr("value", function (d) { return d; }) 

});