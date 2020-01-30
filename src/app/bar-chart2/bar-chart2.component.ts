import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
import * as $ from "jquery";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-bar-chart2",
  templateUrl: "./bar-chart2.component.html",
  styleUrls: ["./bar-chart2.component.css"]
})
export class BarChart2Component implements OnInit {
  x: any;
  y: any;
  gX: any;
  gY: any;
  xAxis: any;
  yAxis: any;
  idList = 1;
  color = d3.scaleOrdinal(d3.schemeCategory10);
  mainData = null;
  line: any;
  settings = {
    targets: [],
    detail: {
      type: "line"
    }
  };
  data: any;
  barWidth: any;

  constructor(private http: HttpClient) {
    this.http.get<any>("./assets/dataChart2.json").subscribe(data => {
      this.init(data);
    });
  }

  ngOnInit() {}

  init(incomingData: any) {
    const data = incomingData;

    if (data[0].metric.WIDGET_SETTINGS != "") {
      const wid = JSON.parse(data[0].metric.WIDGET_SETTINGS);
      if (wid != null && typeof wid.line != "undefined") {
        $.extend(this.settings, wid.line);
      }
      if (wid != null) {
        $.extend(this.settings, wid);
      }
    }

    this.mainData = data;
    const svg = d3.select("svg");

    d3.select("#area")
      .insert("div", "svg")
      .html(
        data[0].metric.AREA_NAME +
          "<BR>" +
          data[0].metric.IND_NAME +
          "<BR>" +
          data[0].metric.NAME
      );

    const limits = { maxY: null, minY: null, maxX: null, minX: null };
    const padding = { top: 20, bottom: 150, left: 100, right: 20 };

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const canvasHeight = height - padding.top - padding.bottom;
    const canvasWidth = width - padding.left - padding.right;

    data.forEach((e, i) => {
      const eMaxY = d3.max(e.data, (d: any) => {
        return +d.VALUE_NUMERIC;
      });
      const eMinY = d3.min(e.data, (d: any) => {
        return +d.VALUE_NUMERIC;
      });
      const eMaxX = d3.max(e.data, (d: any) => {
        return new Date(d.DATA_DATE);
      });
      const eMinX = d3.min(e.data, (d: any) => {
        return new Date(d.DATA_DATE);
      });

      if (limits.maxX == null) {
        limits.maxX = eMaxX;
      } else {
        if (eMaxX > limits.maxX) {
          limits.maxX = eMaxX;
        }
      }

      if (limits.minX == null) {
        limits.minX = eMinX;
      } else {
        if (eMinX < limits.minX) {
          limits.minX = eMinX;
        }
      }

      if (limits.maxY == null) {
        limits.maxY = eMaxY;
      } else {
        if (eMaxY > limits.maxY) {
          limits.maxY = eMaxY;
        }
      }

      if (limits.minY == null) {
        limits.minY = eMinY;
      } else {
        if (eMinY < limits.minY) {
          limits.minY = eMinY;
        }
      }
    });

    this.settings.targets.forEach(d => {
      if (limits.maxY < d.value) {
        limits.maxY = d.value;
      }
      if (limits.minY > d.value) {
        limits.minY = d.value;
      }
    });

    const canvas = svg
      .append("g")
      .attr("id", "canvas")
      .attr("width", canvasWidth)
      .attr("height", canvasHeight)
      .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

    this.x = d3
      .scaleTime()
      .domain([limits.minX, limits.maxX])
      .range([0, +canvas.attr("width")]);
    this.y = d3
      .scaleLinear()
      .domain([limits.maxY * 1.1, limits.minY - limits.minY * 0.1])
      .range([0, +canvas.attr("height")]);

    this.line = d3
      .line()
      .x((d: any) => {
        return this.x(new Date(d.DATA_DATE));
      })
      .y((d: any) => {
        return this.y(+d.VALUE_NUMERIC);
      });

    const zoomed = () => {
      this.gX.call(this.xAxis.scale(d3.event.transform.rescaleX(this.x)));
      const new_x = d3.event.transform.rescaleX(this.x);

      if (this.settings.detail.type == "line") {
        this.line.x((d: any) => {
          return new_x(new Date(d.DATA_DATE));
        });
        d3.select("#canvas")
          .selectAll("path.line")
          .data(this.mainData)
          .attr("d", (d: any) => {
            return this.line(d.data);
          });
      } else if (this.settings.detail.type == "bar") {
        this.barWidth =
          new_x(new Date("2016-01-02")) - new_x(new Date("2016-01-01"));
        d3.select("#canvas")
          .selectAll("rect.bar")
          .data(this.mainData[0].data)
          .attr("x", (d: any) => {
            return new_x(new Date(d.DATA_DATE)) - this.barWidth * 0.5;
          })
          .attr("width", this.barWidth);
      }
    };

    const zoom = d3.zoom().on("zoom", zoomed);

    this.xAxis = d3.axisBottom(this.x);
    this.yAxis = d3.axisLeft(this.y);

    canvas
      .selectAll(".targets")
      .data(this.settings.targets)
      .enter()
      .append("line")
      .classed("targets", true)
      .style("stroke", (d: any) => {
        return d.color;
      })
      .style("stroke-width", 1)
      .attr("x1", this.x(limits.minX))
      .attr("x2", this.x(limits.maxX))
      .attr("y1", d => {
        return this.y(+d.value);
      })
      .attr("y2", d => {
        return this.y(+d.value);
      });

    const clip = canvas
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", canvasWidth)
      .attr("height", canvasHeight);

    this.gX = canvas
      .append("g")
      .attr("transform", "translate(0," + +canvas.attr("height") + ")")
      .attr("class", "axis axis--x")
      .call(this.xAxis);

    this.gY = canvas
      .append("g")
      .attr("class", "axis axis--y")
      .call(this.yAxis);

    d3.selectAll(".axis--y > g.tick > line")
      .attr("x2", canvasWidth)
      .style("stroke", "lightgrey");

    if (this.settings.detail.type == "line") {
      const lines = canvas
        .selectAll("path.line")
        .data(data)
        .enter()
        .append("path")
        .attr("clip-path", "url(#clip)")
        .classed("line", true)
        .style("stroke", (d: any) => {
          return this.color(d.metric.METRIC_ID);
        })
        .attr("d", (d: any) => {
          return this.line(d.data);
        });
    } else if (this.settings.detail.type == "bar") {
      const barWidth =
        this.x(new Date("2016-01-02")) - this.x(new Date("2016-01-01"));
      const barLines = canvas
        .selectAll("rect.bar")
        .data(data[0].data)
        .enter()
        .append("rect")
        .on("click", this.changeColor)
        .attr("class", "bar")
        .attr("clip-path", "url(#clip)")
        .attr("x", (d: any) => {
          return this.x(new Date(d.DATA_DATE)) - barWidth * 0.5;
        })
        .attr("width", barWidth)
        .attr("height", (d: any) => {
          return canvasHeight - this.y(d.VALUE_NUMERIC);
        })
        .attr("y", (d: any) => {
          return this.y(d.VALUE_NUMERIC);
        })
        .style("fill", "steelblue")
        .style("stroke", "blue")
        .style("stroke-width", "1px");
    }

    canvas
      .append("g")
      .attr(
        "transform",
        "translate(" + -40 + "," + +canvas.attr("height") / 2 + ") rotate(270)"
      )
      .append("text")
      .attr("text-anchor", "middle")
      .text(data[0].metric.Y_AXIS_NAME);

    svg.call(zoom);
  }

  changeColor(element) {
    console.log(element);
    d3.selectAll("rect.bar").style("fill", "steelblue");
    d3.select(this).style("fill", "red");
    console.log("click event registered===");
  }
}
