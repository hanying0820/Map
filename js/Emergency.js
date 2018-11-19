class EmergencyControl extends ol.control.Control {
  constructor(listener) {
    let button = document.createElement('button');
    button.innerHTML = 'E';
    button.addEventListener('click', listener);

    let element = document.createElement('div');
    element.className = 'emengency-control ol-control';
    element.appendChild(button);

    super({ element: element });
  }
}

// 緊急事件
class Emergency {
  constructor(map) {
    let emergency_div = document.createElement('div');
    emergency_div.id = 'emergency';

    this.overlay = new ol.Overlay({
      positioning: 'center-center',
      element: emergency_div,
      stopEvent: true
    });

    this.map = map;

    // overlay
    this.map.addOverlay(this.overlay);

    // control
    this.map.addControl(this.control = new EmergencyControl(this.moveToEmergency.bind(this)));
  }

  setEmergency(arr) {
    this.emergencyArr = arr;
    if (this.emergencyArr.length != 0) {
      this.updateEmergency();
    } else {
      this.finishEmergency();
    }
  }

  // 取得最新的位置
  getLastPosition() {
    return ol.proj.fromLonLat([
      parseFloat(this.emergencyArr[0].Longitude),
      parseFloat(this.emergencyArr[0].Latitude)
    ]);
  }

  // 更新 Emergency 位置
  updateEmergency() {
    let self = this;

    if (self.overlay.getPosition() == undefined) {
      if (self.initialPosition == null) {
        self.initialPosition = self.getLastPosition();
        self.control.setMap(self.map);
        return;
      } else {
        self.overlay.setPosition(self.initialPosition);
        self.initialPosition = null;
      }
    }

    self.startPosition = ol.proj.toLonLat(self.overlay.getPosition());
    self.startTime = performance.now();

    if (self.requestID == null) {
      // 更新 Emergency 位置的 callback
      function updateOverlay(timeStamp) {
        let elapsed = timeStamp - self.startTime;
        let t = elapsed / 1000;
        let lon = t * parseFloat(self.emergencyArr[0].Longitude) + (1 - t) * self.startPosition[0];
        let lat = t * parseFloat(self.emergencyArr[0].Latitude) + (1 - t) * self.startPosition[1];

        self.overlay.setPosition(ol.proj.fromLonLat([lon, lat]));

        // 遞迴
        self.requestID = requestAnimationFrame(updateOverlay);
      }

      self.requestID = requestAnimationFrame(updateOverlay);
    }
  }

  // 此次 Emergency 結束
  finishEmergency() {
    cancelAnimationFrame(this.requestID);
    this.requestID = null;
    this.overlay.setPosition(undefined);
    this.control.setMap(null);
  }

  // 移動地圖到 Emergency 上
  moveToEmergency() {
    this.map.getView().animate({
      center: this.overlay.getPosition(),
      duration: 1000
    });
  }
}

export default Emergency;
