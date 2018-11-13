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
    view: new ol.View({
      center: ol.proj.fromLonLat([120.284649, 22.730038]),
      zoom: 17
    })
  });

  // 緊急事件
  new Emergency(map);

  // 紅綠燈
  let lightManagement = new LightManagement(map);
  setInterval(() => lightManagement.tick(), 1000);

  // 一般事件
  new EventManagement(map);
})();
