// JSON Data

var data = [
  { date: "2012-01-01", num: 5 },
  { date: "2012-01-05", num: 10 },
  { date: "2012-01-10", num: 22 },
  { date: "2012-01-15", num: 72 },
  { date: "2012-01-20", num: 87 },
  { date: "2012-01-21", num: 90 }
];

// Function for Creating the require Chart
function draw() {
  // Providing Require Parameters
  var location = "#post";
  var graph_width = 500;
  var graph_height = 200;

  // Declaring Some functionality Oriented Parameters
  var values = _.pluck(data, "num");
  var max_val = d3.max(values);
  var v_scale = graph_height / max_val;
  //   var data_counts = data.length;
  //   var bar_width = graph_width / data_counts;
  var minDate = new Date(data[0]["date"]);
  var maxDate = new Date(data[data.length - 1]["date"]);

  // Defining Range of a Graph
  var y = d3.scale
    .linear()
    .domain([0, max_val])
    .range([graph_height, 0]);

  var x = d3.time
    .scale()
    .domain([minDate, maxDate])
    .range([0, graph_width]);

  // Calling Chart Attributes and Behaviour
  var chart = d3
    .select(location)
    .append("svg")
    .attr("class", "chart")
    .attr("width", graph_width + 20)
    .attr("height", graph_height + 20)
    .call(
      d3.behavior
        .zoom()
        // .x(x)
        .scaleExtent([1, 8])
        .on("zoom", zoom)
    );

  // var lines = chart.selectAll("line");

  // // Functionality for Y Axis
  // var lines_y = lines
  //   .data(x.ticks(5))
  //   .enter()
  //   .append("line")
  //   .attr("x1", x)
  //   .attr("x2", x)
  //   .attr("y1", function(d) {
  //     return graph_height - 20 - d;
  //   })
  //   .attr("y2", graph_height)
  //   .style("stroke", "#ccc");

  // // Functionality for X Axis
  // var lines_x = lines
  //   .data(y.ticks(10))
  //   .enter()
  //   .append("line")
  //   .attr("x1", 0)
  //   .attr("x2", graph_width)
  //   .attr("y1", y)
  //   .attr("y2", y)
  //   .style("stroke", "#ccc");

  // Scalling of Chart for both Axis
  xAxis = d3.svg.axis().scale(x);
  yAxis = d3.svg
    .axis()
    .scale(y)
    .orient("left");

  chart
    .append("svg:g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0,200)")
    .call(xAxis);

  chart
    .append("svg:g")
    .attr("class", "yaxis")
    .attr("transform", "translate(25,0)")
    .call(yAxis);

  var rect = chart
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
      return x(new Date(d["date"])) + 20;
    })
    .attr("y", function(d, i) {
      return graph_height - d["num"] * v_scale;
    })
    .attr("width", x(new Date(data[1]["date"])))
    .attr("height", function(d, i) {
      return d["num"] * v_scale;
    });

  //  // Calling ZOOM function for some Responsive Effects
  function zoom() {
    // chart.select(".xaxis").call(xAxis);
    // chart.select(".yaxis").call(yAxis);
    console.log("d3.event.scale");
    console.log(d3.event.scale);
    console.log("d3.event.translate[0]");
    console.log(d3.event.translate[0]);
    chart
      .selectAll(".chart rect")
      .attr(
        "transform",
        `translate(${d3.event.translate[0]}, 0), scale(${d3.event.scale}, 1)`
      );
  }
}

draw();
