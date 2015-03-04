var fs = require('fs');
var email2json = require('email2json');

fs.readFile("./sample_calendar_emails/iphone_calendar_event.eml", "ascii", function(err, message) {
	if(err) {
		console.log("Error opening file: " + err);
		return;
	}

	var ics = email2json.toicsjson(message);
	console.log(ics);	
});
