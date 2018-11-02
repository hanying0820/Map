<?php
    include_once('db_vars.inc');
    
    $link = new mysqli($DB_SERVER, $DB_USER, $DB_PASS, $DB_NAME);

    if ($link->connect_error) {        
        die("Connection failed:".$link->connect_error);
        exit();
    }
    
    mysqli_query($link, 'SET NAMES utf8');
    
    $query = "SELECT * FROM node LEFT JOIN (SELECT nodes.V_id, nodes.N_id, nodes.Number FROM nodes, vector WHERE vector.Id = nodes.V_id) AS x ON node.Id = x.N_id ORDER BY x.V_id, x.Number";
    $result = mysqli_query($link, $query);
    
    $rows = array();
    if ($result && mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            array_push($rows, $row);
        }
    }
    
    $rows_json = json_encode($rows);
    
    $query = "SELECT * FROM trafficlight LEFT JOIN lights ON trafficlight.Id = lights.L_id";
    $result = mysqli_query($link, $query);
    
    $lights = array();
    if ($result && mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            array_push($lights, $row);
        }
    }
    
    $lights_json = json_encode($lights);
    
    $query = "SELECT * FROM lights";
    $result = mysqli_query($link, $query);
    
    $lightInfos = array();
    if ($result && mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            array_push($lightInfos, $row);
        }
    }
    
    $lightInfos_json = json_encode($lightInfos);
    
    $qeury = "SELECT * FROM location";
    $result = mysqli_query($link, $qeury);
    
    $locations = array();
    if ($result && mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            array_push($locations, $row);
        }
    }
    
    $locations_json = json_encode($locations);
    
    
    $link->close();    
?>

<html>
  <head>
    <link rel="stylesheet" href="../css/style.css" />
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCu-gycnxKth_quWp-2aH4Ojwn8m7P1060"  type="text/javascript"></script>
    <script>
        function initialize() {
            var map_canvas = document.getElementById('map_canvas');
            var map_options = {
                center: new google.maps.LatLng(22.730042, 120.277737),
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                draggableCursor: 'auto'
            }
 
            var map = new google.maps.Map(map_canvas, map_options);
            
            /* 滑鼠左鍵點選地圖上的位置，顯示座標並標示出最近 Node */
            map.addListener('click', function(event) {
                document.getElementById('lat').innerHTML = event.latLng.lat();
                document.getElementById('lng').innerHTML = event.latLng.lng();
                clickMarker.setPosition(event.latLng);
                clickMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                clickMarker.setMap(this);
                
                var index = findClosedNode(event.latLng);
                if (index != closedNodeIndex) {
                    if (closedNodeIndex != -1) {
                        nodeMarkers[closedNodeIndex].setIcon(closedNodeIcon);
                    }
                    
                    closedNodeIcon = nodeMarkers[index].getIcon();
                    closedNodeIndex = index;
                    
                    nodeMarkers[index].setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
                }                
            });
            
            var locations = JSON.parse('<?php echo $locations_json; ?>');
            for (let i = 0; i < locations.length; i++) {                
                var latLng = new google.maps.LatLng(parseFloat(locations[i].Latitude), parseFloat(locations[i].Longitude));
            
                var locationMarker = new google.maps.Marker({
                    position: latLng,
                    title: locations[i].Id,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
                    map: map
                });
                
                let locationInfoWindow = new google.maps.InfoWindow({
                    content: locations[i].Record_time,
                    position: latLng
                });
                
                locationMarker.addListener('click', function() {
                    locationInfoWindow.open(map, this);
                });
            }
            
            /* light marker */
            var lights = JSON.parse('<?php echo $lights_json; ?>');            
            for (let i = 0; i < lights.length; i++) {
                var latLng = new google.maps.LatLng(parseFloat(lights[i].Latitude), parseFloat(lights[i].Longitude));
            
                var lightMarkerInfoWindow = findLightMarkerInfoWindow(latLng);
                if (lightMarkerInfoWindow != null) {
                    lightMarkerInfoWindow.setContent(lightMarkerInfoWindow.getContent() + '<br>' + lights[i].V_id + ': ' + (lights[i].Direction > 0 ? '+' : '-')); 
                }
                else {
                    lightMarkers[lightMarkers.length] = new google.maps.Marker({
                        position: latLng,
                        title: lights[i].Id,
                        icon: '../src/traffic-light-32.png',
                        map: map
                    });
                    
                    var content = 'Road1: ' + lights[i].Road1 + '<br>Road2: ' + lights[i].Road2 + '<br>L_id: ' + lights[i].Id;
                    if (lights[i].V_id != null) {
                        content += '<br>' + lights[i].V_id + ': ' + (lights[i].Direction > 0 ? '+' : '-');
                    }
                    lightMarkerInfoWindows[lightMarkerInfoWindows.length] = new google.maps.InfoWindow({
                        content: content,
                        position: latLng
                    });
                    
                    lightMarkers[lightMarkers.length - 1].addListener('click', function() {
                        findLightMarkerInfoWindow(this.getPosition()).open(map, this);
                    });
                }
            }
            
            var rows = JSON.parse('<?php echo $rows_json; ?>');            
            var clickedPolyline = new Set();
            var latLngs = new Array();
            for (let i = 0; i < rows.length; i++) {                
                /* node marker */
                var latLng = new google.maps.LatLng(parseFloat(rows[i].Latitude), parseFloat(rows[i].Longitude));
            
                var nodeMarkerInfoWindow = findNodeMarkerInfoWindow(latLng);
                if (nodeMarkerInfoWindow != null) {
                    nodeMarkerInfoWindow.setContent(nodeMarkerInfoWindow.getContent() + '<br>' + rows[i].V_id + ': ' + rows[i].Number);
                }
                else {            
                    var src = (rows[i].IsCross == 1 ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png');                
                    nodeMarkers[nodeMarkers.length] = new google.maps.Marker({
                        position: latLng,
                        title: rows[i].Id,
                        icon: src,
                        map: map
                    });
                
                    var content = 'N_id: ' + rows[i].Id;
                    if (rows[i].V_id != null) {
                        content += '<br>' + rows[i].V_id + ': ' + rows[i].Number;
                    }
                    nodeMarkerInfoWindows[nodeMarkerInfoWindows.length] = new google.maps.InfoWindow({
                        content: content,
                        position: latLng
                    });
                
                    nodeMarkers[nodeMarkers.length - 1].addListener('click', function() {
                        findNodeMarkerInfoWindow(this.getPosition()).open(map, this);
                    });
                }
                
                
                /* polyline */
                latLngs.push(latLng);
                if (i == rows.length - 1 || rows[i].V_id != rows[i + 1].V_id) {
                    polylines[polylines.length] = new google.maps.Polyline({
                        path: latLngs,
                        strokeColor: '#00BBFF',
                        strokeOpacity: 0.8,
                        strokeWeight: 4
                    });
                    
                    let polylineInfoWindow = new google.maps.InfoWindow({
                        content: 'V_id: ' + rows[i].V_id
                    });
                    
                    polylines[polylines.length - 1].setMap(map);
                    
                    google.maps.event.addListener(polylines[polylines.length - 1], 'click', function(event) {
                        if (clickedPolyline.has(this)) {
                            this.setOptions({                            
                                strokeColor: '#00BBFF',
                                strokeOpacity: 0.8,
                                strokeWeight: 4
                            });
                        
                            polylineInfoWindow.close();
                        
                            clickedPolyline.delete(this);
                        }
                        else {                    
                            this.setOptions({                            
                                strokeColor: '#0000FF',
                                strokeOpacity: 1.0,
                                strokeWeight: 6
                            });
                        
                            polylineInfoWindow.setPosition(event.latLng);                    
                            polylineInfoWindow.open(map);
                        
                            clickedPolyline.add(this);
                        }
                    });
                    
                    google.maps.event.addListener(polylines[polylines.length - 1], 'mouseover', function(event) {
                        this.setOptions({                            
                            strokeColor: '#0000FF',
                            strokeOpacity: 1.0,
                            strokeWeight: 6
                        });
                            
                        polylineInfoWindow.setPosition(event.latLng);                    
                        polylineInfoWindow.open(map);
                    });

                    google.maps.event.addListener(polylines[polylines.length - 1], 'mouseout', function(event) {
                        if (!clickedPolyline.has(this)) {
                            this.setOptions({                            
                                strokeColor: '#00BBFF',
                                strokeOpacity: 0.8,
                                strokeWeight: 4
                            });
                        
                            polylineInfoWindow.close();
                        }
                    });
                    
                    latLngs.length = 0;
                }
            }
            
            var nodeControlDiv = document.createElement('div');
            var nodeControl = new SwitchControl(nodeControlDiv, map, 'Node', node);
            nodeControl.index = 1;
            map.controls[google.maps.ControlPosition.LEFT_CENTER].push(nodeControlDiv);                  
            
            var vectorControlDiv = document.createElement('div');
            var vectorControl = new SwitchControl(nodeControlDiv, map, 'Vector', vector);
            vector.index = 2;
            map.controls[google.maps.ControlPosition.LEFT_CENTER].push(vectorControlDiv);                  
        
            var lightControlDiv = document.createElement('div');
            var lightControl = new SwitchControl(nodeControlDiv, map, 'Light', light);
            lightControl.index = 3;
            map.controls[google.maps.ControlPosition.LEFT_CENTER].push(lightControlDiv);                  
        
        }
        function findNodeMarkerInfoWindow(latlng) {
            for (let i = 0; i < nodeMarkerInfoWindows.length; i++) {
                if (nodeMarkerInfoWindows[i].getPosition().equals(latlng)) {
                    return nodeMarkerInfoWindows[i];
                }                    
            }
            
            return null;
        }
        function findLightMarkerInfoWindow(latlng) {
            for (let i = 0; i < lightMarkerInfoWindows.length; i++) {
                if (lightMarkerInfoWindows[i].getPosition().equals(latlng)) {
                    return lightMarkerInfoWindows[i];
                }
            }
            
            return null;
        }
        function rad(d) {
            return d * Math.PI / 180.0;
        }
        function getDistance(latlng1, latlng2) {
            var EARTH_RADIUS = 6378.137;
            var radLat1 = rad(latlng1.lat());
            var radLat2 = rad(latlng2.lat());
            var a = radLat1 - radLat2;
            var b = rad(latlng1.lng()) - rad(latlng2.lng());
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) 
                + Math.cos(radLat1) * Math.cos(radLat2)
                * Math.pow(Math.sin(b / 2), 2)));
            s = s * EARTH_RADIUS;
            s = Math.round(s * 10000) / 10000;
            return s;
        }
        function findClosedNode(latlng) {
            var min_index;
            var min_distance = 100000;
            for (let i = 0; i < nodeMarkers.length; i++) {
                var distance = getDistance(latlng, nodeMarkers[i].getPosition());
                if (distance < min_distance){
                    min_index = i;
                    min_distance = distance;
                }
            }
            
            return min_index;
        }
        function light() {
            var isVisible = lightMarkers[0].getVisible();
            for (let i = 0; i < lightMarkers.length; i++) {
                lightMarkers[i].setVisible(!isVisible);
            }
        }
        function node() {
            var isVisible = nodeMarkers[0].getVisible();
            for (let i = 0; i < nodeMarkers.length; i++) {
                nodeMarkers[i].setVisible(!isVisible);
            }
        }
        function vector() {
            var isVisible = polylines[0].getVisible();
            for (let i = 0; i < polylines.length; i++) {
                polylines[i].setVisible(!isVisible);
            }
        }        
        function SwitchControl(controlDiv, map, name, func) {

            // Set CSS for the control border.
            var controlUI = document.createElement('div');
            controlUI.style.backgroundColor = '#fff';
            controlUI.style.border = '2px solid #fff';
            controlUI.style.borderRadius = '3px';
            controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
            controlUI.style.cursor = 'pointer';
            controlUI.style.marginLeft = '12px';
            controlUI.style.marginBottom = '12px';
            controlUI.style.textAlign = 'center';
            controlUI.title = '切換顯示 ' + name;
            controlDiv.appendChild(controlUI);
    
            // Set CSS for the control interior.
            var controlText = document.createElement('div');
            controlText.style.color = 'rgb(25,25,25)';
            controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
            controlText.style.fontSize = '16px';
            controlText.style.lineHeight = '38px';
            controlText.style.paddingLeft = '5px';
            controlText.style.paddingRight = '5px';
            controlText.innerHTML = name;
            controlUI.appendChild(controlText);
    
            // Setup the click event listeners: simply set the map to Chicago.
            controlUI.addEventListener('click', func);
        }
        function addMarker() {            
            var road1 = document.getElementById('road1');
            var split = road1.split(" ");
            
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(parseFloat(split[0]), parseFloat(split[1])),
                title: lights[i].Id,
                icon: '../src/traffic-light-32.png',
                map: map
            });
            
            var infoWindow = new google.maps.InfoWindow({
                content: 'Lat: ' + split[0] + '<br>Lng: ' + split[1],
                position: new google.maps.LatLng(parseFloat(split[0]), parseFloat(split[1])),                
            });
            
            marker.addListener('click', function() {
                infoWindow.open(map, this);
            });
        }
        function addLight() {
            if (clickMarker.getPosition() == null) {
                alert('請選擇座標！！');
                return;
            }
            
            var road1 = document.getElementById('road1');
            var road2 = document.getElementById('road2');
            if (road1.value == '' || road2.value == '') {
                alert('請輸入 Road！');
                return;
            }
            
            alert('新增 Light 資料如下: \nRoad1: ' + road1.value + 
                '\nRoad2: ' + road2.value + 
                '\nLatitude: ' + clickMarker.getPosition().lat() + 
                '\nLongitude: ' + clickMarker.getPosition().lng());
            
            var form = document.createElement('form');
            form.setAttribute('method', 'post');
            form.setAttribute('action', 'insertData.php');            
            
            var hidden = document.createElement('input');
            hidden.setAttribute('type', 'hidden');
            hidden.setAttribute('name', 'light_insert');
            hidden.setAttribute('value', road1.value + ' ' + road2.value + ' ' + clickMarker.getPosition().lat() + ' ' + clickMarker.getPosition().lng());

            form.appendChild(hidden);
            document.body.appendChild(form);
            form.submit();
        }
        function addNode() {
            if (clickMarker.getPosition() == null) {
                alert('請選擇座標！！');
                return;
            }
            
            var nid = document.getElementById('nid');
            if (nid.value == '') {
                alert('請輸入 N_id！');
                return;
            }
            
            var isCross = document.getElementById('isCross');
            
            var r = confirm('新增 Node 資料如下: \nN_id: ' + nid.value +
                '\nIsCross: ' + (isCross.value == '' ? '0' : '1') + 
                '\nLatitude: ' + clickMarker.getPosition().lat() + 
                '\nLongitude: ' + clickMarker.getPosition().lng());
            
            if (!r) {
                return;
            }
            
            var form = document.createElement('form');
            form.setAttribute('method', 'post');
            form.setAttribute('action', 'insertData.php');            
            
            var hidden = document.createElement('input');
            hidden.setAttribute('type', 'hidden');
            hidden.setAttribute('name', 'node_insert');
            hidden.setAttribute('value', nid.value + ' ' + (isCross.value == '' ? '0' : '1') + ' ' + clickMarker.getPosition().lat() + ' ' + clickMarker.getPosition().lng());

            form.appendChild(hidden);
            document.body.appendChild(form);
            form.submit();
        }
    </script>
    <script>
        var clickMarker = new google.maps.Marker();
        
        var lightMarkers = new Array();
        var nodeMarkers = new Array();
        var polylines = new Array();
        var closedNodeIndex = -1;
        var closedNodeIcon;
        
        var nodeMarkerInfoWindows = new Array();
        var lightMarkerInfoWindows = new Array();
        
        google.maps.event.addDomListener(window, 'load', initialize);
    </script>
  </head>
  <body>
    <div class="wrap">        
      <div class="info">    
        <div class="insert_submit">        
          <input type="button" onclick="addMarker()" value="Add Marker">    
          <input type="button" onclick="addNode()" value="Add Node">              
        </div>
        <div class="latlng">
          <table>            
            <tr><td>Latitude:</td><td id="lat"></td></tr>
            <tr><td>Longitude:</td><td id="lng"></td></tr>
          </table>
        </div>
        <div class="insert_light">
          <input type="text" id="road1" placeholder="Road1" value="" />
          <input type="text" id="road2" placeholder="Road2" value="" />
        </div>
        <div class="insert_node">
          <input type="text" id="nid" placeholder="N_id" value="" />
          <input type="text" id="isCross" placeholder="isCross" value="" />
        </div>
      </div>
      <div id="map_canvas">
      </div>
    </div>
  </body>
</html>