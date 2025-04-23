var _T = {
    ETA: [],
    ETAID:0,

    getETA: function(id){
        return this.ETA.find(w=>w.ID==id);
    },
    pushETA: function(data){
        var original = this.ETA.find(w=>w.parm==data.parm);
        if(original){
            this.ETA.splice(this.ETA.indexOf(original),1);

            data.dict.forEach((key, index) => {
                let originalETA = original[key];
                let newETA = data[key];
                let originalIndex = 0;
                let newIndex = 0;

                while (originalIndex < originalETA.length && newIndex < newETA.length) {
                    const originalItem = originalETA[originalIndex];
                    const newItem = newETA[newIndex];
                    const originalTime = new Date(originalItem.time.replace("Z","+08:00"));
                    const originalTime2 = (originalETA[originalIndex+1] ? new Date(originalETA[originalIndex+1].time.replace("Z","+08:00")) : NaN);
                    const newTime = new Date(newItem.time.replace("Z","+08:00"));
                    const timeDifference = Math.abs(newTime - originalTime) / (1000 * 60); // time difference in minutes

                    if (timeDifference > 5 || (originalTime2 && Math.abs(originalTime2 - newTime) < Math.abs(originalTime - newTime))) {
                        originalIndex++;
                        continue;
                    }

                    newItem.delta = originalItem.delta + (newTime - originalTime) / 1000;
                    originalIndex++;
                    newIndex++;
                }
            });
            
        }
        this.ETA.push(data);
    },

    /**
     * @function fetchETA
     * @description Fetch the ETA data from API asynchronously 
     * @param {string} theUrl - The URL of the API endpoint
     * @param {function} callback - The callback function to process the response
     * @param {*} parm - Additional parameter to be passed to the callback function
     */
    fetchETA: async function (theUrl, callback, parm) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(JSON.parse(xmlHttp.responseText),parm,xmlHttp);
        }
        xmlHttp.open("GET", theUrl, true); 
        xmlHttp.send(null);
    },

    /**
     * @function timeparse
     * @description Parse the ETA time string into a human-readable format
     * @param {string|Date} e - The time string to be parsed
     * @param {number} mode - 1 for displaying the time in 24-hour format, 0 for displaying the time difference
     * @return {string} The parsed time string
     */
    timeparse : function(e,parm={}){
        var _S={"m":"分","s":"秒"};
        if(parm.small)_S={"m":"<small>分</small>","s":"<small>秒</small>"};

        if (!(e instanceof Date)) {
            e = new Date(e.replace("Z","+08:00"))
        }

        let diffSeconds = Math.floor((e - new Date()) / 1000);
        
        if (parm.mode === 1) {
            return e.toTimeString().slice(0, 5);
        }
        if (diffSeconds <= 0) 
            return `${parm.jj?"即將抵達":""} -${Math.abs(diffSeconds)}${_S.s}`;
        if (diffSeconds <= 90) 
            return `${diffSeconds}${_S.s}`;
        if (diffSeconds < 480) {
            let minutes = Math.floor(diffSeconds / 60);
            let seconds = diffSeconds % 60;
            return `${minutes}${_S.m}${seconds}${_S.s}`;
        }
        return `${Math.floor(diffSeconds / 60)}${_S.m}`;
    
    },

    /**
     * @function timeparse2
     * @description Format time duration in seconds to a human-readable string
     * @param {number} sec - The time duration in seconds
     * @return {string} Formatted time string in the format of "Xm Ys" or "Zs" or "即將抵達"
     */
    timeparse2 : function(sec){
        return (sec < 0 ? "-" : "+") + (Math.abs(sec) <= 60 ? Math.abs(sec) + "s" : Math.floor(Math.abs(sec) / 60) + "m" + Math.abs(sec) % 60 + "s");
    },

    /**
     * @function filter_ETA
     * @description Remove the ETA data that is older than 1 minute
     */
    filter_ETA:function(){
        // Keep only the data that is newer than 1 minute
        this.ETA = this.ETA.filter(w=>w.timestamp>=(Date.now()-60000));
    },

    MTR_ETA: function(line, sta, callback){
        this.fetchETA(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line}&sta=${sta}`, function(data){
            var s = {
                "parm":line+"+"+sta,
                "ID":++(_T.ETAID),
                "line": line,
                "sta": sta,
                "timestamp":Date.now(),
                "dict":["UP","DOWN"]
            };
            ["UP","DOWN"].forEach(d=>{
                try{
                    s[d] = Object.values(data.data)[0][d];
                    s[d].forEach(g=>g.delta = 0);
                }catch(e){console.log(d,e)}
            });
            _T.pushETA(s);
            if(callback)callback(s,_T.ETAID)
        });
    }
}

