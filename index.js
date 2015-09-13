/* global mapboxgl */
var React = require('react');

var App = React.createClass({
  getInitialState() {
    return {
      focus: null,
      pendingFocus: null
    };
  },
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoidG1jdyIsImEiOiJIZmRUQjRBIn0.lRARalfaGHnPdRcc-7QZYQ';
    this.map = new mapboxgl.Map({
      container: React.findDOMNode(this.refs.map),
      style: 'mapbox://styles/tmcw/ciehp1zk500d6srm3mp3f4x09',
      center: [-74.50, 40],
      minZoom: 2,
      maxZoom: 8.99,
      zoom: 3
    });
    this.map.on('click', this.onMapClick);
  },
  onMapClick(e) {
    this.map.featuresAt([e.point.x, e.point.y], {
      layer: 'airports',
      radius: 10
    }, this.onMapClickResults);
  },
  onMapClickResults(err, res) {
    if (!err && res.length) {
      this.setState({
        pendingFocus: res[0]
      });
    }
  },
  usePendingFocus() {
    this.setState({
      focus: this.state.pendingFocus,
      pendingFocus: null
    });
  },
  discardPendingFocus() {
    this.setState({ pendingFocus: null });
  },
  discardFocus() {
    this.setState({ focus: null });
  },
  render() {
    if (this.map) {
      if (this.state.focus) {
        this.map.setFilter('routes-arc4',
          ['any',
            ['==', 'dst_id', this.state.focus.properties.id],
            ['==', 'src_id', this.state.focus.properties.id]]);
      } else {
        this.map.setFilter('routes-arc4', null);
      }
    }
    return (<div>
      <div ref='map' className='map' />
      {this.state.focus &&
        <div className='focus'>
          Showing in/out of {this.state.focus.properties.name}
          <a onClick={this.discardFocus} className='button'>
            X
          </a>
        </div>}
      {this.state.pendingFocus &&
        <div className='overlay'>
          <a onClick={this.usePendingFocus} className='button'>
            Focus on {this.state.pendingFocus.properties.name}
          </a>
          <a onClick={this.discardPendingFocus} className='button'>
            X
          </a>
        </div>}
    </div>);
  }
});


React.render(<App />, document.getElementById('app'));
