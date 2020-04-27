var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const fs = require('fs');
const fileName = './responseList.json';
var JsonFile = require(fileName);
var _DefaultMsg = "哩西勒公三小!? ";

logger.remove(logger.transports.Console);

logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// 初始化 Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true,
   autoReconnect:true
});

//Server 資訊
let serverInfo = {
    members:null,
    emojis:null,
    guidsSize:null
}

//機器人初始
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    //logger.info(responseList);
    //GetUserCnt();
    //bot.sendMessage({to: '701815724611469372',message:`Bot has started, with ${serverInfo.members.length} users,${serverInfo.emojis.length} emojis`});  
});


bot.on("channelCreate", function(channel){
    console.log(`channelCreate: ${channel}`);
});


//機器人接收到訊息後
bot.on('message', function (user, userID, channelID, message, evt) { 
    console.log('user: ' + user + ' userID: ' + userID);
    var prefix = message.substring(0, 1);
    if (prefix == '!') {     
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        var randomMsg = "",randomPic = "";         
        args = args.splice(1);         
        var Obj = JsonFile.filter(r=>r.request == cmd)[0];
        if(Obj)
        {      
            if(Array.isArray(Obj.response))
            {
                randomMsg = Obj.response[Math.floor(Math.random() * Obj.response.length)]; 
 
                if(Obj.pictureFlag)
                {
                    randomPic = Obj.url[Math.floor(Math.random() * Obj.url.length)]; 
                    
                    bot.sendMessage({
                        to:channelID,
                        embed: {
                            color: 3447003,
                            description: randomMsg,
                            image: {url: "https://cdn.discordapp.com/emojis/" + randomPic}
                        }
                    });
                }
                else
                {
                    bot.sendMessage({to: channelID,message: randomMsg, tts: true });
                }
            }

            if(randomMsg == "夜裡晶珂"){
                bot.uploadFile({to: channelID,file:'./Image/1587170283732.jpg'});         
            }
        }
        else
        {
            bot.sendMessage({to: channelID,message: _DefaultMsg + "<@"+userID+">"});
        }
     }
     //Add JsonList
     else if(prefix == '+' || prefix == '-')
     {
        let EditArray = message.split(' ');
        let Regex = /^-(play|next|p|q)/;

        if(EditArray[0].match(Regex)){       
            return false;
        }

        if(prefix == "+")
        {
            keyName = EditArray[0].replace('+','');

        }
        else
        {
            keyName = EditArray[0].replace('-','');
        }



        let NewValue = EditArray[1];
        let Obj = JsonFile.filter(d=>d.request == keyName)[0]

        if(Obj)
        {
            console.log('Obj',Obj)  
            let IsExist = Obj.response.filter(msg=>msg == NewValue);

            if(IsExist.length > 0)
            {
                if(prefix == "-")
                {
                    Obj.response = Obj.response.filter(msg => msg !== NewValue);
                    bot.sendMessage({
                        to:channelID,
                        embed: {
                            color: 3447003,
                            description: NewValue +' 已移除'
                        }
                    });
                }
                else
                {
                    bot.sendMessage({
                        to:channelID,
                        embed: {
                            color: 3447003,
                            description: NewValue +' 已存在'
                        }
                    });
                }
            }
            else if(prefix === "+")
            {  
                Obj.response.push(NewValue);              
                bot.sendMessage({
                    to:channelID,
                    embed: {
                        color: 3447003,
                        description: NewValue +' 已加入'
                    }
                });
            }
            else
            {
                bot.sendMessage({
                    to:channelID,
                    embed: {
                        color: 15158332,
                        description: NewValue  +' 不存在，無法移除'
                    }
                });
            }
        }
        else if(prefix == "+")
        {
            let NewObj =  {
                "GUID": _uuid(),
                "request": keyName,
                "response": [],
                "pictureFlag": false,
                "tagFlag": false
              }
            NewObj.response.push(NewValue);
            JsonFile.push(NewObj);  
            bot.sendMessage({
                to:channelID,
                embed: {
                    color: 3447003,
                    description:  keyName + ' ' + NewValue +' 已加入' 
                }
            });
        }
        else
        {
            bot.sendMessage({
                to:channelID,
                embed: {
                    color: 15158332,
                    description:  keyName + ' ' + '母項不存在，無法移除' 
                }
            });
        }
        SaveJson();
     }
     else if(prefix == "*")
     {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        let Obj = JsonFile.filter(r=>r.request == cmd)[0];
        let Str = "";
          
        if(Obj)
        {
            Obj.response.forEach(function(item,index){
                Str += index + '. ' + item + "\n";
            })

            bot.sendMessage({to: channelID,message: Str});
        }
        else
        {
            bot.sendMessage({to: channelID,message: cmd + ' 項目不存在' });
        }
     }
     else
     {
        console.log(message)
        
        if(message.indexOf('笑死') >= 0){
            bot.sendMessage({to: channelID,message: 'XDDDDDDDDDDDDDDDDDDDDDDDDDDDDD'});
        }
        else if(message.indexOf('ㄌㄐ')>=0 && prefix !="*"){
            var msgsplit = message.split(" ");
            bot.sendMessage({to: channelID,message: '說你呢! <@632244428718997526>'});
        }
     }
});

bot.on("channelCreate", function(channel){
    console.log(`channelCreate: ${channel}`);
});

bot.on('disconnect', function(evt){
    console.log('可撥鼠離線了');  
});

bot.on("reconnecting", function(evt){
    
    console.log('client tries to reconnect to the WebSocket');  
});

function _uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
}

function SaveJson()
{
    fs.writeFile(fileName, JSON.stringify(JsonFile), function writeJSON(err) {
        if (err) return console.log(err);
    });
}

function GetUserCnt(){
    serverInfo.members = Object.keys(bot.servers['701636190482202624'].members);
    serverInfo.emojis = Object.keys(bot.servers['701636190482202624'].emojis);
}


let myVar = setInterval(function(){myTimer()},1000);

function myTimer()
{
    var d=new Date();
    var t=d.toLocaleTimeString();
    console.log(t);
}

// var minute = new Date().getMinutes(),nextRefresh = (15 - (minute % 15)) * 60 * 1000;

// setTimeout( function() 
// { 
//     logger.info(bot.username + ' - (' + bot.id + ')' + 'mins: ' + minute);
// }, nextRefresh );
