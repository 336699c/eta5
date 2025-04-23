const _direction = ["UP","DOWN"];
var _updateETA = -1;
var INPUT = parseInput();
function parseInput(){
    var urlParams = new URLSearchParams(window.location.search);
    return {
        "line": urlParams.get('line') || "ISL",
        "sta": urlParams.get('sta') || "ADM"
    };
}

function main(){
    _T.MTR_ETA(INPUT.line, INPUT.sta,((s,d)=>{
        _updateETA=d;
        buildETA(s);
    }));
}
main();
setInterval(main, 6000);
//update new ETA

function buildETA(etaData){
    // Clear element with id 'left-departures'
    document.getElementById('left-departures').innerHTML = '';
    document.getElementById('right-departures').innerHTML = '';

    // Get ETA data and append each item to 'left-departures'
    _direction.forEach(w=>{
        try{
        etaData[w].forEach((item,i) => {
        try{
        var div = document.createElement('div');
        div.className = 'departure-item';
        div.innerHTML = `<div><span class="route">${_MTR_DATA.station[item.dest].tc}</span><span class="platform ${INPUT.line}">${item.plat}</span></div><div><span class="delta_${(item.delta>0)?"red":"green"}">${_T.timeparse2(item.delta)}</span><span class="time" id="time_${w}_${i}">${_T.timeparse(item.time, {"small":true})}</span></div>`;
        document.getElementById(`${(w=="UP"?"left":"right")}-departures`).appendChild(div);
        }catch(e){console.log(e)}
    })
    }catch(error){}
});
}

var _runAlready = false;
setInterval(function() {
   if(_updateETA<0)return;
    
   //loop through UP ETA, update time with id "time_UP_{item.seq}"
   _direction.forEach(w=>{
       document.querySelectorAll(`[id^='time_${w}_']`).forEach(el=>{
           el.innerHTML = _T.timeparse(_T.getETA(_updateETA)[w][el.id.split('_')[2]].time, {"small":true});
       });
   });
}, 1000);

var interval = setInterval(function() {
if(!_runAlready){
    FirstRun();
    _runAlready=true;
    clearInterval(interval);
}
}, 100);

function return_cardoor(car_door){
    if(car_door == "")return `<span>/</span>`;
    if(!car_door)return "";
    if(typeof car_door === "string")return `<span class="door">${car_door}</span>`;
    return car_door.map(g=>`
    <span class="car-door-info">
        <span class="car">${g.split("-")[0]}</span>車
        <span class="door">${g.split("-")[1]}</span>門
    </span>`).join("<br>");
}

function return_direction(info){
    return info.map(g=>
    ` <div style="color:#000;display: flex; flex-direction: row;align-items: center;justify-content: center;">
        <div style="display: ${g[1]?"inline-block":"none"}; padding-right: 10px">${g[1]?"<small>往: </small>"+_MTR_DATA.station[g[1]].tc:""}</div>
        <div style="display: inline-block;">${return_cardoor(g[0])}</div>
    </div>`
    ).join("");
}

function handle_stnname(sta, line){
    if(line=="TCL" && sta=="CEN")return "HOK";
    if(line=="ISL" && sta=="HOK")return "CEN";
    if(line=="TWL" && sta=="HOK")return "CEN";
    if(line=="TWL" && sta=="ETS")return "TST";
    if(line=="TML" && sta=="TST")return "ETS";

    return sta;
}

function FirstRun(){
    try{
        document.getElementById('stn-info').innerHTML = `<span>${_MTR_DATA.route[INPUT.line].tc}</span><span>  ${_MTR_DATA.station[INPUT.sta].tc}站</span>`;
        document.getElementById('stn-info').classList.add(INPUT.line);
    
        _direction.forEach(w=>{
            document.getElementById(((w=="UP")?"left":"right")+"-interchange").innerHTML = 
                getInterchange(INPUT.line, INPUT.sta, w).map((item,i)=>{
                    try{
                        return _MTR_DATA.exp_from[item][INPUT.line+"+"+ _MTR_DATA.route_stn[INPUT.line][(w=="DOWN")?0:_MTR_DATA.route_stn[INPUT.line].length-1]].map((item2,i2)=>
        `<div class="interchange-line-info">
            <div class="line-badge ${item2[0]}">
            <a href="index2.html?line=${item2[0]}&sta=${handle_stnname(item, item2[0])}">
            <span class="interchange-line-name">${_MTR_DATA.station[item].tc}</span></a>
            <small>${_MTR_DATA.route[item2[0]].tc}</small></div>
            <div style="width:100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                ${return_direction(item2[1])}
            </div>
        
        </div>`
                        ).join('')
                    }catch(error){return "";}}
            ).join('');
        })
    
    _runAlready=true;
    }catch(error){console.log(error)}
}

function getInterchange(line, stn, bound){
    var index = _MTR_DATA.route_stn[line].findIndex(w=>w==stn);
    var data = (bound=="UP") ?
        _MTR_DATA.route_stn[line].slice(0,index)
        :
        _MTR_DATA.route_stn[line].slice(index+1);
    data = data.filter(w=>Object.keys(_MTR_DATA.exp_from).includes(w));
    if(bound=="UP")data.reverse();
        //console.log(data, data.filter(w=>Object.keys(_MTR_DATA.exp_from).includes(w)), index);
    return data;
}

