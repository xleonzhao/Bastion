/**
 * @file conversationHandler
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

const request = require('request-promise-native');
const watson = require('./watson.js');
const responses = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes – definitely",
  "You may rely on it",
  "As I see it",
  "yes",
  "Most Likely",
  "Outlook good",
  "Yes",
  "Signs point to yes"
];

/**
 * Handles conversations with Bastion
 * @param {Message} message Discord.js message object
 * @returns {void}
 */
async function send_response(message, response) {
  message.client.log.console("[callback] response: " + JSON.stringify(response));
  message.channel.stopTyping(true);
  var str = "";

  var len = response.output.generic.length;  
    if (len >= 1) {
       for (var i = 0; i < len; i++) {
	 str = str + response.output.generic[i].text + ". ";
       }
       await message.channel.send({
	 embed: {
           color: message.client.colors.BLUE,
           //title: 'Invalid Use',
           description: `${str}`
         }
       }).catch(e => {
         //message.client.log.error(e);
	 console.log(e);
       });
    } else {
       const randomIndex = Math.floor(Math.random() * responses.length);
       await message.channel.send(responses[randomIndex]);
    }	  
}

module.exports = async message => {
  try {
    message.content = message.content.replace(/^<@!?[0-9]{1,20}> ?/i, '');

    if (message.content.length < 2) return;

    let guildModel = await message.client.database.models.guild.findOne({
      attributes: [ 'chat' ],
      where: {
        guildID: message.guild.id
      }
    });
	  console.log("get guildModel: " + JSON.stringify(guildModel));
    if (!guildModel.dataValues.chat) return;

    message.channel.startTyping();

    watson(message, send_response);
  }
  catch (e) {
    message.channel.stopTyping(true);
    message.client.log.error(e);
  }
};
