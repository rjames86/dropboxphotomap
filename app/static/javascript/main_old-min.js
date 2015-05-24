var mapOptions = {
zoom: 3,
center: new google.maps.LatLng(41.850033, -87.6500523)
}
var map = new google.maps.Map(document.getElementById('map-canvas'),
                            mapOptions);

function initialize() {


  getData();
}

/**
 * Data for the markers consisting of a name, a LatLng and a zIndex for
 * the order in which these markers should display on top of each
 * other.
 */
// var beaches = [
//   ['Bondi Beach', -33.890542, 151.274856, 4],
//   ['Coogee Beach', -33.923036, 151.259052, 5],
//   ['Cronulla Beach', -34.028249, 151.157507, 3],
//   ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
//   ['Maroubra Beach', -33.950198, 151.259302, 1]
// ];


function callback(data){
    return setMarkers(map, data.contents)
}

function getData(){
    $.ajax({
        url: '/get_photos',
        data: {dir: '/Pictures/Picture a day'},
        type: 'GET',
        success: callback
    })
}


function setMarkers(map, locations) {
  // Add markers to the map

  // Marker sizes are expressed as a Size of X,Y
  // where the origin of the image (0,0) is located
  // in the top left of the image.

  // Origins, anchor positions and coordinates of the marker
  // increase in the X direction to the right and in
  // the Y direction down.
  // var image = {
  //   url: 'images/beachflag.png',
  //   // This marker is 20 pixels wide by 32 pixels tall.
  //   size: new google.maps.Size(20, 32),
  //   // The origin for this image is 0,0.
  //   origin: new google.maps.Point(0,0),
  //   // The anchor for this image is the base of the flagpole at 0,32.
  //   anchor: new google.maps.Point(0, 32)
  // };
  // Shapes define the clickable region of the icon.
  // The type defines an HTML &lt;area&gt; element 'poly' which
  // traces out a polygon as a series of X,Y points. The final
  // coordinate closes the poly by connecting to the first
  // coordinate.
  // var shape = {
  //     coords: [1, 1, 1, 20, 18, 20, 18 , 1],
  //     type: 'poly'
  // };
  for (var i = 0; i < locations.length; i++) {
    // var beach = locations[i];
    var photo = locations[i]
    var location = photo['photo_info']['lat_long']
    if (location === null){
        continue;
    }
    var myLatLng = new google.maps.LatLng(location[0], location[1]);
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        // icon: image,
        // shape: shape,
        // title: beach[0],
        // zIndex: beach[3]
    });
  }
}

google.maps.event.addDomListener(window, 'load', initialize);


