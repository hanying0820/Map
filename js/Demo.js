import Emergency from './Emergency.js';
import LightManagement from './LightManagement.js';
import EventManagement from './EventManagement.js';


(() => {
  // map
  let map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    loadTilesWhileAnimating: true,
    view: new ol.View({
      center: ol.proj.fromLonLat([120.284649, 22.730038]),
      zoom: 17
    })
  });

  // 緊急事件
  let emergency = new Emergency(map);

  // 紅綠燈
  let lightManagement = new LightManagement(map);
  setInterval(() => lightManagement.tick(), 1000);

  // 一般事件
  new EventManagement(map);

  let key = 0;
  let xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : ActiveXObject("Microsoft.XMLHTTP");
  xmlHttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.responseText);
      if (data.key != undefined) {
        key = data.key;
      }

      emergency.setEmergency(data.location);
    };
  }

  setInterval(() => {
    xmlHttp.open('POST', 'php/getData.php', true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send('key=' + key);
  }, 1000);
})();
