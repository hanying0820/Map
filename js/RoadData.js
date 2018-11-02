import RoadDataManagement from './RoadDataManagement.js';


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
      zoom: 16
    })
  });

  // 滑鼠左鍵點選地圖上的位置，顯示座標並標示出最近 Node
  let clicked_div = document.createElement('div');
  clicked_div.id = 'clicked';

  let clicked_ovl = new ol.Overlay({
    positioning: 'bottom-center',
    element: clicked_div,
    stopEvent: true
  });
  map.addOverlay(clicked_ovl);

  map.on('singleclick', (evt) => {
    let coordinate = ol.proj.toLonLat(evt.coordinate);
    document.getElementById('lng').innerHTML = coordinate[0];
    document.getElementById('lat').innerHTML = coordinate[1];

    clicked_ovl.setPosition(evt.coordinate);

    // TODO: findClosedNode()
  });

  new RoadDataManagement(map);
})();