// 字串轉時間
function parseSecond(time) {
  let split = time.split(':');

  return parseInt(split[0] * 3600) + parseInt(split[1] * 60) + parseInt(split[2]);
}

// 紅綠燈
class TrafficLight {
  constructor(div, now, periods) {
    this.div = div;
    this.periods = periods;

    let now_second = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    for (let i = 0; i < periods.length; i++) {
      let base_time = parseSecond(periods[i].Base_time);
      if (base_time > now_second) {
        this.index = i - 1;
        this.secondInFeature = base_time - now_second;
        break;
      }

      if (i == periods.length - 1) {
        this.index = i;
        this.secondInFeature = 86400 - now_second;
        break;
      }
    }

    this.initialize();

    let totalSecond = 0;
    for (const lightSecond of this.lightSeconds) {
      totalSecond += lightSecond;
    }

    let secondFromStart = (now_second - parseSecond(periods[this.index].Base_time)) % totalSecond;
    for (let i = 0, second = 0; i < this.lightSeconds.length; second += this.lightSeconds[i], i++) {
      if (secondFromStart - second < this.lightSeconds[i]) {
        this.countDown = this.lightSeconds[i] - secondFromStart + second;
        this.current = i;
        break;
      }
    }

    if (++this.index == periods.length) {
      this.index = 0;
    }
  }

  initialize() {
    switch (this.periods[this.index].First_light) {
      case 'Red':
        this.lightSeconds = [parseSecond(this.periods[this.index].Red), parseSecond(this.periods[this.index].Green), parseSecond(this.periods[this.index].Yellow)];
        this.status = ['Red', 'Green', 'Yellow'];
        break;
      case 'Green':
        this.lightSeconds = [parseSecond(this.periods[this.index].Green), parseSecond(this.periods[this.index].Yellow), parseSecond(this.periods[this.index].Red)];
        this.status = ['Green', 'Yellow', 'Red'];
        break;
      case 'Flash_yellow':
        this.lightSeconds = [parseSecond(this.periods[this.index].Flash_yellow)];
        this.status = ['Flash_yellow'];
        break;
      default:
        this.lightSeconds = [];
        this.status = [];
        break;
    }
  }

  tick() {
    if (--this.secondInFeature == 0) {
      this.initialize();

      this.current = 0;
      this.countDown = this.lightSeconds[this.current];

      let base_time = parseSecond(this.light.peroids[this.index].Base_time);
      if (++this.index != this.periods.length) {
        this.secondInFeature = parseSecond(this.periods[this.index].Base_time);
      }
      else {
        this.index = 0;
        this.secondInFeature = 86400 - base_time;
      }
    }
    else if (--this.countDown == 0) {
      if (++this.current == this.status.length) {
        this.current = 0;
      }
      this.countDown = this.lightSeconds[this.current];
    }
  }

  getStatus() {
    return this.status[this.current];
  }
}

export default TrafficLight;
