import Redis from 'ioredis'
import Discord from 'discord.js'
import 'dotenv/config'
import * as http from 'http'


const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PASS = process.env.REDIS_PASS
const REDIS_PORT = process.env.REDIS_PORT
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const KEYS_COMMAND = "!keys"

const WHITE_LIST = [
    "Threatdown-Mal'Ganis",
    "Forbins-Mal'Ganis",
    "Proctorb-Mal'Ganis",
    "Lelliana-Mal'Ganis",
    "Adriatikis-Mal'Ganis",
    "Wagsrogue-Mal'Ganis",
    "Adamdd-Mal'Ganis",
    "Rexaj-Mal'Ganis",
    "Adamd-Mal'Ganis",
    "Adamddh-Mal'Ganis",
    "Yenstah-Mal'Ganis",
    "Yensta-Mal'Ganis",
    "Wagsdruid-Mal'Ganis",
    "Wagsshaman-Mal'Ganis",
    "Wagsmonk-Mal'Ganis",
    "Moleboi-Mal'Ganis",
    "Münkybrewstr-Mal'Ganis",
    "Moleboye-Mal'Ganis",
    "Moleboy-Mal'Ganis",
    "Molebuoy-Mal'Ganis",
    "Picklzz-Mal'Ganis",
    "Foxmckloud-Mal'Ganis",
    "Maggottron-Mal'Ganis",
    "Tokiwarteeth-Mal'Ganis",
    "Kriegerdots-Mal'Ganis",
    "Saintcaine-Mal'Ganis",
    "Gaelfury-Mal'Ganis",
    "Holybabe-Mal'Ganis",
    "Nomilk-Mal'Ganis",
    "Dubert-Mal'Ganis",
    "Holybabes-Mal'Ganis"];

const DUNGEON_TABLE = {
  "375": "Mists     ",
  "376": "Necrotic  ",
  "377": "DoS       ",
  "378": "Halls     ",
  "379": "Plaguefall",
  "380": "Sanguiney ",
  "381": "Spires    ",
  "382": "Theater   ",
  "391": "Streets   ",
  "392": "Gambino   ",
  "391F": "Streets   ",
  "392F": "Gambino   "
};

const DUNGEON_TABLE_LONG = {
  "375": "Mists of Tirna Scithe",
  "376": "The Necrotic Wake",
  "377": "De Other Side",
  "378": "Halls of Atonement",
  "379": "Plaguefall",
  "380": "Sanguine Depths",
  "381": "Spires of Ascension",
  "382": "Theater of Pain",
  "391": "Streets of Wonder",
  "392": "So'leah's Gambit",
  "391F": "Streets of Wonder",
  "392F": "So'leah's Gambit"
};

let min_key_level = 15;

let redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASS,
  tls: {}
});
let client = new Discord.Client();

client.login(DISCORD_TOKEN)

client.on('ready', () => {
  client.on('message', async message => {
    if (message.author.bot) return
    if (message.type === 'dm') return

    let channel_name = message.channel.name;
    if(channel_name != 'bot-testing' && channel_name != "wow") return;
    console.log(message.content);

    /**/
    let keyspace = `mythicpluskeys`;
    let dataKey = `${keyspace}:keydata`;
    let countKey = `${keyspace}:count`;
  
    /**/
    //TODO remove this counting, just search for !keys case insensitive
    let count = message.content
      .split(' ')
      .map(word => word.toLowerCase())
      .filter(word => word === KEYS_COMMAND)
      .length
    if (!count) return
    let totalCount = await redis.incrby(countKey, count)
        
    redis.get(dataKey, (err, result) => {
      let friendData = [];

      if (err) {
        console.error(err);
      } else {
        let keyData = JSON.parse(result);
        keyData.sort((a, b) => (a["key_level"] < b["key_level"]) ? 1 : -1);

        keyData.forEach(keyRecord => {
          if(WHITE_LIST.includes(keyRecord["unit"]) && keyRecord["key_level"] >= min_key_level) {
            //console.log(keyRecord);
            let friendName = keyRecord["unit"].split('-')[0];
            let friendString = `${keyRecord["key_level"]} ${DUNGEON_TABLE[keyRecord["dungeon_id"]]} ${friendName}`;
            //console.log(friendString);
            friendData.push(friendString)
          }          
        });
      }

      
      
      if(friendData.length > 0) {
        message.channel.send(`\`\`\`\n${friendData.join('\n')}\n\`\`\``);
      } else {
        message.channel.send("No Keys found, please upload");
      }
    });
  })
  console.log("Hello waiting for commands");
})

// Required for Azure hosting...
var server = http.createServer(function (request, response) {
  response.writeHead(200, { "Content-Type": "text\plain" });
  if (request.method == "GET") {
   response.end("received GET") 
  }
});

server.listen(8080);