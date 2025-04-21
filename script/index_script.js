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
setInterval(main, 30000);
//update new ETA

function buildETA(etaData){
    // Clear element with id 'left-departures'
    document.getElementById('left-departures').innerHTML = '';
    document.getElementById('right-departures').innerHTML = '';

    // Get ETA data and append each item to 'left-departures'
    _direction.forEach(w=>etaData[w].forEach((item,i) => {
        try{
        var div = document.createElement('div');
        div.className = 'departure-item';
        div.innerHTML = `<div><span class="route">${_MTR_DATA.station[item.dest].tc}</span><span class="platform" style="background-color:${_MTR_DATA.route[INPUT.line].color};">${item.plat}</span></div><div><span class="delta_${_T>0?"red":"green"}">${_T.timeparse2(item.delta)}</span><span class="time" id="time_${w}_${i}">${_T.timeparse(item.time, 0)}</span></div>`;
        document.getElementById(`${(w=="UP"?"left":"right")}-departures`).appendChild(div);
        }catch(e){console.log(e)}
    }));
}

setInterval(function() {
   if(_updateETA<0)return;
    
   //loop through UP ETA, update time with id "time_UP_{item.seq}"
   _direction.forEach(w=>{
       document.querySelectorAll(`[id^='time_${w}_']`).forEach(el=>{
           el.innerText = _T.timeparse(_T.getETA(_updateETA)[w][el.id.split('_')[2]].time, 0);
       });
   });

   try{
    document.getElementById('stn-info').innerHTML = `<span>${_MTR_DATA.route[INPUT.line].tc}</span><span>  ${_MTR_DATA.station[INPUT.sta].tc}站</span>`;
    document.getElementById('stn-info').style = `background-color:${_MTR_DATA.route[INPUT.line].color};`;
    }catch(error){}
}, 1000);
