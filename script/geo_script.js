function getNearestStation(lat, long) {
    let nearestStation = null;
    let nearestDistance = Infinity;

    for (let station in _MTR_DATA.station) {
      if (_MTR_DATA.station.hasOwnProperty(station)) {
        let stationLong = _MTR_DATA.station[station].long;
        let stationLat = _MTR_DATA.station[station].lat;

        let distance = getDistance(lat, long, stationLat, stationLong);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestStation = station;
        }
      }
    }

    return nearestStation;
  }

  function getDistance(lat1, long1, lat2, long2) {
    let R = 6371e3; // metres
    let  f1 = lat1 * Math.PI / 180;
    let  f2 = lat2 * Math.PI / 180;
    let  dF = (lat2-lat1) * Math.PI / 180;
    let  dL = (long2-long1) * Math.PI / 180;

    let a = Math.sin(dF/2) * Math.sin(dF/2) +
            Math.cos(f1) * Math.cos(f2) *
            Math.sin(dL/2) * Math.sin(dL/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    let d = R * c;

    return d;
  }