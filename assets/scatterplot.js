
  
  const svgWidth=800;
  const svgHeight=800;
  
  const margin={
    top:100,
    left:100,
    bottom:50,
    right:50
  }
  
  const width=svgWidth-(margin.left+margin.right);
  const height=svgHeight-(margin.top+margin.bottom);

  
d3.csv("./data/UgElections1.csv", function (data) {

    const xDomain=d3.extent(data.map(d=> d.Valid_Votes));

    const xRange=[0,width];
    const xScale=d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.Valid_Votes; })])
        .range(xRange);

    const yDomain=d3.extent(data.map(d=>d.Invalid_votes));
    const yScale = d3.scaleLinear()
    .domain([0, 6500])
    .range([height, 0]);

    const xAxis=d3.axisBottom(xScale);
    const yAxis=d3.axisLeft(yScale);

    d3.select("svg")
        .append("g")
        .attr("class","xAxis")
        .attr("transform",`translate(${margin.left},${svgHeight-margin.bottom})`);

    d3.select(".xAxis")
      .append("g")
      .call(xAxis.ticks(5).tickFormat(d=> +d))
      .selectAll("text")
      .style("font-size","14px");

    d3.select("svg")
      .append("g")
      .attr("class","yAxis")
      .attr("transform",`translate(${margin.left},${margin.top})`);
  
    d3.select(".yAxis")
        .append("g")
        .call(yAxis.ticks(5).tickFormat(d=> +d))
        .selectAll("text")
        .style("font-size","14px");

    d3.select(".xAxis")
        .append("text")
        .text("Valid Votes")
        .attr("x",width/2)
        .attr("y",margin.bottom * 0.7)
        .style("font-size","14px")
        .style("font-weight","bold")
        ;

    d3.select(".yAxis")
        .append("text")
        .text("Invalid Votes")
        .style("transform","rotate(270deg)")
        .attr("x",height/2 * -1)
        .attr("y",margin.left * 0.6 * -1)
        .style("font-size","14px")
        .style("font-weight","bold")
        ;

    d3.select("svg")
        .append("g")
        .attr("class","circle-g")
        .attr("transform",`translate(${margin.left},${margin.top})`);

        const color={
        "KAMPALA":"red"
        }

    const div=d3.select(".tooltip");

    d3.select(".circle-g")
        .selectAll(".circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class","circle")
        .attr("cx",d=>xScale(d.Valid_Votes))
        .attr("cy",d=>yScale(d.Invalid_votes))
        .attr("r",5)
        .style("fill",d=>color['KAMPALA'])
        .on("mouseover",function(d){
            div.transition()
            .duration(200)
            .style("opacity",0.9) })
;


});

    
  

  
  