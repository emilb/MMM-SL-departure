const NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');


module.exports = NodeHelper.create({

    reloadInterval: 5 * 60 * 1000,

    // Subclass start method.
    start: function () {
        console.log("Starting node helper: " + this.name);
    },

    // Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'SL_INIT') {
            this.config = payload;
            this.reloadTimer = null;
            this.fetchDepartures();
        }
    },

    fetchDepartures: function () {

        const self = this;
        departures = [];
        var url = this.config.api_url.replace('API_KEY', this.config.api_key).replace('TIME_WINDOW', this.config.time_window).replace('STATION', this.config.station);

        nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
        headers = { "User-Agent": "Mozilla/5.0 (Node.js " + nodeVersion + ") MagicMirror/" + global.version + " (https://github.com/MichMich/MagicMirror/)" }

        request({ uri: url, encoding: null, headers: headers }, function (error, response, body) {

            if (error || response.statusCode != 200) {
                console.log('API call to SL failed: ' + error);
                self.scheduleTimer();
                return;
            }

            try {
                var response_json = JSON.parse(body);

                var suitableBuses = response_json.ResponseData.Buses.filter(bus => {
                    // Check against exclusions instead
                    return bus.Destination !== 'Margretelunds centrum' &&
                        bus.Destination !== 'Skärgårdsstad'
                });

                suitableBuses = suitableBuses.slice(0, 7);
                suitableBuses.forEach(bus => {
                    departures.push({
                        line_number: bus.LineNumber,
                        display_time: bus.DisplayTime,
                        expected_time: moment(bus.ExpectedDateTime).format('HH:mm'),
                        destination: bus.Destination
                    });
                });

                self.sendSocketNotification("SL_DEPARTURES", departures);
            } catch (error) {
                console.log('Something went wrong when parsing response from SL: ' + error);
            }
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
