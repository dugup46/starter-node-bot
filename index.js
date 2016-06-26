/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
WEATHER BOT by dugup46!
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./resources/botkit/lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: false
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.hears(['help'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'sos',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
    
    var help = '*1)* I will initiate by you typing the following message: \n' +
        '*`@' + bot.identity.name + ' radar`* After initial call, I will ask for site and type of scan.\n' +
	'*2)* You must provide the exact 3 letter NWS site ID - You can find that list here:\n' +
	'http://www.nws.noaa.gov/emwin/sitename.htm\n\n' +
        '*3)* Here is a list of all the types of scans I can currently run:\n' +
        '*`reflect` Base Reflecivity* - Lower level scan, most common.\n' +
        '*`velocity` Base Velocity* - Provides wind speeds and direction.\n' +
	'*`motion` Relative Storm Motion* - Provides small scale rotations and mesocyclones.\n' +
	'*`composite` Base Reflectivity* Composite - Composite scan of all BR level scans.\n' +
	'*`1hour` 1 Hour Precipitation* - Provides the level of rainfall in the past 1 hour.\n' +
	'*`total` Total Storm Precipitation* - Provides total precipitation from a storm.'
	bot.reply(message, help)
});

controller.hears(['radar'], ['direct_message', 'direct_mention'], function (bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        
	bot.startConversation(message, function(err, convo) {

		convo.ask('Which radar site do you want?', function(response, convo) {

			convo.next();

		}, {'key': 'radarsite'}); // store the results in a field called nickname

		convo.ask('Which type of radar scan do you want?', function(response, convo) {

			convo.next();

		}, {'key': 'scantype'}); // store the results in a field called nickname
		
		convo.on('end', function(convo) {
			if (convo.status == 'completed') {

				var scantype = convo.extractResponse('scantype');
				scantype = scantype.toLowerCase();
				var radarsite = convo.extractResponse('radarsite');
				radarsite = radarsite.toUpperCase();
				
				switch(scantype) {
				case "reflect":
					var scantype = "N0R"
					break;
				case "velocity":
					var scantype = "N0V"
					break;
				case "motion":
					var scantype = "N0S"
					break;
				case "1hour":
					var scantype = "N1P"
					break;
				case "composite":
					var scantype = "NCR"
					break;
				case "total":
					var scantype = "NTP"
					break;
				default:
					scantype = "N0R"
				} 
				
				var text = "Here is the " + scantype + " scan from your requested location: "
				var attachment = [{
						"title": "For a direct link to the NWS page for " + radarsite + ", click here.",
						"title_link": "http://www.weather.gov/" + radarsite + "/",
						"text": text,
						"fallback": text,
						"image_url": "http://radar.weather.gov/ridge/RadarImg/" + scantype + "/" + radarsite + "_" + scantype + "_0.gif",
						"color": "#7CD197",
				}]

				bot.reply(message, {
					attachments: attachment
				}, function (err, resp) {
					console.log(err, resp)
					})
				}
			});
		});
    });
})
