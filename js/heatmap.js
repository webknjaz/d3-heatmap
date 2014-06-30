/*
* Write your heatmap widget in this file!
*
* The widget should support AT LEAST these options:
*
* @ lowColor  : the color for lowest values
* @ highColor : the color for highest values
* @ dayClass  : the CSS class for day elements
* @ monthClass: the CSS class for month title elements
* @ year      : the year to display
* @ width     : widget width
* @ height    : widget height
* @ cellSize  : the size of a single day element
* @ container : the element to render to
* @ data      : the data to render
*
* The widget should provide AT LEAST the following API:
*
* @ A constructor that will render the widget when it's called. It must work
* @ when provided any number of the options above (the options that are not
* @ provided, will fall back on defaults.)
* @ A "refresh" function that can also be called with any number of the options
* @ above and will re-render the widget accordingly
*
* Note:
* - Rendering the widget must work even if there is no data provided
* - All options except "data" must have default fallback options
* - The widget must be a closed object so that several heatmaps can be generated
*   on one page without affecting each-other
* - You MAY NOT use any existing heatmap implementation
* */
/* Widgets - Heatmap class */
(function(wg) {
    'use strict'

    var _months = [ 'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'Augest', 'September', 'October', 'November',
                    'December'];

    function merge_args(obj1, obj2){
        var obj3 = {};

        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }

        for (var attrname in obj2) {
            if (obj2[attrname] === null || obj2[attrname] === [] ||
                obj2[attrname] === {} || (typeof obj2[attrname] === 'string' &&
                                                obj2[attrname].trim() === ''))
                continue;
            obj3[attrname] = obj2[attrname];
        }

        return obj3;
    }

    function getWeekNo(date) {

        var day = date.getDate();

        //get weekend date
        day += 6 - date.getDay();

        return Math.ceil(parseFloat(day) / 7);
    }

    function getColorScale(lowColor, highColor) {
        lowColor = d3.rgb(lowColor);
        highColor = d3.rgb(highColor);

        return d3.interpolate(lowColor, highColor);
    }

    var args_def = {
        lowColor  : d3.rgb(190, 219, 57),       // the color for lowest values
        highColor : d3.rgb(255, 83, 71),        // the color for highest values
        dayClass  : 'heatmap-day',              // the CSS class for day elems
        monthClass: 'heatmap-month',            // the CSS class for month title
        year      : (new Date()).getFullYear(), // the year to display
        width     : 1430,                       // widget width
        height    : 120,                        // widget height
        cellSize  : 15,                         // the size of a single day elem
        container : '#heatmap-widget',          // id of the element 2 render to
        data      : []                          // the data to render
    };

    // Heatmap class constructor
    function Heatmap(args) {
        var _self = this;

        var sync = _self._init(args, function (params) {
            _self.params = params;
            _self.saveParams(params);

            _self.colorScale = getColorScale(params.lowColor, params.highColor);

            _self.maxval = d3.max(d3.values(params.data));

            _self.svg_container = _self._getContainer(params.container);

            _self._render(_self);
        } );

        if ( sync ) {
            console.log('loading data asyncronously');
        } else {
            console.log('data has been taken from args');
        }

        for (var attr in _self) {
            this[attr] = _self[attr];
        }
    }

    Heatmap.prototype._init = function (args, callback) {
        var params;

        if (this.params) {
            params = merge_args(this.params, args);
        } else {
            params = merge_args(args_def, args);
        }

        params.lowColor = d3.rgb(params.lowColor);

        params.highColor = d3.rgb(params.highColor);

        if (!args.data && params.dataurl) {
            d3.json(params.dataurl, function(error, res) {
              var data = d3.nest()
                          .key(function(d) { return d[0].data; })
                          .rollup(function(d) { return d[0][1].data; })
                          .map(res.values);

              params.data = data;

              callback(params);
            });

            return false;   // async
        }

        callback(params);
        return true;        // sync
    }

    Heatmap.prototype.saveParams = function (params) {
        console.log('saving params to', this);
        this.params = params;
    }
    Heatmap.prototype._render = function (heatmap) {
        var params = heatmap.params;
        heatmap.svg_container.selectAll('*').remove();  // needed for refresh

        this.svg = heatmap.svg_container.append("svg")
                .attr("width", params.width)
                .attr("height", params.height);

        var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        month = d3.time.format("%m"),
        popup = d3.time.format('%a %b %e %Y: '),
        key_format = d3.time.format('%Y-%m-%dT%X');

        var mon = this.svg.selectAll(".month")
                    .data(function(d) { // iterate months of the year
                        return d3.range(1, 13);
                    })
                    .enter().append("g")
                    .attr("class", function(m) { return "mon mon-" + m; });
        
        mon.append('text')
            .text(function(m) { return _months[m-1]; })
            .attr('class', params.monthClass)
            .style("text-anchor", "middle")
            .attr('font-family', 'monospace')
            .attr('x', function(m) { return ((m-1)*8 + 3.5)*params.cellSize; })
            .attr('y', 25);
        
        var rect = mon.selectAll(".day")
                    .data(function(d) { // iterate all days within a month
                        return d3.time.days(new Date(params.year, d - 1, 1), 
                                            new Date(params.year, d, 1));
                    })
                    .enter().append('rect')
                    .attr('class', params.dayClass)
                    .attr('width', params.cellSize)
                    .attr('height', params.cellSize)
                    .attr('x', function(d) {
                        return (parseInt(day(d)) +
                            (parseInt(month(d)) - 1) * 8) * params.cellSize;
                    })
                    .attr('y', function(d) {
                        return (getWeekNo(d) - 1 + 2) * params.cellSize;
                    })
                    .attr('style', function(d) {
                        return 'fill: ' + heatmap.colorScale(
                            params.data[key_format(d)] / heatmap.maxval) + ';';
                    });
        
        rect.append('title')
            .text(function(d) {
                var val = params.data[key_format(d)];
                return popup(d) + (typeof val !== 'undefined' ? val : 'NO DATA');
            });
    }

    Heatmap.prototype._getContainer = function (container) {
        if (this.svg_container) {
            return this.svg_container;
        }

        var svg;
        try {
            svg = d3.select('body').select(container);
            // check whether such node exists
            if ( svg.empty() ) {
                console.log(container + ' not found');

                // trying to fix the container name to match an id selector
                if ( container[0] !== '#' ) {
                    console.log('params.container is a string, prepending \
                                    "#"');
                    container = '#' + container;
                }

                svg = d3.select('body').select(container);
            }
        } catch(e) {
            if (e instanceof DOMException) {
                svg = d3.select(container);
                // check whether such node exists
                if ( svg.empty() ) {
                    console.log(container + ' not found');

                    // fallback to default container
                    console.log('params.container is not a string, using \
                                    default');
                    container = args_def.container;

                    svg = d3.select('body').select(container);
                }
            } else {
                throw e;
            }
        } finally {
            // If still failing, create the node
            if ( svg.empty() ) {
                console.log(container + ' not found');
                svg = d3.select('body').append('div')
                        .attr('id', args_def.container.substr(1))
                        .append('div')
                        .attr('id', container.substr(1));
            }
        }

        return svg;
    }


    // Can be called with any number of the options and re-renders the widget
    // accordingly
    Heatmap.prototype.refresh = function(args){
        var _self = this;

        var sync = _self._init(args, function (params) {
            _self.params = params;
            _self.saveParams(params);

            _self.colorScale = getColorScale(params.lowColor, params.highColor);

            _self.maxval = d3.max(d3.values(params.data));

            _self.svg_container = _self._getContainer(params.container);

            _self._render(_self);
        } );

        if ( sync ) {
            console.log('loading data asyncronously');
        } else {
            console.log('data has been taken from args');
        }

        for (var attr in _self) {
            this[attr] = _self[attr];
        }

        return this;
    }

    wg.Heatmap = Heatmap;

}(widgets))
