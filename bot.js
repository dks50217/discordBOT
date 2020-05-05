var Discord = require('discord.io');
var weightedRandom = require('weighted-random');
var logger = require('winston');
var auth = require('./auth.json');
const fs = require('fs');
const fileName = './responseList.json';
const relicfileName = './Relic.json';
var JsonFile = require(fileName);
var ConfigJson = require('./config.json');
var RelicJson = require('./Relic.json');
var moment = require('moment');
var os = require('os');
var hostname = os.hostname();
var _sttFlag = false;

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
    //701827534026965053
    //logger.info(responseList);
    //bot.sendMessage({to: '701815724611469372',message:`Bot has started, with ${serverInfo.members.length} users,${serverInfo.emojis.length} emojis`}); 
    //bot.sendMessage({to: '701827534026965053',message: '-p https://www.youtube.com/watch?v=AXWypFP1bJE'});
});


bot.on("channelCreate", function(channel){
    console.log(`channelCreate: ${channel}`);
});


//機器人接收到訊息後
bot.on('message', function (user, userID, channelID, message, evt) { 
    console.log('user: ' + user + ' userID: ' + userID + ' channelID: ' + channelID);
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
                
                var weights = Obj.response.map(function (item) {
                    return item.weight;
                });
                

                var selectionIndex = weightedRandom(weights);
                randomMsg = Obj.response[selectionIndex].message;

                //randomMsg = Obj.response[Math.floor(Math.random() * Obj.response.length)].message; 
 
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
                    bot.sendMessage({
                        to: channelID,
                        message: randomMsg, 
                        tts: _sttFlag
                    });
                }
            }

            if(randomMsg == "夜裡晶珂"){
                bot.uploadFile({to: channelID,file:'./Image/1587170283732.jpg'});         
            }
        }
        else
        {
            bot.sendMessage({to: channelID,message: ConfigJson.DefaultMsg + "<@"+userID+">"});
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

        let NewValue = "";

        EditArray.forEach(function(item,index){
            if(index>0){
                NewValue += EditArray[index]
            }
        })


        //let NewValue = EditArray[1]
        let Obj = JsonFile.filter(d=>d.request == keyName)[0]

        if(Obj)
        {
            console.log('Obj',Obj)  
            let IsExist = Obj.response.filter(msg=>msg.message == NewValue);

            if(IsExist.length > 0)
            {
                if(prefix == "-")
                {
                    Obj.response = Obj.response.filter(msg => msg.message !== NewValue);
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
                let newItem = {weight: 1.0, message: NewValue};

                Obj.response.push(newItem);              
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
            let NewItem = {weight: 1.0, message: NewValue};
                     
            let NewObj =  {
                "GUID": _uuid(),
                "request": keyName,
                "response": [],
                "pictureFlag": false,
                "tagFlag": false
              }
            NewObj.response.push(NewItem);
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
                Str += index + '. ' + item.message +  "("+ item.weight +") \n";
            })

            bot.sendMessage({to: channelID,message:'```\n' + Str + '```'});
        }
        else
        {
            bot.sendMessage({to: channelID,message: cmd + ' 項目不存在' });
        }
     }
     else if(prefix == "#")
     {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        console.log('prefix:' + prefix + " , cmd:" + cmd);

        switch(cmd)
        {
            case "join":
                //bot.joinVoiceChannel(ConfigJson.DefaultVoiceServer);
                bot.joinVoiceChannel(ConfigJson.DefaultVoiceServer, (err) => {
                    //if(err) return console.log(err);
                    bot.getAudioContext(ConfigJson.DefaultVoiceServer, (err, stream) => {
                        if(err) return console.log(err);
                        playing = fs.createReadStream('mouse.mp3');                        
                        playing.pipe(stream, {end: false});
                    });
                });
                break;
            case "leave":
                bot.leaveVoiceChannel(ConfigJson.DefaultVoiceServer);
                break;
            case "mute":
                bot.mute( {
                    serverID: ConfigJson.DefaultVoiceServer,
                    userID: '452119263138938880'
                },function(error){
                    console.log(error)
                });
                break;
            case "presence":
                SetPresence(args[1])
                break;
            case "rename":
                break;
            case "tts":
                _sttFlag = _sttFlag == true ? false : true;
                let msg = _sttFlag == true ? "語音已開啟" :"語音已關閉";
                
                bot.sendMessage({
                    to:channelID,
                    message: "```"+ msg +"```",
                });
                break;
        }
     }
     else if(prefix == "$")
     {
        RelicReminder(1,message.replace('$',''),channelID);
     }
     else if(prefix == "%")
     {
        let successFlag = false;    
        let args = message.substring(1).split(' ');
        let Obj = JsonFile.filter(r=>r.request == args[0])[0];   
        JsonFile.forEach(function(Jitem,Jindex){
            if(Jitem.request == args[0]){
                Jitem.response.forEach(function(Ritem,Rindex){
                    if(Ritem.message == args[1] && isFloat(args[2])){
                        JsonFile[Jindex].response[Rindex].weight = parseFloat(args[2]);
                        successFlag = true;
                    }
                })
            }
        })
        
        
        // if(Obj)
        // {
        //     let weightItem = Obj.response.filter(item=>item.message == args[1])

        //     if(weightItem)
        //     {
        //         if(isFloat(args[2])){
        //             weightItem.weights = args[2];
        //             successFlag = true;
        //         }
        //     }
        // }

        if(successFlag)
        {
            SaveJson();
            
            bot.sendMessage({
                to: channelID,
                embed: {
                    color: 3447003,
                    description: args[0] + ',' + args[1] + ' 已變更為 ' + args[2],
                    footer: {
                        "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
                        "text": "hostname: " + hostname
                    },
                }
            });
        }
        else
        {
            bot.sendMessage({
                to:channelID,
                embed: {
                    color: 15158332,
                    description: args[1]  + '不存在，無法更新' 
                }
            });
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
        else if(userID == "632244428718997526" && message.indexOf('沒有')>=0){
            bot.sendMessage({to: channelID,message: '有吧!不要不承認 <@632244428718997526>'});
        }
        else if(userID=="632244428718997526" && message == "<:PandaRee:701824934942474281>"){    
            bot.sendMessage({to: channelID,message: '想喇及? <@632244428718997526>'});
            bot.addReaction({
                channelID: channelID,
                messageID: evt.d.id,
                reaction: "👩‍❤️‍👩"
            }, function(err, res) {
                if (err) { throw err; }
            });
        }
     }
});

bot.on("channelCreate", function(channel){
    console.log(`channelCreate: ${channel}`);
});

bot.on('disconnect', function(evt){
    console.log('disconnect! reconnecting...')
    bot.connect();
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


function SaveRelicJson(){
    fs.writeFile(relicfileName, JSON.stringify(RelicJson), function writeJSON(err) {
        if (err) return console.log(err);
    });
}

function GetBaseInfo(){
    serverInfo.members = Object.keys(bot.servers['701636190482202624'].members);
    serverInfo.emojis = Object.keys(bot.servers['701636190482202624'].emojis);
}

function SetPresence(args){
    
    let name = args == undefined ? "可撥的老鼠": args
    
    bot.setPresence({
        idle_since: Date.now() - (1000 * 60 * 60),
        game:{
            name: name,
            type:1
        },
        status: 'idle'
    });
}

function Rename(args,userID)
{   
    if(args)
    {
        bot.editNickname({
            serverID: '701636190482202624',
            userID: userID,
            nick: args
        }, function(err){
            console.log(err);
        });
    }
}


console.log(new Date().toLocaleTimeString() + ' ========start========')

//半小時提醒一次
var myVar = setInterval(function(){RelicReminder(2)},1200000);


//聖物提醒 (1.紀錄 2.提醒)
function RelicReminder(Type,Str,channelID)
{
    if(Type == 1)
    {
        /*
            藍阿姆 劍1720
            紅叢林 槍香火杯1837
            藍阿姆 甲1838
            藍沙漠 雙杖.甲1847
            紅KC 水1850
            紅KC 杯1902
            藍阿姆 LV2珠1907
            紅沙漠 秤1943
            紅叢林 LV2經1945
            黃沙漠 盾2013
            紅阿姆 LV2弓2024
        */
       
       let RelicArray = Str.match(/[^\r\n]+/g);
       let ImportCnt = 0;

       if(Array.isArray(RelicArray)){
        RelicArray.forEach(function(item){
            console.log(item);
            ImportCnt++
            let ItemArray = item.split(' ');
            let relicTimeArray = ItemArray[1].split(/([0-9]+)/);
            let place = ItemArray[0];
            let relicName = relicTimeArray[0];
            let time = relicTimeArray[1];
            let Date = moment().format('YYYY-MM-DD');       
            console.log("place: " + place + " relicName: " + relicName + " time: " + time);
            let NewRelicObj = {
                "relicName":relicName,
                "place":place,
                "endDate": Date + " "+ inputBetweenChar(time,2,":") + ":00"
             }   

             RelicJson.push(NewRelicObj);
        });
       }

       SaveRelicJson();
       

    
        bot.sendMessage({
            to: channelID,
            embed: {
                color: 3447003,
                description: '共新增 ' + ImportCnt + ' 項',
                footer: {
                    "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
                    "text": "hostname: " + hostname
                },
            }
        });
    }
    else
    {     
        let Str = "";
        
        RelicJson.forEach(function(item){
            var endtime = moment(item.endDate).fromNow();
            console.log(endtime)
            if(endtime.indexOf('minutes') >= 0 && endtime.indexOf('ago')<=0)
            {
                if(get_numbers(endtime) <= 30){
                    Str += item.relicName + " 在" + item.place + "剩 " + get_numbers(endtime) + " 分" + "\n";
                }
            }
            else if(endtime.indexOf('ago')>=0){

            }
        })

        if(Str!="")
        {
            bot.sendMessage({to: '701815724611469372',message: Str});
        }
    }
}

function get_numbers(input) {
    return input.match(/[0-9]+/g);
}

function inputBetweenChar(soure,start, newStr){
    return soure.slice(0, start) + newStr + soure.slice(start);
}

function isFloat (n){
    return n=== n && n!==(n|0);
}