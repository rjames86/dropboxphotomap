d = React.DOM

mapOptions =
    zoom: 2,
    center: new google.maps.LatLng 34.978969, -40.910118

map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions)
markers = []
# infowindow =

initialize = ->
    getData();

callback = (data, inc_dir) ->
    return setMarkers map, data.contents, inc_dir

getData = (inc_dir) ->
    $("[data-path-name='#{inc_dir}']").css 'display', 'inline'
    deleteMarkers()
    $.ajax
        url: '/dropbox_photos/get_photos',
        data: {dir: inc_dir}
        type: 'GET',
        success: (data) ->
            callback data, inc_dir

addMarker = (location, photo_path) ->
    contentstring = """<div id="content"><img src="/dropbox_photos/get_thumbnail?filename=#{photo_path}"></img></div>"""
    marker = new google.maps.Marker
        position: location
        map: map
    infowindow = new google.maps.InfoWindow
        content: contentstring
    google.maps.event.addListener marker, 'click', (->
        # if infowindow
        #     infowindow.close()
        infowindow.open(map, marker)
    )
    markers.push(marker)


getImage = (photo) ->

    image =
        url: "/dropbox_photos/get_thumbnail?filename=#{photo}"
        # This marker is 20 pixels wide by 32 pixels tall.
        size: new google.maps.Size(32, 32)
        # The origin for this image is 0,0.
        origin: new google.maps.Point(0,0)
        # The anchor for this image is the base of the image at 0,32.
        anchor: new google.maps.Point(0, 32)


setAllMap = (map) ->
    for marker in markers
        marker.setMap(map)

clearMarkers = ->
    setAllMap(null)

deleteMarkers = ->
    clearMarkers()
    map.setCenter(mapOptions.center)
    map.setZoom(mapOptions.zoom)
    markers = []

setMarkers = (map, locations, inc_dir) ->
    for photo in locations
        location = photo['photo_info']['lat_long']
        if location == null
            continue
        myLatLng = new google.maps.LatLng location[0], location[1]
        addMarker(myLatLng, photo.path)
    $("[data-path-name='#{inc_dir}']").hide()

google.maps.event.addDomListener(window, 'load', initialize);


Breadcrumb = React.createClass
    getDefaultProps: ->
        onSelect: ->

    createLine: (line, index) ->
        if line == '/'
        then clean_name = 'Home'
        else clean_name = line.replace /^.*[\\\/]/, ''
        d.li {},
            d.a {
                onClick: =>
                    @props.onSelect line, index
            }, clean_name

    render: ->
        d.ul {className: "breadcrumb"},
            @props.filelist.map (item, i) => @createLine(item, i)


FileList = React.createClass
    getInitialState: ->
        filelist: []
        previousDirs: ['/']
        dir: '/'

    getList: (dir) ->
        $.ajax
            url: "/dropbox_photos/listdir"
            type: 'GET'
            data: {dir: dir}
            success: ( (result) =>
                if @isMounted()
                    @setState filelist: result.contents
            )

    componentDidMount: ->
        @getList @state.dir
        return

    componentWillUpdate: (nextProps, nextState) ->
        if @state.dir != nextState.dir
            if nextState.previousDirs.length > @state.previousDirs.length
                current_dir = @state.dir
                previousDirs = @state.previousDirs
                previousDirs.push current_dir
                @setState
                    previousDirs: previousDirs
            else
                @setState
                    previousDirs: nextState.previousDirs
            @setState
                dir: nextState.dir
            @getList nextState.dir
        return

    lineItem: (entry) ->
        d.li {className: "list-group-item"},
            d.span {
                onClick: =>
                    previousDirs = @state.previousDirs
                    previousDirs.push entry.path
                    @setState
                        dir: entry.path
                        previousDirs: previousDirs
                }, entry.path
            d.button {className: "btn btn-info", onClick: => getData entry.path}, "Go!"
            d.div {className: "loading", "data-path-name": entry.path},
                d.span {className: "glyphicon glyphicon-refresh glyphicon-refresh-animate"}, ""




    render: ->
        d.div {},
            Breadcrumb
                filelist: @state.previousDirs
                onSelect: (item, index) =>
                    previousDirs = @state.previousDirs
                    @setState
                        dir: item
                        previousDirs: previousDirs[0..index]
            d.ul {className: "list-group", id: "filelist"},
                @state.filelist.map @lineItem

Page = React.createClass
    render: ->
        d.div {className: "container"},
            d.div {className: "row"},
                d.div {className: "col-md-9", "role": "main"},
                    FileList({})
                d.div {className: "col-md-9", "role": "main"},
                    d.p {}, "Click on a folder name to navigate into it. Click Go! to see the containing photos on a map"


$ ->
  React.render(
    React.createElement(Page),
    document.getElementById('container')
    )

