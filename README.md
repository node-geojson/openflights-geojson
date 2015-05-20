# openflights-data

Download and reformat [OpenFlights.org](http://openflights.org/) data
into [GeoJSON](http://geojson.org/).

## Usage

```sh
$ npm install -g openflights-data
```

Download airport data, convert to GeoJSON, write to stdout.

Outputs a FeatureCollection of Feature objects with Point geometries.

```sh
$ openflights-airports > airports.geojson
```

Download airport & routes data, convert to GeoJSON, write to stdout.

Outputs a FeatureCollection of Feature objects with LineString geometries.

```sh
$ openflights-routes > routes.geojson
```
