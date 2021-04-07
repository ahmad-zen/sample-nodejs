const uuidv4 = require('uuid.v4');

var dayInMinutes = 10;
function getSinWave(t) {
    const amplitude = 500;
    const shiftx = 0.5 * Math.PI;
    const frequency = 2 * Math.PI / dayInMinutes;
    return amplitude * Math.sin(frequency * t - shiftx) + amplitude;
}
class EnergyReading {
    constructor(value) {
        this.Value = value;
        this.Unit = "WH";
    }
}
class Device {
    constructor() {
        this.Id = uuidv4();
        this.DAY_ENERGY = new EnergyReading(0);
        this.TOTAL_ENERGY = new EnergyReading(0);
    }
    generateEnergy(energyGenerated) {
        this.DAY_ENERGY.Value += energyGenerated;
        this.TOTAL_ENERGY.Value += energyGenerated;
    }
    resetDayEnergy() {
        this.DAY_ENERGY.Value = 0;
    }
}
class InverterCloudSimulator {
    constructor() {
        this.minuteInMilliseconds = 1000 * 60;
        this.minuteCounter = 0;
        this.devices = new Array();
    }
    provisionDevice() {
        const device = new Device();
        this.devices.push(device);
        return device.Id;
    }
    getDevices() {
        return this.devices;
    }
    generateEnergy(energyGenerated) {
        for (let i = 0; i < this.devices.length; i++) {
            this.devices[i].generateEnergy(energyGenerated);
        }
    }
    resetDevices() {
        for (let i = 0; i < this.devices.length; i++) {
            this.devices[i].resetDayEnergy();
        }
    }
    getResponse() {
        const response = this.getDevices();
        this.resetDevices();
        return response;
    }
    generateEnergyEveryMinute() {
        const self = this;
        setInterval(() => {
            //todo: add some randomness to the generateEnergy
            const energyGenerated = getSinWave(self.minuteCounter);
            self.generateEnergy(energyGenerated);
            if (self.minuteCounter < 10) {
                self.minuteCounter += 1;
            }
            else {
                self.minuteCounter = 0;
            }
        }, self.minuteInMilliseconds);
    }
}
const inverterCloudSimulator = new InverterCloudSimulator();

exports.inverterCloudSimulator = inverterCloudSimulator;
