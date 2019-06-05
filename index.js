
var dataset;
var padding = { left: 50, right: 50, top: 50, bottom: 50 };
var width = 960;
var height = 18500;
var rectStep = 7;//每个柱状图间距
var rectWidth = 5;   //每个矩形所占的像素高度(包括空白)
var barRatio = 5
var color10 = d3.schemeCategory10;

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'dataset.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    }
    xobj.send(null);
}

function init() {
    loadJSON(function (response) {
        dataset = JSON.parse(response);
        draw();
    });
}

init();

function draw() {

    var svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append('g');

    var bars = svg.selectAll('g')
        .data(dataset)
        .enter()
        .append('g');

    bars.append("rect")
        .attr('x', padding.left)
        .attr('y', function (d, i) { return i * rectStep })
        .attr('height', rectWidth)
        .attr('width', function (d, i) { return (d.VALUE) * barRatio })
        .attr('fill', function (d, i) {
            var index;
            if (i >= 10) {
                index = i % 10;
            } else {
                index = i;
            }
            return color10[index];
        })
        .on("mouseover", function (d) {
            d3.select(this).style('fill', 'white')
        })
        .on("mouseout", function (d) {
            d3.select(this).transition().delay(5).style('fill', function (d) {
                return d.color;
            })
        });
    bars.append('text')
        .attr('x', function (d, i) { return (d.VALUE + 15) * barRatio })
        .attr('y', function (d, i) { return i * rectStep })
        .attr('font-size', '0.5em')
        .style("text-anchor", "end")
        .text(function (d) { return d.VALUE; });

    bars.append('text')
        .attr('x', padding.left)
        .attr('y', function (d, i) { return i * rectStep })
        .attr('font-size', '0.5em')
        .style("text-anchor", "end")
        .text(function (d) { return d.REF_DATE; });

}

