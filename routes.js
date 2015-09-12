#!/usr/bin/env node

var got = require('got'),
    reduce = require('stream-reduce'),
    omit = require('lodash.omit'),
    csv = require('csv-parser'),
    arc = require('arc'),
    argv = require('minimist')(process.argv.slice(2)),
    through = require('through2'),
    geojsonStream = require('geojson-stream');

/**
 * Download and output route database
 *
 * http://openflights.org/data.html#route
 */
got('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat')
    .pipe(csv({
        headers: [
            'id',
            'name',
            'city',
            'country',
            'faa',
            'icao',
            'lat',
            'lng',
            'alt',
            'tz-offset',
            'dst',
            'tz'
        ]
    }))
    .pipe(reduce(function(memo, data) {
        memo[data.id] = data;
        return memo;
    }, {}))
    .on('data', function(airports) {
        got('https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat')
            .pipe(csv({
                headers: [
                    'airline',
                    'airline_id',
                    'src',
                    'src_id',
                    'dst',
                    'dst_id',
                    'codeshare',
                    'stops',
                    'equipment'
                ]
            }))
            .pipe(through.obj(function(row, enc, cb) {
                try {
                    var geometry;
                    if (!(airports[row.dst_id] && airports[row.src_id])) {
                        return cb();
                    }
                    if (row.dst_id === row.src_id) {
                        return cb();
                    }
                    if ([
                        airports[row.dst_id].lng,
                        airports[row.dst_id].lat,
                        airports[row.src_id].lat,
                        airports[row.src_id].lng].some(isNaN)) {
                        throw new Error('bad coord');
                    }
                    if (argv.arc) {
                        geometry = (new arc.GreatCircle({
                            x: parseFloat(airports[row.src_id].lng),
                            y: parseFloat(airports[row.src_id].lat)
                        }, {
                            x: parseFloat(airports[row.dst_id].lng),
                            y: parseFloat(airports[row.dst_id].lat)
                        })).Arc(50).json().geometry;
                    } else {
                        geometry = {
                            type: 'LineString',
                            coordinates: [
                                [ parseFloat(airports[row.src_id].lng),
                                  parseFloat(airports[row.src_id].lat) ],
                                [ parseFloat(airports[row.dst_id].lng),
                                  parseFloat(airports[row.dst_id].lat) ]
                            ]
                        };
                    }
                    this.push({
                        type: 'Feature',
                        properties: omit(row, ['lat', 'lng']),
                        geometry: geometry
                    });
                } catch (e) {
                    console.error('encountered some bad data (some openflights routes are missing destinations)', e);
                }
                cb();
            }))
            .pipe(geojsonStream.stringify())
            .pipe(process.stdout);
    });
