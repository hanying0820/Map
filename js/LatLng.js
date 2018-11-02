class LatLng {
  constructor(lat, lng) {
    return ol.proj.fromLonLat([lng, lat]);
  }
}

export default LatLng;