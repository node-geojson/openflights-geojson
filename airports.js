#!/usr/bin/env node

var got = require('got'),
    csv = require('csv-parser'),
    through = require('through2'),
    geojsonStream = require('geojson-stream');

/**
 * Download and output airport database
 *
 * http://openflights.org/data.html#airport
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
    .pipe(through.obj(function(row, enc, cb) {
        this.push({
            type: 'Feature',
            properties: row,
            geometry: {
                type: 'Point',
                coordinates: [
                    parseFloat(row.lng),
                    parseFloat(row.lat)
                ]
            }
        });
        cb();
    }))
    .pipe(geojsonStream.stringify())
    .pipe(process.stdout);
