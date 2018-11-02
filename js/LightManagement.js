import TrafficLight from './TrafficLight.js';


class LightManagement {
  constructor(map) {
    let self = this;

    self.map = map;

    // AJAX
    let xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : ActiveXObject("Microsoft.XMLHTTP");
    xmlHttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        self.lights = JSON.parse(this.responseText);
        self.initLights();
      }
    };

    xmlHttp.open('GET', 'php/getLights.php', true);
    xmlHttp.send();
  }

  // 初始化所有紅綠燈
  initLights() {
    let rightNow = new Date();
    let light_ovl_s = [];
    this.trafficLights = [];    
    for (const light of this.lights) {
      if (light.periods.length == 0) {
        continue;
      }

      // light's div
      let light_div = document.createElement('div');      

      this.trafficLights.push(new TrafficLight(light_div, rightNow, light.periods));
      switch (this.trafficLights[this.trafficLights.length - 1].getStatus()) {
        case 'Red':
          light_div.style.backgroundImage = 'url(src/red.png)';
          break;
        case 'Yellow':
          light_div.style.backgroundImage = 'url(src/yellow.png)';
          break;
        case 'Green':
          light_div.style.backgroundImage = 'url(src/green.png)';
          break;
      }
      light_div.id = 'light';
      light_div.innerHTML = String(this.trafficLights[this.trafficLights.length - 1].countDown);
      light_div.title = light.Id;

      // infoWindow's div
      let infoWindow_div = document.createElement('div');
      infoWindow_div.className = 'ol-popup';

      let content = document.createElement('div');
      content.className = 'ol-popup-content';
      content.style.textAlign = 'center';
      content.innerHTML = `<p>${String(light.Id)}</p>`;
      infoWindow_div.appendChild(content);

      // overlay
      let light_ovl = new ol.Overlay({
        position: ol.proj.fromLonLat([parseFloat(light.Longitude), parseFloat(light.Latitude)]),
        positioning: 'center-center',
        element: light_div,
        stopEvent: true
      });
      let infoWindow_ovl = new ol.Overlay({
        positioning: 'bottom-center',
        offset: [0, -20],
        element: infoWindow_div,
        stopEvent: true
      });

      light_ovl_s.push(light_ovl);
      this.map.addOverlay(infoWindow_ovl);

      // 點擊切換顯示 infoWindow
      light_div.onclick = () => {
        infoWindow_ovl.setPosition(infoWindow_ovl.getPosition() == undefined ? light_ovl.getPosition() : undefined);
      };
    }    

    for (const light_ovl of light_ovl_s) {
      this.map.addOverlay(light_ovl);
    }
  }

  // 倒數一秒
  tick() {
    for (let trafficLight of this.trafficLights) {
      trafficLight.tick();
      
      switch (trafficLight.getStatus()) {
        case 'Red':
          trafficLight.div.style.backgroundImage = 'url(src/red.png)';
          break;
        case 'Yellow':
          trafficLight.div.style.backgroundImage = 'url(src/yellow.png)';
          break;
        case 'Green':
          trafficLight.div.style.backgroundImage = 'url(src/green.png)';
          break;
      }
      trafficLight.div.innerHTML = String(trafficLight.countDown);
    }
  }
}

export default LightManagement;
