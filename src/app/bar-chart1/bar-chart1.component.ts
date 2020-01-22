import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnChanges,
  AfterViewInit
} from "@angular/core";

import * as d3 from "d3";

@Component({
  selector: "app-bar-chart1",
  templateUrl: "./bar-chart1.component.html",
  styleUrls: ["./bar-chart1.component.css"]
})
export class BarChart1Component implements AfterViewInit {
  data = [
    { date: "2012-01-01", day: 1 },
    { date: "2012-01-05", day: 11 },
    { date: "2012-01-10", day: 15 },
    { date: "2012-01-15", day: 18 },
    { date: "2012-01-20", day: 25 }
    // { date: "2012-01-21", day: 31 }
  ];

  @ViewChild("barChart")
  private location: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    if (!this.data) {
      return;
    }

    this.draw();
  }

  draw() {
    let graph_width = 500;
    let graph_height = 200;
    let values = [1, 11, 15, 18, 25, 31];
    let max_val = d3.max(values);
    let v_scale = graph_height / max_val;
    let minDate = new Date(this.data[0]["date"]);
    let maxDate = new Date(this.data[this.data.length - 1]["date"]);

    // Defining Range of a Graph
    let y = d3
      .scaleLinear()
      .domain([0, max_val])
      .range([graph_height, 0]);

    let x = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([0, graph_width]);

    let chart = d3
      .select(this.location.nativeElement)
      .append("svg")
      .attr("class", "chart")
      .attr("width", graph_width + 20)
      .attr("height", graph_height + 20)
      .call(
        d3
          .zoom()
          .scaleExtent([1, 8])
          .on("zoom", () => {
            console.log("zoom called");
            chart
              .selectAll("rect")
              .attr(
                `transform`,
                `translate(${d3.zoomTransform(chart.node()).x},0) scale(${
                  d3.zoomTransform(chart.node()).k
                })`
              );
          })
      );
    // .call(
    //   d3.behavior
    //     .zoom()
    //     // .x(x)
    //     .scaleExtent([1, 8])
    //     .on("zoom", zoom)
    // );

    let xAxis = d3.axisBottom(x);
    let yAxis = d3.axisLeft(y).scale(y);

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
      .data(this.data)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        return x(new Date(d["date"])) + 20;
      })
      .attr("y", function(d, i) {
        return graph_height - d["day"] * v_scale;
      })
      .attr("width", x(new Date(this.data[1]["date"])))
      .attr("height", function(d, i) {
        return d["day"] * v_scale;
      });
  }
}
