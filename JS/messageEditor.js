const verify = require('./verification.js');
module.exports = {
    AddItem: function(Obj,NewValue,IsNewParent) {
        let newItem = { weight: 1.0, message: NewValue };
        Obj.response.push(newItem);
        if(IsNewParent) return Obj;
    },
    AddParent:function(JsonFile,NewValue){
        let NewParentObj =  {
            "GUID": verify._uuid(),
            "request": keyName,
            "response": [],
            "pictureFlag": false,
            "tagFlag": false
        }
        JsonFile.push(module.exports.AddItem(NewParentObj,NewValue,true));
    },
    RemoveItem: function(Obj,NewValue) {
        return Obj.response.filter(msg => msg.message !== NewValue);      
    },
    SetWeight:function(JsonFile,message){
        let rtnObject = {
            SuccessFlag:false,
            ParentName:'',
            ChildName:'',
            NewWeight: 0
        }
        let args = message.substring(1).split(' ');
        JsonFile.forEach(function(Jitem,Jindex){
            if(Jitem.request == args[0]){
                rtnObject.ParentName = Jitem.request;
                Jitem.response.forEach(function(Ritem,Rindex){
                    if(Rindex == args[1] && verify.isFloat(args[2])){
                        JsonFile[Jindex].response[Rindex].weight = parseFloat(args[2]);
                        rtnObject.ChildName = JsonFile[Jindex].response[Rindex].message;
                        rtnObject.NewWeight = args[2];
                        rtnObject.SuccessFlag = true;
                    }
                })
            }
        })
        return rtnObject;
    },
    RelicReminder:function(Type,Str,channelID,JsonFile){
        
    },
    ShowList:function(JsonFile,message){
        let rtnObject = {SuccessFlag :false,Str:''}; 
        let args = message.substring(1).split(' ');
        let cmd = args[0];
        let Obj = JsonFile.filter(r=>r.request == cmd)[0];
        if(Obj)
        {
            Obj.response.forEach(function(item,index){
                rtnObject.Str += index + '. ' + item.message +  "("+ item.weight +") \n";
            })
            rtnObject.SuccessFlag = true;
        }
        return rtnObject;
    },
    ShowParentList:function(JsonFile){
        let rtnStr = ''; 
        JsonFile.forEach(function(item,index){
            rtnStr += index + '. ' + "!" + item.request + "\n";
        })
        return rtnStr;
    },
    Rename:function(args,userID,bot){
        //TODO Rename function
        console.log('args',args)
        console.log('args',bot.servers['452119391648219137'].members)
        // if(args){
        //     bot.editNickname({
        //         serverID: '452119391648219137',
        //         userID: userID,
        //         nick: args
        //     }, function(err){
        //         console.log(err);
        //     });
        // }
    },
    SetIgnoreList(args,userID,IgnoreList){
        let IgnoreObj = {Name:'',IsNew:false,Msg:''};
        let CreatFlag  = IgnoreList.some(
            item => item === args[1]
        );
        IgnoreObj.Name = args[1]; 
        if(CreatFlag){
            IgnoreObj.Msg = ' 已存在於忽視清單';
        }
        else{
            IgnoreObj.IsNew = true;
            IgnoreObj.Msg = ' 已加入忽視清單';
        }
        return IgnoreObj;
    }
};