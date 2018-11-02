class InfoWindow {
  constructor(options) {
    this.options = options;

    this.element = document.createElement('div');
    this.element.className = 'ol-popup';
    this.element.style.padding = '15px';

    let closer = document.createElement('a');
    closer.className = 'ol-popup-closer';
    this.element.appendChild(closer);

    this.contentDiv = document.createElement('div');
    this.contentDiv.className = 'ol-poup-content';
    this.element.appendChild(this.contentDiv);

    this.setContent(options.content);

    this.overlay = new ol.Overlay({
      positioning: 'bottom-center',
      offset: [0, -20],
      element: this.element,
      stopEvent: true,
      insertFirst: false
    })

    closer.onclick = () => {
      this.overlay.setPosition(undefined);
      closer.blur();
      return false;
    }
  }

  getContent() {
    return this.content;
  }

  setContent(content) { 
    this.content = content;
    this.contentDiv.innerHTML = `<p>${this.content}</p>`;
  }

  getPosition() {
    return this.options.position;
  }

  open(map, marker) {
    map.addOverlay(this.overlay);
    this.overlay.setPosition(marker.getPosition());
  }
}

export default InfoWindow;
