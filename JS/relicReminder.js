//這是基於AIKA Online中的聖物紀錄器(格式如下)
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
const verify = require('./verification.js');
const moment = require('moment');
module.exports = {
    AddRelicList:function(Str,RelicJson){
        let RelicArray = Str.match(/[^\r\n]+/g);
        let ImportCnt = 0;
        if(Array.isArray(RelicArray)){
            RelicArray.forEach(function(item){
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
        return ImportCnt;
    },
    GetRelicList:function(RelicJson){
        let Str = "";
        RelicJson.forEach(function(item){
            var endtime = moment(item.endDate).fromNow();
            if(endtime.indexOf('minutes') >= 0 && endtime.indexOf('ago')<=0){
                if(verify.get_numbers(endtime) <= 30){
                    Str += item.relicName + " 在" + item.place + "剩 " + verify.get_numbers(endtime) + " 分" + "\n";
                }
            }
        })
        return Str;
    }
}