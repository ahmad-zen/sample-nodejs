const { v4: uuidV4 } = require('uuid');

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
        this.Id = uuidV4();
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

        this.generateEnergyEveryMinute()
    }
    provisionDevice() {
        const device = new Device();
        this.devices.push(device);
        return {
            deviceId: device.Id
        };
    }
    getDevices(deviceId) {
        if(deviceId != null)
        {
            return this.devices.find(d => d.Id == deviceId)
        }
        return this.devices;
    }
    generateEnergy() {
        //todo: add some randomness to the generateEnergy
        const energyGenerated = getSinWave(this.minuteCounter);
        for (let i = 0; i < this.devices.length; i++) {
            this.devices[i].generateEnergy(energyGenerated);
        }
    }
    resetDevices() {
        for (let i = 0; i < this.devices.length; i++) {
            this.devices[i].resetDayEnergy();
        }
    }
    getResponse(deviceId) {
        return this.getDevices(deviceId);
    }
    generateEnergyEveryMinute() {
        const self = this;
        setInterval(() => {
            self.generateEnergy();

            if (self.minuteCounter < 10) {
                self.minuteCounter += 1;
            }
            else {
                self.minuteCounter = 0;
                self.resetDevices();
            }
        }, self.minuteInMilliseconds);
    }
}
const inverterCloudSimulator = new InverterCloudSimulator();

exports.inverterCloudSimulator = inverterCloudSimulator;
