var Discord = require('discord.io');
var weightedRandom = require('weighted-random');
var messageEditor = require('./JS/messageEditor');
var relicReminder = require('./JS/relicReminder');
var logger = require('winston');
const fs = require('fs');
const fileName = './Json/responseList.json';
const relicfileName = './Json/Relic.json';
var auth = require('./Json/auth.json');
var ConfigJson = require('./Json/config.json');
var RelicJson = require(relicfileName);
var JsonFile = require(fileName);
var moment = require('moment');
var os = require('os');
var hostname = os.hostname();

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
    logger.info(`Host:${os.hostname()}`);
    GetBaseInfo()
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
                
                if(Obj.response[selectionIndex]!=undefined){
                    randomMsg = Obj.response[selectionIndex].message;
                }
                else{
                    return;
                }

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
                        tts: ConfigJson.SttFlag
                    });
                }
            }
        }
        else
        {
            let IgnoreWord  = ConfigJson.IgnoreList.some(
                item => item === cmd
            );

            if(!IgnoreWord){        
                if(ConfigJson.DefaultMsgTagFlag){
                    var rtnItem =  serverInfo.members[Math.floor(Math.random() * serverInfo.members.length)];
                    bot.sendMessage({to: channelID,message: ConfigJson.DefaultMsg + "<@"+rtnItem+">"});
                }
                else{
                    bot.sendMessage({to: channelID,message: ConfigJson.DefaultMsg + "<@"+userID+">"});
                }
            }    
        }
     }
     //Add JsonList
     else if(prefix == '+' || prefix == '-')
     {
        let EditArray = message.split(' ');
        let Regex = /^-(play|P|next|p|q)/;
        
        let IgnoreFlag  = ConfigJson.IgnoreAddList.some(
            item => EditArray[0].startsWith(item)
        );

        if(EditArray[0].match(Regex) || IgnoreFlag){       
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

        let Obj = JsonFile.filter(d=>d.request == keyName)[0]
        if(Obj)
        {
            console.log('Obj',Obj)  
            let IsExist = Obj.response.filter(msg=>msg.message == NewValue);

            if(IsExist.length > 0)
            {
                if(prefix == "-")
                {
                    Obj.response = messageEditor.RemoveItem(Obj,NewValue)
                    SendMessagge(channelID,NewValue,3447003,' 已移除')
                }
                else
                {
                    SendMessagge(channelID,NewValue,3447003,' 已存在')
                }
            }
            else if(prefix === "+")
            {  
                messageEditor.AddItem(Obj,NewValue,false);                
                SendMessagge(channelID,NewValue,3447003,' 已加入')
            }
            else
            {
                SendMessagge(channelID,NewValue,15158332,' 不存在，無法移除')
            }
        }
        else if(prefix == "+")
        {
            messageEditor.AddParent(JsonFile,NewValue);
            SendMessagge(channelID,keyName + ' ' +NewValue,3447003,'已加入')
        }
        else
        {
            SendMessagge(channelID,keyName + ' ' +NewValue,15158332,'母項不存在，無法移除')
        }
        SaveJson();
     }
     else if(prefix == "*")
     {
        let MessageList = messageEditor.ShowList(JsonFile,message);
        if(MessageList.SuccessFlag){
            bot.sendMessage({to: channelID,message:'```\n' + MessageList.Str + '```'});
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
                bot.joinVoiceChannel(ConfigJson.DefaultVoiceServer, (err) => {
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
                messageEditor.Rename(args,userID,bot);
                break;
            case "tts":
                ConfigJson.SttFlag = ConfigJson.SttFlag == true ? false : true;
                let msg = ConfigJson.SttFlag == true ? "語音已開啟" :"語音已關閉";      
                bot.sendMessage({to:channelID,message: "```"+ msg +"```"});
                break;
            case "ignore":    
                let rtnObj = messageEditor.SetIgnoreList(args,userID,ConfigJson.IgnoreList);
                if(rtnObj.IsNew){
                    ConfigJson.IgnoreList.push(args[1]);
                }
                SendMessagge(channelID,rtnObj.Name ,3447003, rtnObj.Msg)
                break;
            case "monkey":
            case "mouse":
                ConfigJson.DefaultMsgTagFlag = ConfigJson.DefaultMsgTagFlag == true ? false : true;
                let msg2 = ConfigJson.DefaultMsgTagFlag == true ? "預設回復已開啟" :"預設回復已關閉";      
                bot.sendMessage({to:channelID,message: "```"+ msg2 +"```"});
                break;
            case "reply":
                ConfigJson.DefaultMsg = args[1];
                bot.sendMessage({to:channelID,message: "```預設回復已更改為 "+ args[1] +"```"});
                break;
            case "ignoreAdd":
                let rtnAddObj = messageEditor.SetIgnoreList(args,userID,ConfigJson.IgnoreAddList);
                if(rtnAddObj.IsNew){
                    ConfigJson.IgnoreAddList.push(args[1]);
                }
                SendMessagge(channelID,rtnAddObj.Name ,3447003, rtnAddObj.Msg)
                break;
            case "allParent":
                let rtnParentStr = messageEditor.ShowParentList(JsonFile);
                if(rtnParentStr!=''){
                    bot.sendMessage({to:channelID,message:'```\n' + rtnParentStr + '```'});
                }
                break;
        }
     }
     else if(prefix == "$")
     {
        //RelicReminder(1,message.replace('$',''),channelID);
     }
     else if(prefix == "%")
     {
        let weightResult = messageEditor.SetWeight(JsonFile,message)
        if(weightResult.SuccessFlag)
        {
            SaveJson();
            SendMessagge(channelID,'',3447003,weightResult.ParentName + ',' + weightResult.ChildName + ' 已變更為 ' + weightResult.NewWeight)
        }
        else
        {
            SendMessagge(channelID,'',15158332,'無法更新')
        }
     }
     else
     {
        if(message.indexOf('吵死') >= 0){
            bot.sendMessage({to: channelID,message: '你好兇 ' + "<@"+ userID +">"});
        }
        else if(userID=="632244428718997526" && message == "<:PandaRee:701824934942474281>"){    
            bot.sendMessage({to: channelID,message: '想喇及? <@632244428718997526>'});
            bot.addReaction({
                channelID: channelID,
                messageID: evt.d.id,
                reaction: "💋"
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

function SaveJson(){
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
    serverInfo.members = Object.keys(bot.servers[ConfigJson.MainServer].members);
}

function SetPresence(args){
    
    let name = args == undefined ? "可撥的老鼠": args
    
    bot.setPresence({
        //idle_since: Date.now() - (1000 * 60 * 60),
        game:{
            name: name,
            type:2
        }
    });
}

console.log(new Date().toLocaleTimeString() + ' ========start========')

//半小時提醒一次
//var myVar = setInterval(function(){RelicReminder(2)},1200000);

//聖物提醒 (1.紀錄 2.提醒)
function RelicReminder(Type,Str,channelID)
{
    if(Type == 1)
    {
        let importCnt = relicReminder.AddRelicList(Str,RelicJson);
        if(importCnt>0){
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
    }
    else
    {           
        relicListStr = relicReminder.GetRelicList(RelicJson) 
        if(relicListStr!=""){
            bot.sendMessage({to: ConfigJson.RelicChannel,message: Str});
        }
    }
}

function SendMessagge(channelID,NewValue,Color,Msg){
    bot.sendMessage({
        to:channelID,
        embed: {
            color: Color,
            description: NewValue + Msg
        }
    });
}