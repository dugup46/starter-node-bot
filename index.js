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
    
    var help = 'I will respond to the following messages: \n' +
      '`@' + bot.identity.name + ' radar <location>` to provide a base reflectivity scan of a given location.\n' +
      '`@' + bot.identity.name + ' bvscan <location>` to provide a base velocity scan of a given location.\n' +
      '`@' + bot.identity.name + ' What\'s the weather in <location>` provide temperature and conditions.\n' +
      '`@' + bot.identity.name + ' help` to see this again.'
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
				var radarsite = convo.extractResponse('radarsite');
				
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
