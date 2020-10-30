// Load up the discord.js library
const { Client, Collection } = require("discord.js");
const utils = require("./utils/HitRadioUtils.js");
const fs = require('fs');

const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.
let _TOKEN, _PREFIX;
try {
  _TOKEN = process.env.TOKEN;
  _PREFIX = process.env.PREFIX;
  console.log("HIT RADIO Prefix loaded from heroku : " + _PREFIX)

} catch (error) {
  console.error("Error :" + JSON.stringify(error));
  _TOKEN = process.env.TOKEN;
  _PREFIX = process.env.PREFIX;
}


let command;
// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Client();

// Here we load the config.json file that contains our token and our prefix values. 


client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  console.log(" This event will run on every single message received")
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;

  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if (!message.content.startsWith(config.prefix)) return;

  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);

  command = args[0];
  args.shift().trim();


  // Let's go with a few common example commands! Feel free to delete or change those.

  if (command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Maison-B Ping : ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  }


  if (command === "play") {
    var voice, player;
    // To join channel
    // Keep in mind this may be undefined if
    const voiceChannelID = message.member.voice.channelID;
    var voiceChannel = message.member.voice.channel;


    if (!voiceChannel) {
      message.reply("You are not in the correct channel.");
    }

    client.channels.cache.get(voiceChannelID).join()
      .then((connection) => {

        //voice = connection
        // Create an instance of a VoiceBroadcast
        //const broadcast = voice.createBroadcast();
        const dispatcher = connection.play(process.env.HITRADIO_STREAM);

        //dispatcher.on("end", end => {VC.leave()});

      }).catch(e => {
        console.error(e)
      })

    // To stream audio
    // player = voice.playArbitraryInput(stream.url);


    // Play audio on the broadcast
    // Play this broadcast across multiple connections (subscribe to the broadcast)

    // To stop
    // player.end();
  }

  if (command === "cls") {
    // This command removes all messages from all users in the channel, up to 100.
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);

    // Ooooh nice, combined conditions. <3
    if (!deleteCount || deleteCount < 2 || deleteCount > 200)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.messages.fetch({ limit: deleteCount });
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

client.login(_TOKEN);