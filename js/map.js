//*******************************************************************
//  CREATE MATRIX AND MAP
//*******************************************************************


d3.csv('data/music_survey.csv', function (error, data) {
    var mpr = chordMpr(data);
    mpr
        .addValuesToMap('Genre')
        .addValuesToMap('College')
        .setFilter(function (row, a, b) {
            return (row.Genre === a.name && row.College === b.name) || (row.Genre === b.name && row.College === a.name)
        })
        .setAccessor(function (recs, a, b) {
            if (!recs[0]) return 0;
            return +recs[0].Count; 
        });
    drawChords(mpr.getMatrix(), mpr.getMap(), data);
});
//*******************************************************************
//  DRAW THE CHORD DIAGRAM
//*******************************************************************
function drawChords (matrix, mmap, data) {
    var w = 980, h = 800, r1 = h / 2, r0 = r1 - 110;
    var fill = d3.scale.ordinal()
    .range(['#c7b570','#c6cdc7','#335c64','#768935','#507282','#5c4a56','#aa7455','#574109','#837722','#73342d','#0a5564','#9c8f57','#7895a4','#4a5456','#b0a690','#0a3542',]);
        var chord = d3.layout.chord()
            .padding(.02)
            .sortSubgroups(d3.descending)
        var arc = d3.svg.arc()
            .innerRadius(r0)
            .outerRadius(r0 + 20);
        var svg = d3.select("body").append("svg:svg")
            .attr("width", w)
            .attr("height", h)
          .append("svg:g")
            .attr("id", "circle")
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");
            svg.append("circle")
                .attr("r", r0 + 20);
        var rdr = chordRdr(matrix, mmap);
        chord.matrix(matrix);
        var g = svg.selectAll("g.group")
            .data(chord.groups())
            .enter().append("svg:g")
            .attr("class", "group")
            .on("mouseover", mouseover)
            .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });
        g.append("svg:path")
            .style("stroke", "black")
            .style("fill", function(d) { return rdr(d).gdata == "Genre" ? "black": "grey"; })
            .attr("d", arc);
        g.append("svg:text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .style("font-family", "helvetica, arial, sans-serif")
            .style("font-size", "9px")
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
              return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                  + "translate(" + (r0 + 26) + ")"
                  + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .text(function(d) { return rdr(d).gname; });
          var chordPaths = svg.selectAll("path.chord")
                .data(chord.chords())
              .enter().append("svg:path")
                .attr("class", "chord")
                .style("stroke", function(d) { return d3.rgb(fill(rdr(d).sname)).darker(); })
                .style("fill", function(d) { return fill(rdr(d).sname); })
                .attr("d", d3.svg.chord().radius(r0))
                .on("mouseover", function (d) {
                  d3.select("#tooltip")
                    .style("visibility", "visible")
                    .html(chordTip(rdr(d)))
                    .style("top", function () { return (d3.event.pageY - 170)+"px"})
                    .style("left", function () { return (d3.event.pageX - 100)+"px";})
                })
                .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });
            
          function chordTip (d) {
            var p = d3.format(".1%"), q = d3.format(",.2f")
            var error = 0;
            
            for (var i = 0; i < data.length; i++) {
                if (data[i]['Genre'] === d.sname && data[i]['College'] === d.tname) {
                    error = data[i]['Error'];
                    break;
                }
            }
            
            return "Chord Info:<br/>"
              +  d.sname + " listeners from " + d.tname
              + ": " + d.svalue + "<br/>"
              + p(d.svalue/d.stotal) + " of " + d.sname + "'s Total (" + d.stotal + ")<br/>"
              + p(d.svalue/d.ttotal) + " of " + d.tname + "'s Total (" + d.ttotal + ")<br/>"
              + "Margin of Error for " + d.svalue + " is : " + q(error)
          }
            
          function groupTip (d) {
            var p = d3.format(".1%"), q = d3.format(",.2f")
            return "Group Info:<br/>"
                + d.gname + " : " + Math.floor(d.gvalue) + "<br/>"
          }
            
          function mouseover(d, i) {
            d3.select("#tooltip")
              .style("visibility", "visible")
              .html(groupTip(rdr(d)))
              .style("top", function () { return (d3.event.pageY - 80)+"px"})
              .style("left", function () { return (d3.event.pageX - 130)+"px";})
            chordPaths.classed("fade", function(p) {
              return p.source.index != i
                  && p.target.index != i;
            });
          }
      }