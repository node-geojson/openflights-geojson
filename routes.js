#!/usr/bin/env node

var got = require('got'),
    reduce = require('stream-reduce'),
    omit = require('lodash.omit'),
    csv = require('csv-parser'),
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
                    this.push({
                        type: 'Feature',
                        properties: omit(row, ['lat', 'lng']),
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [ parseFloat(airports[row.src_id].lng),
                                  parseFloat(airports[row.src_id].lat) ],
                                [ parseFloat(airports[row.dst_id].lng),
                                  parseFloat(airports[row.dst_id].lat) ]
                            ]
                        }
                    });
                } catch (e) {
                    console.error('encountered some bad data (some openflights routes are missing destinations)', e);
                }
                cb();
            }))
            .pipe(geojsonStream.stringify())
            .pipe(process.stdout);
    });
