// 緊急事件
class Emergency {
  constructor(map) {
    let self = this;

    let emergency_div = document.createElement('div');
    emergency_div.id = 'emergency';

    this.overlay = new ol.Overlay({
      positioning: 'center-center',
      element: emergency_div,
      stopEvent: true
    });

    map.addOverlay(this.overlay);

    // AJAX
    self.xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : ActiveXObject("Microsoft.XMLHTTP");
    self.xmlHttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        self.emergencyArr = JSON.parse(this.responseText);
        if (self.emergencyArr.length != 0) {
          self.updateEmergency();
        }
        else {
          self.finishEmergency();
        }
      }
    };

    // 開始持續更新 Emergency 狀況
    setInterval(() => {
      this.xmlHttp.open('GET', '../getLocation.php', true);
      this.xmlHttp.send();
    }, 1000);
  }

  // 取得最新的位置
  getLastPosition() {
    return ol.proj.fromLonLat([parseFloat(this.emergencyArr[0].Longitude), parseFloat(this.emergencyArr[0].Latitude)]);
  }

  // 更新 Emergency 位置
  updateEmergency() {
    let self = this;

    if (self.overlay.getPosition() == undefined) {
      if (self.initialPosition == null) {
        self.initialPosition = self.getLastPosition();
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
  }
}

export default Emergency;
