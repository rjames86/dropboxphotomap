// Generated by CoffeeScript 1.8.0
(function() {
  var Breadcrumb, FileList, Page, addMarker, callback, clearMarkers, d, deleteMarkers, getData, getImage, initialize, map, mapOptions, markers, setAllMap, setMarkers;

  d = React.DOM;

  mapOptions = {
    zoom: 2,
    center: new google.maps.LatLng(34.978969, -40.910118)
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  markers = [];

  initialize = function() {
    return getData();
  };

  callback = function(data, inc_dir) {
    return setMarkers(map, data.contents, inc_dir);
  };

  getData = function(inc_dir) {
    $("[data-path-name='" + inc_dir + "']").css('display', 'inline');
    deleteMarkers();
    return $.ajax({
      url: '/dropbox_photos/get_photos',
      data: {
        dir: inc_dir
      },
      type: 'GET',
      success: function(data) {
        return callback(data, inc_dir);
      }
    });
  };

  addMarker = function(location, photo_path) {
    var contentstring, infowindow, marker;
    contentstring = "<div id=\"content\"><img src=\"/dropbox_photos/get_thumbnail?filename=" + photo_path + "\"></img></div>";
    marker = new google.maps.Marker({
      position: location,
      map: map
    });
    infowindow = new google.maps.InfoWindow({
      content: contentstring
    });
    google.maps.event.addListener(marker, 'click', (function() {
      return infowindow.open(map, marker);
    }));
    return markers.push(marker);
  };

  getImage = function(photo) {
    var image;
    return image = {
      url: "/dropbox_photos/get_thumbnail?filename=" + photo,
      size: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 32)
    };
  };

  setAllMap = function(map) {
    var marker, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = markers.length; _i < _len; _i++) {
      marker = markers[_i];
      _results.push(marker.setMap(map));
    }
    return _results;
  };

  clearMarkers = function() {
    return setAllMap(null);
  };

  deleteMarkers = function() {
    clearMarkers();
    map.setCenter(mapOptions.center);
    map.setZoom(mapOptions.zoom);
    return markers = [];
  };

  setMarkers = function(map, locations, inc_dir) {
    var location, myLatLng, photo, _i, _len;
    for (_i = 0, _len = locations.length; _i < _len; _i++) {
      photo = locations[_i];
      location = photo['photo_info']['lat_long'];
      if (location === null) {
        continue;
      }
      myLatLng = new google.maps.LatLng(location[0], location[1]);
      addMarker(myLatLng, photo.path);
    }
    return $("[data-path-name='" + inc_dir + "']").hide();
  };

  google.maps.event.addDomListener(window, 'load', initialize);

  Breadcrumb = React.createClass({
    getDefaultProps: function() {
      return {
        onSelect: function() {}
      };
    },
    createLine: function(line, index) {
      var clean_name;
      if (line === '/') {
        clean_name = 'Home';
      } else {
        clean_name = line.replace(/^.*[\\\/]/, '');
      }
      return d.li({}, d.a({
        onClick: (function(_this) {
          return function() {
            return _this.props.onSelect(line, index);
          };
        })(this)
      }, clean_name));
    },
    render: function() {
      return d.ul({
        className: "breadcrumb"
      }, this.props.filelist.map((function(_this) {
        return function(item, i) {
          return _this.createLine(item, i);
        };
      })(this)));
    }
  });

  FileList = React.createClass({
    getInitialState: function() {
      return {
        filelist: [],
        previousDirs: ['/'],
        dir: '/'
      };
    },
    getList: function(dir) {
      return $.ajax({
        url: "/dropbox_photos/listdir",
        type: 'GET',
        data: {
          dir: dir
        },
        success: ((function(_this) {
          return function(result) {
            if (_this.isMounted()) {
              return _this.setState({
                filelist: result.contents
              });
            }
          };
        })(this))
      });
    },
    componentDidMount: function() {
      this.getList(this.state.dir);
    },
    componentWillUpdate: function(nextProps, nextState) {
      var current_dir, previousDirs;
      if (this.state.dir !== nextState.dir) {
        if (nextState.previousDirs.length > this.state.previousDirs.length) {
          current_dir = this.state.dir;
          previousDirs = this.state.previousDirs;
          previousDirs.push(current_dir);
          this.setState({
            previousDirs: previousDirs
          });
        } else {
          this.setState({
            previousDirs: nextState.previousDirs
          });
        }
        this.setState({
          dir: nextState.dir
        });
        this.getList(nextState.dir);
      }
    },
    lineItem: function(entry) {
      return d.li({
        className: "list-group-item"
      }, d.span({
        onClick: (function(_this) {
          return function() {
            var previousDirs;
            previousDirs = _this.state.previousDirs;
            previousDirs.push(entry.path);
            return _this.setState({
              dir: entry.path,
              previousDirs: previousDirs
            });
          };
        })(this)
      }, entry.path), d.button({
        className: "btn btn-info",
        onClick: (function(_this) {
          return function() {
            return getData(entry.path);
          };
        })(this)
      }, "Go!"), d.div({
        className: "loading",
        "data-path-name": entry.path
      }, d.span({
        className: "glyphicon glyphicon-refresh glyphicon-refresh-animate"
      }, "")));
    },
    render: function() {
      return d.div({}, Breadcrumb({
        filelist: this.state.previousDirs,
        onSelect: (function(_this) {
          return function(item, index) {
            var previousDirs;
            previousDirs = _this.state.previousDirs;
            return _this.setState({
              dir: item,
              previousDirs: previousDirs.slice(0, +index + 1 || 9e9)
            });
          };
        })(this)
      }), d.ul({
        className: "list-group",
        id: "filelist"
      }, this.state.filelist.map(this.lineItem)));
    }
  });

  Page = React.createClass({
    render: function() {
      return d.div({
        className: "container"
      }, d.div({
        className: "row"
      }, d.div({
        className: "col-md-9",
        "role": "main"
      }, FileList({})), d.div({
        className: "col-md-9",
        "role": "main"
      }, d.p({}, "Click on a folder name to navigate into it. Click Go! to see the containing photos on a map"))));
    }
  });

  $(function() {
    return React.render(React.createElement(Page), document.getElementById('container'));
  });

}).call(this);
