import Redis from 'ioredis'
import Discord from 'discord.js'
import 'dotenv/config'

const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PASS = process.env.REDIS_PASS
const REDIS_PORT = process.env.REDIS_PORT
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const KEYS_COMMAND = "!keys"

const WHITE_LIST = ["Threatdown-Mal'Ganis", "Forbins-Mal'Ganis"];

const DUNGEON_TABLE = {
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
    if(channel_name != 'bot-testing') return;
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
        keyData.forEach(keyRecord => {
          if(WHITE_LIST.includes(keyRecord["unit"])) {
            console.log(keyRecord);
            let friendString = `${keyRecord["unit"]} has a ${keyRecord["key_level"]} ${DUNGEON_TABLE[keyRecord["dungeon_id"]]}`;
            console.log(friendString);
            friendData.push(friendString)
          }          
        });
      }
      
      if(friendData.length > 0) {
        message.channel.send(friendData.join('\n'));
      } else {
        message.channel.send("No Keys found, please upload");
      }
    });
  })
  console.log("Hello waiting for commands");
})
