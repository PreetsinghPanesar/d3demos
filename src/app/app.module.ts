import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BarChartComponent } from "./bar-chart/bar-chart.component";
import { HttpClientModule } from "@angular/common/http";
import { BarChart1Component } from './bar-chart1/bar-chart1.component';
import { BarChart2Component } from './bar-chart2/bar-chart2.component';

@NgModule({
  declarations: [AppComponent, BarChartComponent, BarChart1Component, BarChart2Component],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
