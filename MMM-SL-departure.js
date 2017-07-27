

Module.register("MMM-SL-departure", {
	// Default module config.
	defaults: {
        api_key: '',
        time_window: 30,
	    station: '2634',
        exclusions: [
            'Margretelund'
        ],
        api_url: 'http://api.sl.se/api2/realtimedeparturesv4.json?key=API_KEY&siteid=STATION&timewindow=TIME_WINDOW',
        reloadInterval:  1 * 10 * 1000, // every 10 secs
        animationSpeed: 2.5 * 1000,
		text: "Buss från Knipvägen",
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		if (this.currentDepartures) {
			this.currentDepartures.forEach(departure => {
				var title = document.createElement("div");
				title.className = "bright medium light";
				title.innerHTML = departure.line_number + " " + departure.expected_time;
				wrapper.appendChild(title);
			});
		}

		return wrapper;
    },
    
    start: function() {
        this.currentDepartures = [];
        this.sendSocketNotification("SL_INIT", this.config);
    },

    // Override socket notification handler.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "SL_DEPARTURES") {

            this.currentDepartures = payload;
            this.updateDom();
		}
	},

    /* scheduleUpdateInterval()
	 * Schedule visual update.
	 */
	scheduleUpdateInterval: function() {
		var self = this;

		self.updateDom(self.config.animationSpeed);

		setInterval(function() {
			self.activeItem++;
			self.updateDom(self.config.animationSpeed);
		}, this.config.updateInterval);
	},
	
	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},
});

