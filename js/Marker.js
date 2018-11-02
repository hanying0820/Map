class Marker {
  constructor(options) {
    this.options = options;

    this.element = document.createElement('div');
    this.element.id = 'marker';
    this.element.style.backgroundImage = 'url(' + options.icon + ')';
    this.element.title = options.title;

    options.map.addOverlay(new ol.Overlay({
      position: options.position,
      positioning: 'bottom-center',
      element: this.element,
      stopEvent: true
    }));
  }

  getPosition() {
    return this.options.position;
  }

  addListener(event, func) {
    let self = this;

    self.func = func;

    switch (event) {
      case 'click':
        self.element.onclick = function () {
          self.func()
        };
        break;

    }
  }
}

export default Marker;
