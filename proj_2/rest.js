var request;
var objJSON;

var indexedDB = window.indexedDB 
    || window.mozIndexedDB
    || window.webkitIndexedDB
    || window.msIndexedDB
    || window.shimIndexedDB;

function getRequestObject() {
    if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else {
        return null;
    }
}

window.onload = function() {
    if (sessionStorage.log && sessionStorage.log == "true") {
        updateView(true);
    } else {
        updateView(false);
    }
}

function updateView(isLogged) {
   
   if (isLogged) {

        document.getElementById("logoutButton").style.display = "inline";
        document.getElementById("registerButton").style.display = "none";
        document.getElementById("insertButton").style.display = "inline";
        document.getElementById("listButton").style.display = "inline";
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("synchronizeButton").style.display = "inline";
        document.getElementById("analizeButton").style.display = "inline";
        document.getElementById("loginButton").style.display = "none";

   } else {

        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("registerButton").style.display = "inline";
        document.getElementById("insertButton").style.display = "none";
        document.getElementById("listButton").style.display = "none";
        document.getElementById("synchronizeButton").style.display = "none";
        document.getElementById("analizeButton").style.display = "none";
        document.getElementById("loginButton").style.display = "inline";
   }

}
 
/* ---------- REJESTROWANIE NOWEGO UŻYTKOWNIKA ---------- */

function registerView() {
    var registerForm = `
        <form name='registerForm'>
            Email <input type='text' name='email'></input></br>
            Hasło <input type='password' name='password'></input></br>
            <input type='button' value='Rejestracja' onclick='register(this.form)'></input>
        </form>
        `;
    document.getElementById("data").innerHTML = registerForm;
    document.getElementById("result").innerHTML = ''; 
}

function register(form) {

    if (validateRegister(form)) {

        var user = {};
        user.email = form.email.value;
        user.password = md5(form.password.value);
        jsonData = JSON.stringify(user);

        document.getElementById("result").innerHTML = ""; 
        document.getElementById("data").innerHTML = "";  
        request = getRequestObject() ;
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200 ) {
            $array = JSON.parse(request.response);
                alert($array["return"]);
            }
        }
        request.open("POST", "rest/register", true);
        request.send(txt);
   }
}

function validateRegister(form) {
    if (form.email.value == "" || form.password.value == "") {
        alert("Pole nie może być puste!");
        return false;
    }
    return true;
}

/* ---------- LOGOWANIE DO SERWISU ---------- */

function loginView() {
    var loginForm = `
        <form name='log'>
            Email <input type='text' name='email'></input></br>
            Hasło <input type='password' name='password'></input></br>
            <input type='button' value='Zaloguj' onclick='login(this.form)'></input>
        </form>`;
    document.getElementById("data").innerHTML = loginForm;
    document.getElementById("result").innerHTML = "";
}

function login(form) {

    var user = {};
    user.email = form.email.value;
    user.password = md5(form.password.value);
    txt = JSON.stringify(user);

    document.getElementById("result").innerHTML = ''; 
    document.getElementById("data").innerHTML = '';  
    request = getRequestObject();

    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200 ) {
            $array = JSON.parse(request.response);
            alert($array["return"]);
            if ($array["return"] == "Zalogowano pomyślnie.") {
                if (typeof(Storage) != "undefined") {
                    sessionStorage.log = true;
                    updateView(true);
                } else {
                    alert("Browser does not support web storage :(");
                }
            }
        }
    }

    request.open("POST", "rest/login", true);
    request.send(txt);
}

/* ---------- WYLOGOWANIE ---------- */

function logout() {
    document.getElementById('result').innerHTML = ''; 
    document.getElementById('data').innerHTML = '';  
    request = getRequestObject() ;
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200 )    {
            $array = JSON.parse(request.response);
            alert($array["return"]);
            sessionStorage.log = false;
            updateView(false);
        }
    }
    request.open("POST", "rest/logout", true);
    request.send(null);
}

/* ---------- WPROWADZANIE DANYCH LOKALNIE ---------- */

function insertForm() {
    var form = `
        <form name="insertRecForm">
            Miejsce 
            <select name="city" size="1">
                <option value="0">Wybierz ...</option>
                <option value="Kraków">Kraków</option>
                <option value="Katowice">Katowice</option>
                <option value="Warszawa">Warszawa</option>
                <option value="Wrocław">Wrocław</option>
                <option value="Gdańsk">Gdańsk</option>
                <option value="Wadowice">Wadowice</option>
            </select></br>
            Data 
            <input type="date" name="date"></input></br>
            Temperatura
            <input type="number" name="temperature" min="-50" max="50"></input></br>
            Pogoda 
            <select name="weather" size="1">
                <option value="Słonecznie">Słonecznie</option>
                <option value="Zachmurzenie">Zachmurzenie</option>
                <option value="Deszcz">Deszcz</option>
                <option value="Śnieg">Śnieg</option>
            </select></br>
            <input type="button" value="Wyślij" onclick="insert(this.form)"></input>
        </form>`;
    document.getElementById('data').innerHTML = form;
    document.getElementById('result').innerHTML = ''; 
}

function insert(form) {

    if(validate(form)) {
        var data = {};
        data.id = form.city.value + form.date.value;
        data.city = form.city.value;
        data.date = form.date.value;
        data.temperature = form.temperature.value;
        data.weather = form.weather.value;

        var dbOpen = indexedDB.open("localDB", 2);
        dbOpen.onupgradeneeded = function() {
            var db = dbOpen.result;
            if (!db.objectStoreNames.contains("weather")) { 
                db.createObjectStore("weather", {keyPath: "id"}); 
            }
        };
        
        dbOpen.onsuccess = function() {
            var db = dbOpen.result;
            var transaction = db.transaction("weather", "readwrite");
            var store= transaction.objectStore("weather");
            store.put({id: data.id, city: data.city, date: data.date, temperature: data.temperature, weather: data.weather}); 
            transaction.oncomplete = function() {
                db.close();
                alert("Dane zostały dodane do lokalnej bazy.");
            };
        }
    }
}

function validate(form) {
    if (form.city.value == "0" || form.date.value == "" || form.temperature.value == "") {
        alert("Wszystkie pola muszą być wypełnione!");
        return false;
    }
    return true;
}

/* ---------- SYNCHRONIZACJA DANYCH Z SERWEREM ---------- */

function synchronize() {
    
    var dbOpen = indexedDB.open("localDB", 2);
    dbOpen.onupgradeneeded = function() {
        var db = openRequest.result;
        if (!db.objectStoreNames.contains('weather')) { 
            db.createObjectStore('weather', {keyPath: 'id'}); 
        }
    };
    
    var data = {};
    var jsonData;
    dbOpen.onsuccess = function() {
        var db = dbOpen.result;
        var transaction = db.transaction("weather", "readwrite");
        var store = transaction.objectStore("weather");
        var g = store.getAll();

        g.onsuccess = function() {
            var res = g.result;
            for(const item of res) {

                data.id = item["id"];
                data.city = item["city"];
                data.date = item["date"];
                data.temperature = item["temperature"];
                data.weather = item["weather"];
                jsonData = JSON.stringify(data);                
                request = getRequestObject();
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200) {}
                }
                request.open("POST", "rest/insert", true);
                request.send(jsonData);
            }
        };

        store.clear();
        transaction.oncomplete = function() {
            db.close();
        };
    }

    alert("Dane zostały przeniesione na serwer.");
    location.reload();
}

function sendOne(jsonData) {
    
}

/* ---------- WYŚWIETLANIE DANYCH ---------- */ 

function list() {
    document.getElementById("data").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    listLocal();
    listOnline();
}

function listLocal() {

    var dbOpen = indexedDB.open("localDB", 2);
    dbOpen.onupgradeneeded = function() {
        var db = openRequest.result;
        if (!db.objectStoreNames.contains("weather")) { 
            db.createObjectStore("weather", {keyPath: "id"}); 
        }
    };
    var html = "<h2>Dane lokalne</h2>";
    html += "<table><tr><th>Miejsce</th><th>Data</th><th>Temperatura</th><th>Pogoda</th></tr>";

    dbOpen.onsuccess = function() {
        var db = dbOpen.result;
        var transaction = db.transaction("weather", "readwrite");
        var g = transaction.objectStore("weather").getAll();
   
        g.onsuccess = function() {
            var res = g.result;
            for (const item of res) {
                html += "<tr>";
                for (const field in item) {
                    if(field !== "id")
                        html += "<td>" + item[field] + "</td>";
                }
                html += "</tr>";
            }
            html += "</table>";
        };

        transaction.oncomplete = function() {
            document.getElementById("data").innerHTML = html;
            db.close();    
        };
    }
    document.getElementById("data").innerHTML = html;
}

function listOnline() {
    var html = "<h2>Dane w bazie online</h2>";
    html += "<table><tr><th>Miejsce</th><th>Data</th><th>Temperatura</th><th>Pogoda</th></tr>";
    request = getRequestObject();
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            jsonData = JSON.parse(request.response);
            for (var id in jsonData)  {
                html += "<tr>";
                for (var field in jsonData[id]) {
                    if (field !== "_id" && field !== "id") { html += "<td>" + jsonData[id][field] + "</td>"; }
                }
                html +="</tr>";
            }
            html += "</table>";
            document.getElementById("result").innerHTML = html;
        }
    }
    request.open("GET", "rest/list", true); 
    request.send(null);
    document.getElementById("result").innerHTML = html;
}

/* ---------- ANALIZA DANYCH ---------- */ 

function analize() {

    var form = `
        Miasto: 
        <select name="chartCity" size="1" onchange="createChart(this.value)">
            <option value="0">Wybierz ...</option>
            <option value="Kraków">Kraków</option>
            <option value="Katowice">Katowice</option>
            <option value="Warszawa">Warszawa</option>
            <option value="Wrocław">Wrocław</option>
            <option value="Gdańsk">Gdańsk</option>
            <option value="Wadowice">Wadowice</option>
        </select></br>
        `;
   document.getElementById("data").innerHTML = form;
   document.getElementById("result").innerHTML = "";
}

function createChart(city) {

    document.getElementById("result").innerHTML = "";
    if (city == 0) {
        return;
    }

    document.getElementById("result").innerHTML = `
        <canvas id='canvas' width='1000' height='400'>
            Canvas not supported
        </canvas>`;
    var ctx = document.getElementById("canvas").getContext("2d");
   
    // x
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(45, 200);
    ctx.lineTo(880, 200);
    ctx.stroke();

    for (var i = 0; i < 7; i++) {

        ctx.beginPath();
        ctx.moveTo(80 + i * 130, 203);
        ctx.lineTo(80 + i * 130, 197);
        ctx.stroke();
       
        var date = new Date();
        date.setDate(date.getDate() + i);
        var marker = String(date.toLocaleDateString("pl-PL")).slice(0, -5);
        if (String(date.getDate()).length == 1) {
            marker = "0" + marker;
        }
        ctx.fillStyle = "white";
        ctx.fillText(marker, 66 + i * 130, 215);
    }

    // y
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, 380);
    ctx.stroke();

    var yTicks = [" 50°C", " 25°C", "  0°C", "-25°C", "-50°C"];
    for(var i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(47, 20 + i * 90);
        ctx.lineTo(53, 20 + i * 90);
        ctx.stroke();
        ctx.fillText(yTicks[i], 15, 25 + i * 90);
    }

    // legend
    var legendLabels = ["Słonecznie", "Zachmurzenie", "Śnieg", "Deszcz"];
    var colors = ["yellow", "gray", "white", "blue"];
    

    for(var i = 0; i < 4; i++) {
        ctx.fillStyle = "white";
        ctx.fillText(legendLabels[i], 920, 3 + 25 * (i + 1));
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.arc(900, 25 * (i + 1), 8, 0, 2 * Math.PI); 
        ctx.fill();
    }

    request = getRequestObject() ;
    request.onreadystatechange = function() {
        if (request.readyState == 4)    {
            jsonData = JSON.parse(request.response);
            for (var id in jsonData)  {
                for (var field in jsonData[id]) {          
                    if (field === "city" && jsonData[id][field] === city) {
                        var diff = Math.round(((new Date(jsonData[id]["date"])).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                        if (diff >= 0 && diff <= 7) {
                            var temperature = parseInt(jsonData[id]["temperature"]);
                            ctx.beginPath();
                            switch(jsonData[id]["weather"]) {
                                case "Słonecznie":
                                    ctx.fillStyle = colors[0];
                                    break;
                                case "Zachmurzenie":
                                    ctx.fillStyle = colors[1];
                                    break;
                                case "Śnieg":
                                    ctx.fillStyle = colors[2];
                                    break;
                                case "Deszcz":
                                    ctx.fillStyle = colors[3];
                                    break; 
                            }
                            var i = (-1 / 25) * temperature + 2;
                            ctx.arc(80 + diff * 130, 20 + i * 90, 8, 0, 2 * Math.PI); 
                            ctx.fill();
                        }   
                    }
                }
            }
        
        }
    }
    request.open("GET", "rest/list", true);
    request.send(null);
}
