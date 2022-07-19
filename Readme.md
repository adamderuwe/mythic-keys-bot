## TODO

-[ ] convert LUA to JSON
```
var lua2Json = luaStr => luaStr.replace(/\[|\]/g, '').replace(/=/g, ':').replace(/(\,)(?=\s*})/g, '');
```
-[ ] store results in redis
-[ ] lockout upload based on redist key