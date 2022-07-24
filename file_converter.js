import Redis from 'ioredis'
import 'dotenv/config'

const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PASS = process.env.REDIS_PASS
const REDIS_PORT = process.env.REDIS_PORT

import fs from 'fs'

const FS_OPENING = 0;
const FS_ASTRAL_KEYS_BODY = 1;
const FS_CLOSING = 9;
let file_state = FS_OPENING;

const PATTERN_ASTRAL_KEYS = /AstralKeys =/;
const PATTERN_END_BLOCK = /^\}$/;
const PATTERN_NEXT_BLOCK = /\}, -- \[/;
const PATTERN_ATTRIBUTE = /\[\"([a-z\_]+)\"\] = "?([^\",]+)"?,/;

console.log("File converter");

const data = fs.readFileSync('test/AstralKeys.lua', 'utf-8');

let state = 0;

let currentRecord = {};
let AstralKeys = [];
let HighestWeek = 0;

data.split(/\r?\n/).forEach(line =>  {
    if(file_state === FS_OPENING) {        
        //console.log(`Opening: ${line}`);

        if(line.match(PATTERN_ASTRAL_KEYS) != null) {
            file_state = FS_ASTRAL_KEYS_BODY;
        }
    } else if(file_state === FS_ASTRAL_KEYS_BODY) {
        //console.log(`Body: ${line}`);

        if(line.match(PATTERN_NEXT_BLOCK)) {
            //console.log("NEXT");
            AstralKeys.push(currentRecord);
            currentRecord = {};
        }

        let attribute_data = line.match(PATTERN_ATTRIBUTE);
        if(attribute_data != null) {
            let key = attribute_data[1];
            let value;
            
            if(key === 'week' || key === 'key_level') {
                //We only really care about week and key level integers
                currentRecord[key] = value = parseInt(attribute_data[2]);
            } else {
                currentRecord[key] = value = attribute_data[2];
            }

            //This was going to compare to the highest week recorded, but all the data is the same week
            //So while this code is not that logical, it is prepared to be updated if the data changes
            //and for the time being it will only check the first record. Later I'll clean it up 
            if(HighestWeek == 0 && key === 'week') {
                HighestWeek = value;
            }
        }

        if(line.match(PATTERN_END_BLOCK) != null) {
            //console.log("Ended");
            file_state = FS_CLOSING;
        }
    }
});

console.log(AstralKeys);
console.log(AstralKeys.length);



let redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASS,
    tls: {}
  });

let key = `mythicpluskeys:keydata`
redis.set(key, JSON.stringify(AstralKeys));
console.log("Done");

