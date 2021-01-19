let map;
let geocoder;
let num = 0;
let markers = new Array(2);
let directions;
let display;
let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const cyclesType = [4.167, 3.472, 8.333];
const cyclesText = ["シティサイクル(ママチャリ)", "小径車", "ロードバイク"];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 35.2, lng: 137.96},
    zoom: 8
  });
  geocoder = new google.maps.Geocoder();
  directions = new google.maps.DirectionsService();
  display = new google.maps.DirectionsRenderer({
    map: map
  });
  display.setPanel(document.getElementById("route"));
  initTime();
}

function initTime() {
  let formValue = document.search;
  let now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth();
  let d = now.getDate();
  let h = now.getHours();
  let minute = now.getMinutes();
  
  let k=0;
  for(let i=m+1; i<=12+m; i++) {
    if(m !== 0 && i%13 === 0) k = 1; // もし 現在1月でなく、1月の要素を追加するとき 1年進める
    
    let e = document.createElement("option");
    e.value = String(i%13+k);
    e.text = String(y+k) + "年" + String(i%13+k) + "月";
    formValue.ym.appendChild(e);
  }
  for(let i=1; i<=days[m]; i++) {
    let e = document.createElement("option");
    e.value = String(i);
    e.text = String(i) + "日";
    formValue.day.appendChild(e);
    if(i === d) formValue.day.options[i-1].selected = true;
  }
  
  // 閏年
  if(y%4 === 0 && (y % 100 !== 0 || y % 400 === 0)){
    let e = document.createElement("option");
    e.value = String(29);
    e.text = String(29) + "日";
    formValue.day.appendChild(e);
    if(d === 29) formValue.day.options[28].selected = true;
  }
  
  for(let i=0; i<=23; i++){
    let e = document.createElement("option");
    e.value = String(i);
    e.text = String(i) + "時";
    formValue.hour.appendChild(e);
    if(i === h) formValue.hour.options[i].selected = true;
  }
  for(let i=0; i<=59; i++){
    let e = document.createElement("option");
    e.value = String(i);
    e.text = String(i) + "分";
    formValue.minute.appendChild(e);
    if(i === minute) formValue.minute.options[i].selected = true;
  }
}

function changeMonth(event) {
  let m = parseInt(event.target.value);
  let formValue = document.search;
  
  removeChild(formValue.day);
  
  for(let i=1; i<=days[m-1]; i++) {
    let e = document.createElement("option");
    e.value = String(i);
    e.text = String(i) + "日";
    formValue.day.appendChild(e);
  }
  
  // 閏年
  if(m === 2 && (y%4 === 0 && (y % 100 !== 0 || y % 400 === 0))){
    let e = document.createElement("option");
    e.value = String(29);
    e.text = String(29) + "日";
    formValue.day.appendChild(e);
    if(d === 29) formValue.day.options[28].selected = true;
  }
}

function removeChild(element) {
  if(element.hasChildNodes()){
    while(element.childNodes.length > 0) {
      element.removeChild(element.firstChild);
    }
  }
}

function setMap() {
  let formValue = document.search;
  
  if( !(formValue[0].value && formValue[1].value) ) {
    alert("現在地もしくは目的地が入力されていません");
    return;
  }
  geocoder.geocode({address: formValue[0].value}, zahyo);
  setTimeout(function(){geocoder.geocode({address: formValue[1].value}, zahyo)}, 500);
}

function zahyo(result, status) {
  if(result && status === 'OK') {
    setMarker(result[0].geometry.location);
  } else {
    alert("現在地もしくは目的地が存在しません");
  }
}

function setMarker(latlng) {
  markers[num] = new google.maps.Marker({
    position: latlng
  });
  
  if(num == 1) {
    latAvg = (markers[0].position.lat() + markers[1].position.lat())/2;
    lngAvg = (markers[0].position.lng() + markers[1].position.lng())/2;
    map.setCenter({lat: latAvg, lng: lngAvg});
    map.setZoom(8);
    
    setRoute();
  }
  
  num = (num+1) % 2;
}

function setRoute() {
  let typeNum = parseInt(document.search.type.value);
  
  directions.route({
    origin: markers[0].position,
    destination: markers[1].position,
    travelMode: google.maps.DirectionsTravelMode.WALKING
  }, function(result, status) {
    if(result && status === 'OK') {
      
      let m = parseInt(result.routes[0].legs[0].distance.value);
      let s = parseInt(result.routes[0].legs[0].duration.value);
      
      s = (m / cyclesType[typeNum - 1]);
      result.routes[0].legs[0].duration.value = s;
      
      let hour = Math.floor(s/3600);
      let minute = Math.round((s%3600)/60);
      m = String(Math.round(m / 100) / 10);
      result.routes[0].legs[0].distance.text = String(m) + "km";
      result.routes[0].legs[0].duration.text = String(hour) + "時間" + String(minute) + "分";
      display.setDirections(result);
      
      showResult(m, hour, minute);
    } else {
      alert("ルートが見つかりません");
    }
  })
}

function showResult(merters, h, m) {
  let seNum = parseInt(document.search.se.value);
  let yearMonth = document.search.ym[document.search.ym.selectedIndex].innerHTML;
  let month = document.search.ym.value;
  let day = document.search.day.value;
  let hour = document.search.hour.value;
  let minute = document.search.minute.value;
  
  let results = document.getElementById("results");
  let text = "<p>現在地 : " + document.search[0].value + "</p>" +
             "<p>目的地 : " + document.search[1].value + "</p>" +
             "<p>種類 : " + cyclesText[parseInt(document.search.type.value)-1] + "</p>" +
             "<p>距離 : " + String(merters) + "km</p>" +
             "<p>移動時間 : 約" + String(h) + "時間" + String(m) + "分</p>";
             
  if(seNum === 0) {
    text += "<p>出発時刻 : " + yearMonth + String(day)+"日" + String(hour)+"時" + String(minute)+"分" + "</p>";
    let [YM, D, H, M] = calcTime(parseInt(yearMonth.slice(0,4)), parseInt(month), parseInt(day), parseInt(hour), parseInt(minute), h, m, 0);
    text += "<p>到着時刻 : " + YM + String(D)+"日" + String(H)+"時" + String(M)+"分" + "</p>";
  } else if(seNum === 1) {
    let t = "<p>到着時刻 : " + yearMonth + String(day)+"日" + String(hour)+"時" + String(minute)+"分" + "</p>";
    let {YM, D, H, M} = calcTime(parseInt(yearMonth.slice(0,4)), parseInt(month), parseInt(day), parseInt(hour), parseInt(minute), h, m, 1);
    text += "<p>出発時刻 : " + YM + String(D)+"日" + String(H)+"時" + String(M)+"分" + "</p>" + t;
  }
  
  results.innerHTML = text;
}

function calcTime(y, month, day, hour, minute, h, m, se) {
  if(se === 0) {
    minute = minute + m;
    hour = hour + h + Math.floor(minute/60);
    minute = minute % 60;
    day = day + Math.floor(hour/24);
    hour = hour % 24;
    let d = day%days[month-1];
    month = month + Math.floor(day/days[month-1]);
    day = d;
    let mm = month%12;
    y = y + Math.floor(month/12);
    month = mm;
  } else if(se === 1) {
    minute = minute - m;
    if(minute < 0) {
      minute += 60;
      hour -= 1;
    }
    hour = hour - h;
    if(hour < 0) {
      hour += 24;
      day -= 1;
    }
    if(day <= 0) {
      month -= 1;
      if(month <= 0) {
        month = 12;
        y -= 1;
      }
      day = days[month-1];
    }
  }
  return [String(y)+"年"+String(month)+"月", day, hour, minute];
}