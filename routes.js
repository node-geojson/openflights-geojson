#!/usr/bin/env node

var got = require('got'),
    reduce = require('stream-reduce'),
    csv = require('csv-parser'),
    through = require('through2'),
    geojsonStream = require('geojson-stream');

/**
 * Download and output route database
 *
 * http://openflights.org/data.html#route
 */
got('https://sourceforge.net/p/openflights/code/HEAD/tree/openflights/data/airports.dat?format=raw')
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
        got('https://sourceforge.net/p/openflights/code/HEAD/tree/openflights/data/routes.dat?format=raw')
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
                        properties: row,
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
