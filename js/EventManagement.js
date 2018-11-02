class EventManagement {
  constructor(map) {
    let self = this;

    self.map = map;

    // AJAX
    let xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : ActiveXObject("Microsoft.XMLHTTP");
    xmlHttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        self.events = JSON.parse(this.responseText);
        self.initEvents();
      }
    };

    xmlHttp.open('GET', 'php/getEvents.php', true);
    xmlHttp.send();
  }

  // 初始化所有事件
  initEvents() {
    let event_ovl_s = [];
    let category = ['道路施工', '道路封鎖', '車禍事故', '警察路檢', '掉落物'];
    for (const event of this.events) {
      // event's div
      let event_div = document.createElement('div');
      event_div.id = 'event';

      // infoWindow's div
      let infoWindow_div = document.createElement('div');
      infoWindow_div.className = 'ol-popup';
      infoWindow_div.style.padding = '12px';

      let closer = document.createElement('a');
      closer.className = 'ol-popup-closer';
      infoWindow_div.appendChild(closer);

      let content = document.createElement('div');
      content.className = 'ol-popup-content';      
      content.innerHTML = `<p>事件類型：${category[parseInt(event.category) - 1]}</p>
                           <p>發生時間：${event.starttime}</p>
                           <p>結束時間：${event.endtime}  (預計)</p>
                           <p>補充資訊：${event.content}</p>`;
      infoWindow_div.appendChild(content);

      // overlay
      let event_ovl = new ol.Overlay({
        position: ol.proj.fromLonLat([parseFloat(event.longitude), parseFloat(event.latitude)]),
        positioning: 'center-center',
        element: event_div,
        stopEvent: true
      });
      let infoWindow_ovl = new ol.Overlay({
        positioning: 'bottom-center',
        offset: [0, -20],
        element: infoWindow_div,
        stopEvent: true
      });

      event_ovl_s.push(event_ovl);
      this.map.addOverlay(infoWindow_ovl);      

      closer.onclick = () => {
        infoWindow_ovl.setPosition(undefined);
        closer.blur();
        return false;
      };
      event_div.onclick = () => {
        infoWindow_ovl.setPosition(infoWindow_ovl.getPosition() == undefined ? event_ovl.getPosition() : undefined);
      };
    }

    for (const event_ovl of event_ovl_s) {
      this.map.addOverlay(event_ovl);
    }
  }
}

export default EventManagement;
