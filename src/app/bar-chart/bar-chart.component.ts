import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  ViewEncapsulation
} from "@angular/core";
import { Data } from "../models/data.model";
import * as d3 from "d3";

@Component({
  selector: "app-bar-chart",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./bar-chart.component.html",
  styleUrls: ["./bar-chart.component.css"]
})
export class BarChartComponent implements OnInit, OnChanges {
  @ViewChild("barChart")
  private chartContainer: ElementRef;

  @Input()
  data: Data[];

  margin = { top: 20, right: 20, bottom: 30, left: 40 };

  constructor() {}

  ngOnInit() {}

  ngOnChanges(): void {
    if (!this.data) {
      return;
    }

    this.createChart();
  }

  private createChart(): void {
    d3.select("svg").remove();
    const element = this.chartContainer.nativeElement;
    const data = this.data;

    let svg = d3
      .select(element)
      .append("svg")
      .attr("width", "500")
      .attr("height", "300")
      .call(
        d3
          .zoom()
          .scaleExtent([1, 8])
          .on("zoom", () => {
            svg
              .selectAll("rect")
              .attr(
                `transform`,
                `translate(${d3.zoomTransform(svg.node()).x},0)`
              );
          })
      );

    const contentWidth = 1360;
    const contentHeight = 300 - this.margin.top - this.margin.bottom;

    const x = d3
      .scaleBand()
      .rangeRound([0, contentWidth])
      .padding(0.5)
      .domain(data.map(d => d.day));

    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, d3.max(data, d => d.frequency)]);

    const g = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + contentHeight + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .on("click", this.changeColor)
      .attr("class", "bar")
      .attr("x", d => x(d.day))
      .attr("y", d => y(d.frequency))
      .attr("width", x.bandwidth())
      .attr("height", d => contentHeight - y(d.frequency));
  }

  onResize() {
    this.createChart();
  }

  changeColor(element) {
    // console.log(element);
    // d3.select(this).style("fill", "magenta");
    // console.log("click event registered===");
  }
}
