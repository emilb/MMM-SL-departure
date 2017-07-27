const NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');


module.exports = NodeHelper.create({

    reloadInterval: 10 * 1000,

    // Subclass start method.
    start: function () {
        console.log("Starting node helper: " + this.name);
    },

    // Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, payload) {
        console.log(`SL node_helper received: ${notification}`);
        if (notification === 'SL_INIT') {
            console.log('SL_INIT: ' + JSON.stringify(payload));
            this.config = payload;
            this.reloadTimer = null;
            this.fetchDepartures();
        }
    },

    fetchDepartures: function () {

        const self = this;
        console.log("Fetching departures");
        departures = [];
        var url = this.config.api_url.replace('API_KEY', this.config.api_key).replace('TIME_WINDOW', this.config.time_window).replace('STATION', this.config.station);
        console.log(`Fetching: ${url}`);

        nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
        headers = { "User-Agent": "Mozilla/5.0 (Node.js " + nodeVersion + ") MagicMirror/" + global.version + " (https://github.com/MichMich/MagicMirror/)" }

        request({ uri: url, encoding: null, headers: headers }, function (error, response, body) {

            // console.log("Received: " + body);
            var response_json = JSON.parse(body);

            var suitableBuses = response_json.ResponseData.Buses.filter(bus => {
                // Check against exclusions instead
                return bus.Destination !== 'Margretelunds centrum' &&
                    bus.Destination !== 'Skärgårdsstad'
            });

            suitableBuses.forEach(bus => {
                console.log(bus.DisplayTime + ' mot ' + bus.Destination + ', linje: ' + bus.LineNumber);

                departures.push({
                    line_number: bus.LineNumber,
                    display_time: bus.DisplayTime,
                    expected_time: moment(bus.ExpectedDateTime).format('HH:mm'),
                    destination: bus.Destination
                });
            });

            console.log(JSON.stringify(departures));
            self.sendSocketNotification("SL_DEPARTURES", departures);
            self.scheduleTimer();
        });
    },

    scheduleTimer: function () {
        var self = this;
        clearTimeout(this.reloadTimer);
        this.reloadTimer = setTimeout(function () {
            self.fetchDepartures();
        }, this.reloadInterval);
    }
});

