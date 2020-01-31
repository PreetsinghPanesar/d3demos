import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
import { HttpClient } from "@angular/common/http";

// Global methods and properties
let xAxisGroup;
function getFullDate(date: Date) {
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();

  return [
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
    date.getFullYear()
  ].join("/");
}

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
  mainData = null;
  data: any;
  barWidth: any;
  SCALE = 2.5;
  NO_OF_X_TICKS = 10;
  NO_OF_Y_TICKS = 5;

  constructor(private http: HttpClient) {
    this.http.get<any>("./assets/dataChart2.json").subscribe(data => {
      this.init(data);
    });
  }

  ngOnInit() {}

  init(incomingData: any) {
    const data = incomingData;

    this.mainData = data;
    const svg = d3.select("svg");

    const limits = { maxY: null, minY: null, maxX: null, minX: null };
    const padding = { top: 20, bottom: 150, left: 100, right: 100 };

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const canvasHeight = height - padding.top - padding.bottom;
    const canvasWidth = width - padding.left - padding.right;

    data.forEach((e, i) => {
      const eMaxY = d3.max(e.data, (d: any) => +d.VALUE_NUMERIC);
      const eMinY = d3.min(e.data, (d: any) => +d.VALUE_NUMERIC);
      const eMaxX = d3.max(e.data, (d: any) => new Date(d.DATA_DATE));
      const eMinX = d3.min(e.data, (d: any) => new Date(d.DATA_DATE));

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

    const zoomed = () => {
      this.gX.call(this.xAxis.scale(d3.event.transform.rescaleX(this.x)));
      const new_x = d3.event.transform.rescaleX(this.x);

      this.barWidth =
        new_x(new Date("2016-01-01 23:00")) -
        new_x(new Date("2016-01-01 15:00"));

      d3.select("#canvas")
        .selectAll("rect.bar")
        .data(this.mainData[0].data)
        .attr("x", (d: any) => {
          return new_x(new Date(d.DATA_DATE)) - this.barWidth * 0.5;
        })
        .attr("width", this.barWidth);
    };

    const zoom = d3
      .zoom()
      .on("zoom", zoomed)
      .scaleExtent([this.SCALE, this.SCALE]);

    this.xAxis = d3
      .axisBottom(this.x)
      .ticks(this.NO_OF_X_TICKS)
      .tickFormat(d3.timeFormat("%d"));
    this.yAxis = d3.axisLeft(this.y).ticks(this.NO_OF_Y_TICKS);

    const clip = canvas
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", canvasWidth)
      .attr("height", canvasHeight);

    this.gX = canvas
      .append("g")
      .attr("transform", `translate(0, ${+canvas.attr("height") + 10})`)
      .attr("class", "axis axis--x")
      .call(this.xAxis)
      .style("font-size", "14px")
      .attr("stroke-width", 0);

    xAxisGroup = this.gX;

    this.gY = canvas
      .append("g")
      .attr("class", "axis axis--y")
      .attr("stroke-width", 0)
      .call(this.yAxis)
      .style("font-size", "14px");

    const changeColor = function(element) {
      // reset the previous selections
      d3.selectAll("rect.bar").style("fill", "#74B1A1");
      d3.selectAll("text")
        .style("fill", "black")
        .style("font-size", "14px");
      d3.selectAll("circle").remove();

      d3.select(this).style("fill", "#CE407D");
      xAxisGroup.selectAll(".tick").each(function(d) {
        if (getFullDate(d) === element.DATA_DATE) {
          // increase font size
          d3.select(this)
            .selectAll("text")
            .style("fill", "#FFF")
            .style("font-size", "16px");

          // add circle in the background
          d3.select(this)
            .insert("circle", ":first-child")
            .attr("r", 13)
            .style("fill", "#CE407D")
            .attr("transform", "translate(0, 14)");
        }
      });
    };

    const barWidth =
      this.x(new Date("2016-01-01 23:00")) -
      this.x(new Date("2016-01-01 15:00"));

    const barLines = canvas
      .selectAll("rect.bar")
      .data(data[0].data)
      .enter()
      .append("rect")
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
      .style("fill", "#74B1A1")
      .style("stroke-width", "1px")
      .on("click", changeColor);

    svg
      .call(zoom)
      .call(zoom.transform, () =>
        d3.zoomIdentity.translate(50, 0).scale(this.SCALE)
      );
  }
}
