module.exports = {
    isFloat:function(n){
        return n=== n && n!==(n|0);
    },
    _uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
    },
    get_numbers(input) {
        return input.match(/[0-9]+/g);
    },
    inputBetweenChar(soure,start, newStr){
        return soure.slice(0, start) + newStr + soure.slice(start);
    }
};