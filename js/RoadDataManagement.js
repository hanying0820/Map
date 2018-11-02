import Marker from './Marker.js';
import InfoWindow from './InfoWindow.js';
import LatLng from './LatLng.js';


class RoadDataManagement {
  constructor(map) {
    let self = this;

    self.map = map;

    self.lightMarkers = [];
    self.nodeMarkers = [];
    self.polylines = [];
    self.closedNodeIndex = -1;

    self.nodeMarkerInfoWindows = [];
    self.lightMarkerInfoWindows = [];

    // AJAX
    let xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : ActiveXObject("Microsoft.XMLHTTP");
    xmlHttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        self.data = JSON.parse(this.responseText);
        self.initRoadData();
      }
    };

    xmlHttp.open('GET', 'php/getRoadData.php', true);
    xmlHttp.send();
  }

  // 初始化道路資料
  initRoadData() {
    let self = this;
    
    // lights
    for (const light of self.data.lights) {
      let latLng = new LatLng(parseFloat(light.Latitude), parseFloat(light.Longitude));

      let lightMarkerInfoWindow = self.findLightMarkerInfoWindow(latLng);
      if (lightMarkerInfoWindow != null) {
        lightMarkerInfoWindow.setContent(lightMarkerInfoWindow.getContent() + '<br>' + light.V_id + ': ' + (light.Direction > 0 ? '+' : '-')); 
      } else {
        self.lightMarkers.push(new Marker({
          position: latLng,
          icon: 'src/traffic-light-32.png',
          title: light.Id,
          map: self.map
        }));

        let content = 'Road1: ' + light.Road1 + '<br>Road2: ' + light.Road2 + '<br>L_id: ' + light.Id;
        if (light.V_id != null) {
          content += '<br>' + light.V_id + ': ' + (light.Direction > 0 ? '+' : '-');
        }

        self.lightMarkerInfoWindows.push(new InfoWindow({
          content: content,
          position: latLng
        }));

        self.lightMarkers[self.lightMarkers.length - 1].addListener('click', function() {
          self.findLightMarkerInfoWindow(this.getPosition()).open(self.map, this);
        });
      }
    }

    // rows
    for (const row of self.data.rows) {
      let latLng = new LatLng(parseFloat(row.Latitude), parseFloat(row.Longitude))

      let nodeMarkerInfoWindow = self.findNodeMarkerInfoWindow(latLng);
      if (nodeMarkerInfoWindow != null) {
        nodeMarkerInfoWindow.setContent(nodeMarkerInfoWindow.getContent() + '<br>' + row.V_id + ': ' + row.Number);
      } else {
        let src = (row.IsCross == 1 ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        self.nodeMarkers[self.nodeMarkers.length] = new Marker({
          position: latLng,
          title: row.Id,
          icon: src,
          map: self.map
        });
        
        let content = 'N_id: ' + row.Id;
        if (row.V_id != null) {
          content += '<br>' + row.V_id + ': ' + row.Number;
        }
        self.nodeMarkerInfoWindows[self.nodeMarkerInfoWindows.length] = new InfoWindow({
          content: content,
          position: latLng
        });
        
        self.nodeMarkers[self.nodeMarkers.length - 1].addListener('click', function() {
          self.findNodeMarkerInfoWindow(this.getPosition()).open(self.map, this);
        });
      }
    }

  }

  findNodeMarkerInfoWindow(latLng) {
    for (const nodeMarkerInfoWindow of this.nodeMarkerInfoWindows) {
      if (nodeMarkerInfoWindow.getPosition() == latLng) {
        return nodeMarkerInfoWindow;
      }
    }

    return null;
  }
  
  findLightMarkerInfoWindow(latLng) {
    for (const lightMarkerInfoWindow of this.lightMarkerInfoWindows) {
      if (lightMarkerInfoWindow.getPosition() == latLng) {
        return lightMarkerInfoWindow;
      }
    }

    return null;
  }

  rad(d) {
    return d * Math.PI / 180.0;
  }

  getDistance(latlng1, latlng2) {
    let EARTH_RADIUS = 6378.137;
    let radLat1 = rad(latlng1.lat());
    let radLat2 = rad(latlng2.lat());
    let a = radLat1 - radLat2;
    let b = rad(latlng1.lng()) - rad(latlng2.lng());
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2)
        + Math.cos(radLat1) * Math.cos(radLat2)
        * Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;
  }
}

export default RoadDataManagement;
