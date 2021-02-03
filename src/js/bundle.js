import $ from 'jquery';
// import { GoogleCharts } from 'google-charts';

import './modules';

// Charts
let chartsArray = []; // , dataPointsArray = [];

$(function() {
  if( typeof( GoogleCharts ) !== 'undefined' ) {
    // get charts
    $('.ticks-chart').each(function() {
      let $chart = $(this);
      let $surround = $(this).closest('.chart-surround');
      let id, buoyID, waveTickMax, waveTicks, peakTickMax, peakTicks, dataPoints;
      if($chart.attr('id') !== undefined) {
        // chartsArray.push();
        id = $(this).attr('id');
        let $ticksData = $surround.find('.ticks-data');
        if($ticksData.length === 1) {
          buoyID = ($ticksData.attr('data-buoy-id') !== undefined) ? $ticksData.attr('data-buoy-id') : '';
          waveTickMax = ($ticksData.attr('data-wave-tick-max') !== undefined) ? $ticksData.attr('data-wave-tick-max') : '';
          waveTicks = ($ticksData.attr('data-wave-ticks') !== undefined) ? $ticksData.attr('data-wave-ticks').split(',') : '';
          peakTickMax = ($ticksData.attr('data-peak-tick-max') !== undefined) ? $ticksData.attr('data-peak-tick-max') : '';
          peakTicks = ($ticksData.attr('data-peak-ticks') !== undefined) ? $ticksData.attr('data-peak-ticks').split(',') : '';
          dataPoints = ($ticksData.attr('data-data-points') !== undefined) ? eval('[' + JSON.parse($ticksData.attr('data-data-points')) + ']') : '';
        }

        // local time label
        const offset = new Date().getTimezoneOffset() / 60 * -1; // hours from GMT
        const timeLabel = (offset === 0) ? "Time (GMT)" : (offset > 0) ? "Time (GMT+" + offset + ")" : "Time (GMT" + offset + ")";

        // push to chart array
        if(id !== undefined && buoyID.length > 0 && waveTicks.length > 0 && waveTickMax.length > 0 && peakTicks.length > 0 && peakTickMax.length > 0 && dataPoints.length > 0) {
          chartsArray.push({id: id, buoyID: buoyID, dataPoints: dataPoints.slice(0, -1), options: {
            title: '',
            height: 280,
            backgroundColor: { fill: "transparent" },
            // chartArea: {left: 45, top: 30, right: 45, bottom: 30},
            series: {
              0: {targetAxisIndex: 0, color: '#449d44', type: 'area'},
              1: {targetAxisIndex: 1, color: 'transparent', visibleInLegend: true}
            },
            // hAxis: {
            //   'title': timeLabel
            // },
            vAxes: {
              0: {
                title: 'Wave Height (m)',
                viewWindow: {
                  min: 0,
                  max: waveTickMax
                },
                ticks: waveTicks
              },
              1: {
                title: 'Peak Period (s)',
                viewWindow: {
                  min: 0,
                  max: peakTickMax
                },
                ticks: peakTicks
              }
            },
            hAxis: {
              // 1: {
              title: timeLabel,
              interval: 1,
              gridlines: {
                units: {
                  days: {format: ['MMM d']},
                  hours: {format: ['ha']},
                }
              },
              minorGridlines: {
                units: {
                  hours: {format: ['ha']}
                }
              }
              // }
            }
          }});
        }
      }
    });

    // ES6 Load
    GoogleCharts.load(drawChart, 
      {'packages': ['line', 'corechart']}
    );

    $(window).resize(function() {
      drawChart();
    });
  }
});

function drawChart() {
  if( typeof( GoogleCharts ) !== 'undefined' ) {
    if(chartsArray.length > 0) {
      for(let i = 0; i < chartsArray.length; i++) {
        // labels + chart data
        var data = new GoogleCharts.api.visualization.DataTable();
        data.addColumn('date', 'Month');
        data.addColumn('number', "Significant Wave Height");
        data.addColumn({type: 'string', role: 'tooltip'});
        data.addColumn('number', "Peak Period and Direction");
        data.addColumn({type: 'string', role: 'tooltip'});
        data.addRows(chartsArray[i].dataPoints);

        const dataChart = new GoogleCharts.api.visualization.LineChart(document.getElementById(chartsArray[i].id));
        GoogleCharts.api.visualization.events.addListener(dataChart, "ready", drawMarkers.bind(dataChart, chartsArray[i]));
        dataChart.draw(data, chartsArray[i].options);
      }
    }
  }
}

function drawMarkers(chartData) {
  if( typeof( GoogleCharts ) !== 'undefined' ) {
    // interface
    let cli = this.getChartLayoutInterface();
    // for each chart
    for(let i = 0; i < chartData.dataPoints.length; i++) {
      let label = '.om-' + chartData.buoyID + '-overlay-marker-' + i;
      if(document.querySelector(label) !== null) {
        document.querySelector(label).style.top = Math.floor(cli.getYLocation(chartData.dataPoints[i][3], 1)) - 25 + "px";
        document.querySelector(label).style.left = Math.floor(cli.getXLocation(chartData.dataPoints[i][0])) - 25 + "px";
      }
    }

    // Place Legend Marker
    document.querySelector('.om-' + chartData.buoyID + '-legend-marker').style.top = Math.floor(cli.getBoundingBox("legendentry#1").top) - 8 + "px";
    document.querySelector('.om-' + chartData.buoyID + '-legend-marker').style.left = Math.floor(cli.getBoundingBox("legendentry#1").left) + 4 + "px";
  }
}