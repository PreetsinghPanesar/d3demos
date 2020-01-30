SimpleGraph = function (elemid, options) {
  var self = this;
  this.chart = document.getElementById(elemid);
  this.cx = this.chart.clientWidth;
  this.cy = this.chart.clientHeight;
  this.options = options || {};
  this.options.xmax = options.xmax || 30;
  this.options.xmin = options.xmin || 0;
  this.options.ymax = options.ymax || 10;
  this.options.ymin = options.ymin || 0;

  this.padding = {
    top: this.options.title ? 40 : 20,
    right: 30,
    bottom: this.options.xlabel ? 60 : 10,
    left: this.options.ylabel ? 70 : 45
  };

  this.size = {
    width: this.cx - this.padding.left - this.padding.right,
    height: this.cy - this.padding.top - this.padding.bottom
  };

  // x-scale
  this.x = d3.scale
    .linear()
    .domain([this.options.xmin, this.options.xmax])
    .range([0, this.size.width]);

  // y-scale (inverted domain)
  this.y = d3.scale
    .linear()
    .domain([this.options.ymax, this.options.ymin])
    .nice()
    .range([0, this.size.height])
    .nice();

  // this.line = d3.svg
  //   .line()
  //   .x(function (d, i) {
  //     return this.x(this.points[i].x);
  //   })
  //   .y(function (d, i) {
  //     return this.y(this.points[i].y);
  //   });

  var xrange = this.options.xmax - this.options.xmin,
    yrange2 = (this.options.ymax - this.options.ymin) / 2,
    yrange4 = yrange2 / 2,
    datacount = this.size.width / 30;

  this.points = d3.range(datacount).map(function (i) {
    return {
      x: (i * xrange) / datacount,
      y: this.options.ymin + yrange4 + Math.random() * yrange2
    };
  }, self);

  this.vis = d3
    .select(this.chart)
    .append("svg")
    .attr("width", this.cx)
    .attr("height", this.cy)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.padding.left + "," + this.padding.top + ")"
    );

  this.plot = this.vis
    .append("rect")
    .attr("width", this.size.width)
    .attr("height", this.size.height)
    .style("fill", "#EEEEEE")
    .attr("pointer-events", "all")

  // this.vis
  //   .append("svg")
  //   .attr("top", 0)
  //   .attr("left", 0)
  //   .attr("width", this.size.width)
  //   .attr("height", this.size.height)
  //   .attr("viewBox", "0 0 " + this.size.width + " " + this.size.height)
  //   .attr("class", "line")
  //   .append("path")
  //   .attr("class", "line")
  //   .attr("d", this.line(this.points));

  this.redraw()();
};

//
// SimpleGraph methods
//

SimpleGraph.prototype.update = function () {
  var self = this;
  // var lines = this.vis.select("path").attr("d", this.line(this.points));
  this.vis.selectAll(".bar")
    .data([])
    .exit().remove();
  var rect = this.vis.selectAll(".bar")
    .data(this.points)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => self.x(d.x))
    .attr("y", d => self.y(d.y))
    .attr("width", 10)
    .attr("height", d => this.size.height - self.y(d.y))
    .style("fill", "steelblue")
};

SimpleGraph.prototype.redraw = function () {
  var self = this;
  return function () {
    var tx = function (d) {
      return "translate(" + self.x(d) + ",0)";
    },
      ty = function (d) {
        return "translate(0," + self.y(d) + ")";
      },
      stroke = function (d) {
        return d ? "#ccc" : "#666";
      },
      fx = self.x.tickFormat(10),
      fy = self.y.tickFormat(10);

    // Regenerate x-ticks…
    var gx = self.vis
      .selectAll("g.x")
      .data(self.x.ticks(10), String)
      .attr("transform", tx);

    gx.select("text").text(fx);

    var gxe = gx
      .enter()
      .insert("g", "a")
      .attr("class", "x")
      .attr("transform", tx);

    // gxe
    //   .append("line")
    //   .attr("stroke", stroke)
    //   .attr("y1", 0)
    //   .attr("y2", self.size.height);

    gxe
      .append("text")
      .attr("class", "axis")
      .attr("y", self.size.height)
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .text(fx)
      .style("cursor", "ew-resize")
      .on("mouseover", function (d) {
        d3.select(this).style("font-weight", "bold");
      })
      .on("mouseout", function (d) {
        d3.select(this).style("font-weight", "normal");
      });

    gx.exit().remove();

    // Regenerate y-ticks…
    var gy = self.vis
      .selectAll("g.y")
      .data(self.y.ticks(10), String)
      .attr("transform", ty);

    gy.select("text").text(fy);

    var gye = gy
      .enter()
      .insert("g", "a")
      .attr("class", "y")
      .attr("transform", ty)
      .attr("background-fill", "#FFEEB6");

    gye
      .append("line")
      .attr("stroke", stroke)
      .attr("x1", 10)
      .attr("x2", self.size.width);

    gye
      .append("text")
      .attr("class", "axis")
      .attr("x", -3)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(fy)

    gy.exit().remove();

    self.plot.call(
      d3.behavior
        .zoom()
        .x(self.x)
        .on("zoom", self.redraw())
    );
    self.update();
  };
};
