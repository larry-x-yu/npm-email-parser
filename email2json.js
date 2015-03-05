var fs = require('fs');
var bunyan = require('bunyan');
var ical2json = require("ical2json");

var logger = bunyan.createLogger({
    name: 'email_parser',
    streams: [{
        stream: process.stdout,
        level: "debug"
    }]
});

module.exports = {
    _extractics: function(message) {
        var beginIndex = -1,
            endIndex = -1,
            ics = "";

	    var googleOpeningMarker = 'Content-Transfer-Encoding: base64';
            var googleClosingMarker = '--[0-9a-fA-F]+--';
	    var beginIndex = message.indexOf(googleOpeningMarker);
	    if(beginIndex > 0) { // Should be google calendar event
	    beginIndex += googleOpeningMarker.length;
            var tmp = message.substring(beginIndex);
		    endIndex = tmp.search(googleClosingMarker);
            if(endIndex > 0) {
                // Restore the index in 'message' instead of 'tmp' 
                endIndex += beginIndex;
            }    			
        } else { /* Apple's ics is base64 encoded as an attachment */
            // Calendar event from iphone, mac-os
            logger.debug("Search for encoded ics...");
            var marker1 = "Content-Disposition: attachment; filename=.*\.ics";
            var index = message.search(marker1);
            if (index != -1) {
                index = message.indexOf(".ics");
                beginIndex = index + 4;
                endIndex = message.indexOf('------=_Part_', beginIndex + 1);
            } else {
                logger.debug("Unable to find Base64 encoded ics");
            }
        }

        if (beginIndex != -1 && endIndex != -1) {
            logger.debug("Decode ics...");
            ics = message.substring(beginIndex, endIndex).trim();
            //logger.debug("ics base64:\n" + ics);
            ics = new Buffer(ics, 'base64').toString("ascii");
	    //logger.debug("ICS=" + ics);
        } else {
            logger.debug("No valid ics attachment found");
        }

        return ics;
    },

    toicsjson: function(message) {
        if (!message) {
            logger.debug("Error opening file: " + err);
            return;
        }

        var ics = this._extractics(message);
        //logger.debug(ics);
        if (ics) {
            return ical2json.convert(ics);
            //logger.debug(icalJson);
        }
    }
};
