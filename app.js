var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');
const url = require('url');
//const uuidv4 = require('uuid/v4');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

/*
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
*/

//--------MOVE OUT AND REQUIRE---------
//
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
        this.Id = 'newId'; //uuidv4();
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
class DeviceSimulator {
    constructor() {
        this.devices = new Array();
    }
    getDevices() {
        return this.devices;
    }
    provisionDevice() {
        const device = new Device();
        this.devices.push(device);
        return device.Id;
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
}
class InverterSimulator {
    constructor() {
        this.minuteInMilliseconds = 1000 * 60;
        this.minuteCounter = 0;
        this.deviceSimulator = new DeviceSimulator();
        this.deviceSimulator.provisionDevice();
    }
    provisionDevice() {
        return this.deviceSimulator.provisionDevice();
    }
    getResponse() {
        const response = this.deviceSimulator.getDevices();
        this.deviceSimulator.resetDevices();
        return response;
    }
    generateEnergyEveryMinute() {
        const self = this;
        setInterval(() => {
            //todo: add some randomness to the generateEnergy
            const energyGenerated = getSinWave(self.minuteCounter);
            self.deviceSimulator.generateEnergy(energyGenerated);
            if (self.minuteCounter < 10) {
                self.minuteCounter += 1;
            }
            else {
                self.minuteCounter = 0;
            }
        }, self.minuteInMilliseconds);
    }
}
//
//--------MOVE OUT AND REQUIRE---------

//setup routes
// GET devices
app.get('/solar_api/v1/GetInverterRealtimeData.cgi', function (req, res) {
	  res.writeHead(200, {
		'Content-Type': "application/json"
	});
	const response = inverterSimulator.getResponse();
	res.end(JSON.stringify(response));
})

// POST provision device
app.post('/provision', function (req, res) {
	  res.writeHead(200, {
		'Content-Type': "application/json"
	});
	const response = inverterSimulator.provisionDevice();
	res.end(response);
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
