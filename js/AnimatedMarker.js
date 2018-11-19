// 平滑移動 Marker
class AnimatedMarker {
  constructor(map, img) {
    let marker_div = document.createElement('div');
    marker_div.id = 'animate-marker';
    marker_div.style.backgroundImage = img;

    this.overlay = new ol.Overlay({
      positioning: 'center-center',
      element: marker_div,
      stopEvent: true
    });

    this.map = map;

    // overlay
    this.map.addOverlay(this.overlay);
  }

  setLocation(location) {
    this.location = location;
    if (this.location != null) {
      this.updatePosition();
    } else {
      this.finish();
    }
  }

  // 取得最新的位置
  getLastPosition() {
    return ol.proj.fromLonLat([
      parseFloat(this.location.Longitude),
      parseFloat(this.location.Latitude)
    ]);
  }

  // 更新 Marker 位置
  updatePosition() {
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
      // 更新 Marker 位置的 callback
      function updateOverlay(timeStamp) {
        let elapsed = timeStamp - self.startTime;
        let t = elapsed / 1000;
        let lon = t * parseFloat(self.location.Longitude) + (1 - t) * self.startPosition[0];
        let lat = t * parseFloat(self.location.Latitude) + (1 - t) * self.startPosition[1];

        self.overlay.setPosition(ol.proj.fromLonLat([lon, lat]));

        // 遞迴
        self.requestID = requestAnimationFrame(updateOverlay);
      }

      self.requestID = requestAnimationFrame(updateOverlay);
    }
  }

  // 此次更新結束
  finish() {
    cancelAnimationFrame(this.requestID);
    this.requestID = null;
    this.overlay.setPosition(undefined);
  }
}

export default AnimatedMarker;
