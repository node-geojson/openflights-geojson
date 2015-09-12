# openflights-geojson

Download and reformat [OpenFlights.org](http://openflights.org/) data
into [GeoJSON](http://geojson.org/).

## Usage

```sh
$ npm install -g openflights-geojson
```

Download airport data, convert to GeoJSON, write to stdout.

Outputs a FeatureCollection of Feature objects with Point geometries.

```sh
$ openflights-airports > airports.geojson
```

Interpolate flight paths with a great circle arc algorithm ([springmeyer/arc](https://github.com/springmeyer/arc.js).

```sh
$ openflights-airports --arc > airports.geojson
```

Download airport & routes data, convert to GeoJSON, write to stdout.

Outputs a FeatureCollection of Feature objects with LineString geometries.

```sh
$ openflights-routes > routes.geojson
```
