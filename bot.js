import Redis from 'ioredis'
import Discord from 'discord.js'

const REDIS_URL = process.env.REDIS_URL
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const KEYS_COMMAND = "!keys"

let redis = new Redis(REDIS_URL)
let client = new Discord.Client()

client.login(DISCORD_TOKEN)

client.on('ready', () => {
  client.on('message', async message => {

    if (message.author.bot) return
    if (message.type === 'dm') return

    let keyspace = `mythickeyplus:user:${message.author.id}`
    let countKey = `${keyspace}:count`
    
    let filterDefined = await redis.exists(filterKey)
    if (!filterDefined) {
      redis.call('BF.RESERVE', filterKey, 0.01, 10000)
    }

    let newMessage = await redis.call('BF.ADD', filterKey, message.content)
    if (!newMessage) return

    let confirmed = await redis.getbit(confirmedKey, 0)
    if (confirmed) return

    //TODO remove this counting, just search for !keys case insensitive
    let count = message.content
      .split(' ')
      .map(word => word.toLowerCase())
      .filter(word => word === KEYS_COMMAND)
      .length
    if (!count) return
    // let totalCount = await redis.incrby(countKey, count)

    message.author.send("◬ Work in Progress ◬")
  })
})
