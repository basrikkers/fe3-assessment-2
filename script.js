'use strict';

/* Based on https://bl.ocks.org/mbostock/3885304 by Mike Bostock
 * and http://bl.ocks.org/jonahwilliams/2f16643b999ada7b1909 by
 * Jonah Williams. */

var correctYear = 2012;

//selecting the svg
var svg = d3.select('svg');

var formatPercent = d3.format('.0%');
var formatPopulation = d3.format(',.0f');
var color = d3.scaleOrdinal(d3.schemeCategory20c);

// define the margin for the canvas
var margin = {top: 148, right: 72, bottom: 120, left: 72};

//scaling the axisses
var x = d3.scaleBand().padding(0.2);
var y = d3.scaleLinear();

/* Conventional margins: https://bl.ocks.org/mbostock/3019563. */
var group = svg
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//loading the d3 data text file for editing
  d3
    .text('index.txt')
    .mimeType('text/plain;charset=windows-1252') //define charsettype
    .get(onload)
  function onload(err, doc) {
    if (err) throw err;
    var header = doc.indexOf("Verkiezingen; Historische uitslagen Tweede Kamer"); //header of the txt

    doc = doc.replace(/Groep Wilders \/ Partij voor de Vrijheid+/g,'PVV');  //changing the long name to pvv for visual aspect
    doc = doc.replace(/"Zetelverdeling per partij+";/g,''); //remove title
    doc = doc.replace(/"aantal"+;/g,'');//remove aantal title
    doc = doc.replace(/-+/g,'')//remove '-' where zetels = 0
    doc = doc.replace(/;/g,',')//replace ; for ,
    doc = doc.replace(/ +/g, '')// delete spaces
    var header2 = doc.indexOf("Onderwerpen_1"); //select subtitle
    var end = doc.indexOf('\n', header2);//end subtitle

    doc = doc.slice(end).trim(); //removing header and subtitle
    var data = d3.csvParseRows(doc, map) //parse the file to a csv. give function map
    /* Listen to `sort`. */
      d3.select('input').on('change', onsort); //select onsort if checkbox changes

      /* Change after 2s automatically. */
      var timeout = d3.timeout(change, 2000);
    function map(d){
      if (d[1],d[2],d[3],d[4],d[5] == '') { // if zetels is empty; give feedback
        return
      }
        return {
          partij: d[0],
          "1994": Number(d[1]),
          "1998": Number(d[2]),
          "2002": Number(d[3]),
          "2003": Number(d[4]),
          "2005": Number(d[5])
      }
    }




  var fields = Object.keys(data[0]).filter(applicableField); //array with avaible fields for select menu
  var field = fields[0]; //current field
  /* Set domains. */
  x.domain(data.map(function(d){return d.partij})); //map x domain for partij
  // y.domain([0, d3.max(data, current)]);
  y.domain([0, 50]); //set y domain 0-50

  /* Add a group for the x axis. */
  var xAxis = group
    .append('g')
    .attr('class', 'axis axis-x');

  /* Add a group for the y axis. */
  var yAxis = group
    .append('g')
    .attr('class', 'axis axis-y');

  /* Add bars for the data. */
  var bars = group
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .style('fill', colorBar); //give color by function colorBar

  /* Add select. */
  d3.select('form')
    .style('left', '16px')
    .style('top', '16px')
    .append('select')
    .on('change', onchange)
    .selectAll('option')
    .data(fields)
    .enter()
    .append('option')
    .attr('value', identity)
    .text(sentence)

  /* Trigger the initial resize. */
  onresize();

  /* Listen to future resizes. */
  d3.select(window).on('resize', onresize);

  /* Change after 2s automatically. */
  // var timeout = d3.timeout(change, 2000);

  function onchange(d) { //swith between years in selectmenu function
    var height = parseInt(svg.style('height'), 10) - margin.top - margin.bottom;
    var transition = svg.transition();

    field = this.value;

    y.domain([0, 50]);

    transition.selectAll('.bar')
      .delay(delay)
      .attr('x', barX)
      .attr('y', barY)
      .attr('width', x.bandwidth())
      .attr('height', barHeight)
      .duration(1000)
      .ease(d3.easeBounce) //easeBounce transition


    transition.select('.axis-y')
      .call(d3.axisLeft(y).ticks(10, currentFormat()))
      .selectAll('g')
      .delay(delay)
      .ease(d3.easeBounce);//easeBounce transition

    /* Calculate `height` for a bar. */
    function barHeight(d) {
      return height - barY(d);
    }
  }

  function onresize() {
    /* Get current dimensions. */
    var width = parseInt(svg.style('width'), 10) - margin.left - margin.right;
    var height = parseInt(svg.style('height'), 10) - margin.top - margin.bottom;

    /* Set the scales range. Round to integers. */
    x.rangeRound([0, width]);
    y.rangeRound([height, 0]);

    /* Size the bars. */
    bars
      .attr('x', barX)
      .attr('y', barY)
      .attr('width', x.bandwidth())
      .attr('height', barHeight);


    /* Render x and y. */
    xAxis
      .call(d3.axisBottom(x)).attr('transform', 'translate(0,' + height + ')')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '-0.8em')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '14px');
      
    yAxis.call(d3.axisLeft(y).ticks(10, currentFormat()));

    /* Calculate `height` for a bar. */
    function barHeight(d) {
      return height - barY(d);
    }
  }

//function change detects a change and returns a value
  function change() {
    d3.select('select')
      .property('selectedIndex', fields.length - 1)
      .dispatch('change');


    d3.select('input')
      .property('checked', true)
      .dispatch('change');
  }

  /* Calculate `x` for a bar. */
  function barX(d) {
    return x(state(d));
  }

  function colorBar(d){ //fuction that defines color for the bar based on a partij

    return color(x(state(d)));

  }

  /* Calculate `y` for a bar. */
  function barY(d) {
    return y(current(d));
  }

  function current(d) {
    return d[field];
  }

  function currentFormat(d) {
    return /percent/.test(field) ? formatPercent : formatPopulation;
  }

  function delay(d, i) {
    return i * 10;
  }


  // sorting function between partij and zetels
  function onsort() {
    console.log(field)
    var sort = this.checked ? sortOnZetels : sortOnPartij;
    var x0 = x.domain(data.sort(sort).map(letter)).copy();
    var transition = svg.transition();

    timeout.stop();

    /* Initial sort */
    svg.selectAll('.bar').sort(sortBar);

    /* Move the bars. */
    transition.selectAll('.bar')
      .delay(delay)
      .attr('x', barX0);

    /* Move the labels. */
    transition.select('.axis-x')
      .call(d3.axisBottom(x))
      .selectAll('g')
      .delay(delay);

    function sortBar(a, b) {
      return x0(letter(a)) - x0(letter(b));
    }

    function barX0(d) {
      return x0(letter(d));
    }

    function delay(d, i) {
      return i * 50;
    }
    /* Get the frequency field for a row. */
    function frequency(d) {
      return  current(d);
    }

    function current(d) {
      return d[field];
    }
    /* Sort on frequence. */
    function sortOnZetels(a, b) {
      return frequency(b) - frequency(a);
    }

    /* Sort on letters. */
    function sortOnPartij(a, b) {
      return d3.ascending(letter(a), letter(b));
    }

    /* Get the letter field for a row. */
    function letter(d) {
      return d.partij;
    }
  }

}

/* Clean a row. */
function row(d) {
  var result = {};
  var key;
  var next;
  var value;

  for (key in d) {
    value = d[key];
    next = key.charAt(0).toLowerCase() + key.slice(1);

    if (next === 'partij') {
      value = lower(value).replace(/\b[a-z]/g, upper);
    } else {
      value = Number(value);
    }

    result[next] = value;
  }

  return result;
}

/* Check if this field can be filtered on. */
function applicableField(d) { // removes partij from select menu
  return d !== 'partij';
}

/* Get the state field for a row. */
function state(d) {
  return d.partij;
}

/* To lower case. */
function lower(d) {
  return d.toLowerCase();
}

/* To upper case. */
function upper(d) {
  return d.toUpperCase();
}

/* To sentence case. */
function sentence(d) {
  return d.replace(/[A-Z]/g, replace);
  function replace(d) {
    return ' ' + d.charAt(0).toLowerCase()
  }
}

/* Identity function. */
function identity(d) {
  return d;
}
