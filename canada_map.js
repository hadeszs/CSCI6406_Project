
var dataset, bars, flags, pies;
var padding = { left: 550, right: 50, top: 10, bottom: 50 };
var width = 810;
var height = 600;
var rectStep = 4;
var rectWidth = 3;
var barRatio = 1.5;
var wordGap = 3;
var color10 = d3.schemeCategory10;
var color20 = d3.scaleOrdinal(d3.schemeCategory20);
var color20b = d3.scaleOrdinal(d3.schemeCategory20b);
var color20c = d3.scaleOrdinal(d3.schemeCategory20c);
var years = [{ name: "ALL DATA", value: 100 }
    , { name: "2008", value: 8 }
    , { name: "2009", value: 9 }
    , { name: "2010", value: 10 }
    , { name: "2011", value: 11 }
    , { name: "2012", value: 12 }
    , { name: "2013", value: 13 }
    , { name: "2014", value: 14 }
    , { name: "2015", value: 15 }
    , { name: "2016", value: 16 }
    , { name: "2017", value: 17 }
    , { name: "2018", value: 18 }];
var year = 100;
var fontSize = '0.3em';
var eDelay = 0;

//ref: https://www.d3-graph-gallery.com/graph/interactivity_button.html
var dropdownButton = d3.select('#selectBar')
    .append('select');

dropdownButton.selectAll('myOptions')
    .data(years)
    .enter()
    .append('option')
    .text(function (d) { return d.name + '(Base Year:2016)'; })
    .attr("value", function (d) { return d.value; });

dropdownButton.on("change", function (d) {
    year = d3.select(this).property("value");
})

var svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'cleaned_data_light.json', true);
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

    var projection = d3.geoAzimuthalEqualArea()
        .rotate([100, -45])
        .center([20, 15])
        .scale(550)
        .translate([width / 2, height / 2]);
    var path = d3.geoPath()
        .projection(projection);

    d3.json("canada.json", function (error, ca) {
        //console.log(ca);
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(ca.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", function (d, i) {
                if ((d.properties.NAME == 'Yukon Territory') || (d.properties.NAME == 'Northwest Territories') || (d.properties.NAME == 'Nunavut')) {
                    return d3.rgb('lightgray')
                } else {
                    return color20c(i);
                }
            })
            .on("mouseover", function (d) {
                d3.select(this)
                    .style('fill', function (d) {
                        return d.color;
                        // return d3.rgb(d.color).darker(0);
                    })
                    .transition()
                    .duration(500)
                    .delay(10)
                    .style('fill', function (d) {
                        return d3.rgb('yellow');
                        // return d3.rgb(d.color).darker(0);
                    })
                    .style("transform", "scale(1.05,1.05)")
                    .style("transform-origin", "50% 50%");


                d3.select(this).style('stroke', 'black');
                name = d.properties.NAME;
                d3.select(this).append('svg:title')
                    .text(name);
                drawBar(name);
                drawFlag(name);
                drawPie([0, 0]);
            })
            .on("mouseout", function (d) {
                d3.select(this).transition()
                    .duration(1000)
                    .delay(10)
                    .style('fill', function (d) {
                        return d.color;
                    })
                    .style("transform", "scale(1,1)")
                    .style("transform-origin", "50% 50%");;
                d3.select(this).style('stroke', 'none');

            })
            .transition()
            .duration(200)
            .delay(function (d, i) {
                return i * 20;
            });

    });

}

function drawBar(name) {


    if (bars != null) {
        bars.remove();
    }

    bars = svg.selectAll('rects')
        .data(dataset)
        .enter()
        .append('g');

    bars.append("rect")
        .filter(function (d) {
            if (year != '100') {
                rectWidth = 25;
                rectStep = 30;
                barRatio = 2;
                fontSize = '1em';
                wordGap = 15;
                eDelay = 1000;
                return d.GEO == name && year == d.REF_DATE.substr(0, d.REF_DATE.indexOf('-'));

            } else {
                rectWidth = 3;
                rectStep = 4;
                barRatio = 1.5;
                fontSize = '0.3em'
                wordGap = 3;
                eDelay = 0;
                return d.GEO == name;
            }
        })
        .attr('x', padding.left)
        .attr('y', function (d, i) { return padding.top + i * rectStep })
        .attr('height', rectWidth)
        .attr('fill', function (d, i) {
            var change = (d.VALUE / 100) * 210;
            if (d.VALUE > 100) {
                return d3.rgb(change, 0, 0);
            } else {
                return d3.rgb(0, change, i * 2);
            }
        })
        .on("mouseover", function (d) {
            d3.select(this)
                .style('fill', 'yellow')
                .style("transform", "scale(1.05,1.05)")
                .style("transform-origin", "50% 50%");
            var piedata = [0, 100, 0];
            piedata[0] = d.VALUE;
            piedata[2] = (d.VALUE - 100) * 5;
            drawPie(piedata);
        })
        .on("mouseout", function (d) {

            d3.select(this).transition().delay(5)
                .style('fill', function (d) {
                    return d.color;
                })
                .style("transform", "scale(1,1)")
                .style("transform-origin", "50% 50%");
        })
        .attr('width', 0)
        .transition()
        .duration(200 + eDelay)
        .delay(function (d, i) {
            return i * 20;
        })
        .attr('width', function (d, i) { return (d.VALUE) * barRatio });

    bars.append('text')
        .attr('class', '.barText')
        .filter(function (d) {
            if (year != '100') {
                return d.GEO == name && year == d.REF_DATE.substr(0, d.REF_DATE.indexOf('-'));

            } else {
                return d.GEO == name;
            }
        })

        .attr('y', function (d, i) { return padding.top + wordGap + i * rectStep })
        .attr('font-size', fontSize)
        .style("text-anchor", "start")
        .text(function (d) { return d.VALUE; })
        .attr('x', width * 2)
        .on("mouseover", function (d) {
            if (year == '100') {
                d3.select(this)
                    .style('fill', 'blue')
                    .attr('font-size', '1em');
            }

        })
        .on("mouseout", function (d) {
            if (year == '100') {

                d3.select(this).style('fill', function (d) {
                    return d.color;
                })
                    .attr('font-size', fontSize);
            }
        })
        .transition()
        .duration(100 + eDelay)
        .delay(function (d, i) {
            return i * 20;
        })
        .attr('x', function (d, i) { return ((d.VALUE) * barRatio + padding.left + 3) });

    bars.append('text')
        .filter(function (d) {
            if (year != '100') {
                return d.GEO == name && year == d.REF_DATE.substr(0, d.REF_DATE.indexOf('-'));

            } else {
                return d.GEO == name;
            }
        })

        .attr('y', function (d, i) { return padding.top + wordGap + i * rectStep })
        .attr('font-size', fontSize)
        .style("text-anchor", "end")
        .text(function (d) { return d.REF_DATE; })
        .attr('x', 0)
        .on("mouseover", function (d) {
            if (year == '100') {
                d3.select(this)
                    .style('fill', 'blue')
                    .attr('font-size', '1em');
            }
        })
        .on("mouseout", function (d) {
            if (year == '100') {
                d3.select(this).style('fill', function (d) {
                    return d.color;
                })
                    .attr('font-size', fontSize);
            }
        })
        .transition()
        .duration(100 + eDelay)
        .delay(function (d, i) {
            return i * 20;
        })
        .attr('x', padding.left - 3);

    bars.append('text')
        .attr('x', 250)
        .attr('y', 50)
        .attr('font-size', '1.5em')
        .style("text-anchor", "middle")
        .text('House Price Index:\r' + name);

}
function drawFlag(name) {

    var path = "flags/" + name + '.jpg';
    if (flags != null) {
        flags.remove();
    }
    flags = svg.append('svg:image')
        .attr('x', 310)
        .attr('y', 40)
        .attr('width', 180)
        .attr('height', 150)
        .attr("xlink:href", path);

}

function drawPie(piedata) {

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(50);

    var pie = d3.pie()
        .sort(null)
        .value(function (d) { return d })
        .startAngle(0)
        .endAngle(2 * Math.PI);

    if (pies != null) {
        pies.remove();
    }

    pies = svg.selectAll('pies')
        .data(pie(piedata))
        .enter()
        .append('g')
        .attr('transform', 'translate(450,230)');

    pies.append('path')
        .attr('d', arc)
        .style('fill', function (d, i) {

            if (d.value > 0 && d.value < 50) {
                return color20c(5);
            }

            return color20c(i)
        })
        .attr("stroke", 'white')
        .attr("stroke-width", 2);

}

