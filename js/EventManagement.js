class EventManagement {
  constructor(map) {
    this.map = map;
    this.event_ovl_s = [];
  }

  // 初始化所有事件
  setEvents(events) {
    if (this.event_ovl_s.length != 0) {
      for (const event_ovl of this.event_ovl_s) {
        this.map.removeOverlay(event_ovl);
      }
      this.event_ovl_s.length = 0;
    }

    let category = ['道路施工', '道路封鎖', '車禍事故', '警察路檢', '掉落物', '其他事件'];
    let icon = ['repair', 'roadblock', 'accident', 'police', 'drop', 'others'];
    for (const event of events) {
      // event's div
      let event_div = document.createElement('div');
      event_div.id = 'event';
      event_div.style.backgroundImage = 'url(src/event_' + icon[parseInt(event.category) - 1] + '.png)';

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
        insertFirst: false,
        stopEvent: true
      });

      this.event_ovl_s.push(event_ovl);
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

    for (const event_ovl of this.event_ovl_s) {
      this.map.addOverlay(event_ovl);
    }
  }
}

export default EventManagement;
