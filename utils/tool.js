'use strict';
const UUID = require('uuid');
const _ = require("lodash");
module.exports = {
    /**
     * genUID
     *for most case in simple chat room uuid.v1() works well
     * if concurrent users get repeated uuid, we should add redis-connect to query if uuid is exits
     * but it cost more network and import other problems
     * @returns unique Id for client connected
     */
    genUUID:function(){
        let uuid = UUID.v1().toString()
        return uuid.replace(/-/g,"")
    },

    getNowTimeStamp :function(){
        let timestamp = Date.now();
        return timestamp
    },
    padNum:function(num){
        return +num < 10 ? '0' + num : num.toString()
    },

    getdeltatime:function(timestamp){
         let now_timestamp = Date.now();
         console.log(timestamp)
         console.log(now_timestamp)

         let deltaTime = now_timestamp-timestamp;
         console.log(deltaTime)
         let days = Math.floor(deltaTime / ( 1000 * 60 * 60 * 24));
         let hours = Math.floor((deltaTime % ( 1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
         let minutes = Math.floor((deltaTime % ( 1000 * 60 * 60)) / ( 1000 * 60));
         let seconds = Math.floor(deltaTime % (1000 * 60)/1000);

         let daystr = +days < 10 ? '0' + days : days.toString()
         let hourstr = +hours < 10 ? '0' + hours : hours.toString()
         let minutestr = +minutes < 10 ? '0' + minutes : minutes.toString()
         let secondstr = +seconds < 10 ? '0' + seconds : seconds.toString()
         return `${daystr}d ${hourstr}h ${minutestr}m ${secondstr}s`;
    },

    readFile:function(path,callback){
        var fs=require('fs');
        fs.readFile(path,'utf-8',function(err,data){
            if(err){
                console.error(err);
                callback (err);
            }
            else{
                callback (null,data);
            }
        });
    },

    convert_to_words:function(string){
        var re = /\s*\b/g;
        var re2 = /[A-Z]/g;
        function convert(propertyName)
        {
            function upperToLower(match)
            {
                return match.toLowerCase();
            }
            return propertyName.replace(re2, upperToLower);
        }
        string = convert(string);
        var output = [];
        output = string.split(re);
        var output2 = [];
        for (var i = 0; i < output.length; i++) {
            if (output[i]!==',' && output[i]!==';' && output[i]!=='.')
               output2.push(output[i]);
        }

        var stopWords = ['a','about','above','after','again','against','all','am','an','and','any','are','aren\'t','as','at','be','because',
                 'been','before','being','below','between','both','but','by','can\'t','cannot','could','couldn\'t','did','didn\'t',
                 'do','does','doesn\'t','doing','don\'t','down','during','each','few','for','from','further','had','hadn\'t','has',
                 'hasn\'t','have','haven\'t','having','he','he\'d','he\'ll','he\'s','her','here','here\'s','hers','herself','him',
                 'himself','his','how','how\'s','i','i\'d','i\'ll','i\'m','i\'ve','if','in','into','is','isn\'t','it','it\'s','its',
                 'itself','let\'s','me','more','most','mustn\'t','my','myself','no','nor','not','of','off','on','once','only','or',
                 'other','ought','our','ours','ourselves','out','over','own','same','shan\'t','she','she\'d','she\'ll','she\'s',
                 'should','shouldn\'t','so','some','such','than','that','that\'s','the','their','theirs','them','themselves','then',
                 'there','there\'s','these','they','they\'d','they\'ll','they\'re','they\'ve','this','those','through','to','too',
                 'under','until','up','very','was','wasn\'t','we','we\'d','we\'ll','we\'re','we\'ve','were','weren\'t','what',
                 'what\'s','when','when\'s','where','where\'s','which','while','who','who\'s','whom','why','why\'s','with','won\'t',
                 'would','wouldn\'t','you','you\'d','you\'ll','you\'re','you\'ve','your','yours','yourself','yourselves'];
        stopWords.forEach(function(element){
        for(var i = output2.length - 1; i >= 0; i--) {
              if(output2[i] === element) {
                    output2.splice(i, 1);
                }
            }
        })
        console.log(output2);
        return output2
    },



    getPopularWords:function(words){
        let count_result = _.countBy(words)
        console.log(count_result)
        let sorted_result=Object.keys(count_result).sort(function(a,b){return count_result[a]-count_result[b]});
        return sorted_result
    }
}