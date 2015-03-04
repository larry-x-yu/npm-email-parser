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
        var beginIndex = -1, endIndex = -1, ics = "";

        /**
         * 
         * Google calendar enbeds ics in the email as clear text
         * as well as attachment 
         */

        /* Check if ics is embedded in the email body as clear text */
        beginIndex = message.indexOf("BEGIN:VCALENDAR");

        if (beginIndex != -1) {
            endIndex = message.indexOf("END:VCALENDAR");
            if (endIndex == -1) {
                logger.error("Unable to find 'END:VCALENDAR'; Proceed to Base64 check");
            } else {
                endIndex += 'END:VCALENDAR'.length;
            }

            if (beginIndex != -1 && endIndex != -1) {
                ics = message.substring(beginIndex, endIndex + 1);
            }
        } else {    /* Apple's ics is base64 encoded as an attachment */
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

            if (beginIndex != -1 && endIndex != -1) {
                logger.debug("Decode ics...");
                ics = message.substring(beginIndex, endIndex).trim();

                //logger.debug("ics base64:\n" + ics);
                ics = new Buffer(ics, 'base64').toString("ascii");;
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

        var ics = _extractics(message);
            //logger.debug(ics);
        if (ics) {
                icalJson = ical2json.convert(ics);
                //logger.debug(icalJson);
            }
        }
    });
};