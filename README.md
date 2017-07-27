# MMM-SL-departure
Module for MagicMirror2 showing departuretimes from a station/buss-stop in Stockholm

URL: http://api.sl.se/api2/realtimedeparturesv4.json?key=xxxxxxxx&siteid=2634&timewindow=5

 **Example:**
```
 {
    module: 'MMM-SL-departure',
	position: 'bottom_right',
	config: {
        api_key: 'xxxxxxxx',
        time_window: 220,
        station: '2634',
    }
 },
```