
streameta_api_link = `https://streameta.com/api/?token=${streametaToken}`
var compare = null;
var res = null;
var interval = null;


function checkStreametaUpdate()
{
    ajax(streameta_api_link,function(response){
        var response = JSON.parse(response)
        getAusmash(response);
        changePortColors(response);
    })
}

function checkStreametaColorsOnly()
{
    ajax(streameta_api_link+"&subset=teams-0-color-color",
        function(response){
        changePortColors(JSON.parse(response))
    })
}

function checkMessage(msg)
{
    messages_to_get = ["teams-1","teams-0-players-0-person-name",
    "teams-1-players-0-person-name"];
    if (messages_to_get.includes(msg))
    {
        //TODO getAusmash
        checkStreametaUpdate();
    }
    if (["teams-0-color-color","teams-1-color-color"].includes(msg)){
        checkStreametaColorsOnly()
    }
}

function getAusmash(data)
{
    p1_name = data.teams[0].players[0].person.name;
    p1_state = data.teams[0].players[0].person.location.abbr;
    p2_name = data.teams[1].players[0].person.name;
    p2_state = data.teams[1].players[0].person.location.abbr;
    game = data.events[0].game.abbr;
    var promise = "true"
    if (compare == null)
    {
        compare = new Compare(game, p1_state, p1_name, p2_state, p2_name, 90)
    }
    else
    {
        if (compare.autoEqualSwappedSwap(game, p1_state, p1_name, p2_state, p2_name))
        {
            console.log(true)
        }
        else 
        {
            console.log("Creating new compare object")
            compare = new Compare(game, p1_state, p1_name, p2_state, p2_name, 90)
        }
    }
    if (!compare.initiated){
        promise = compare.init()
    }
    setFetching();
    promise.then(performUpdate)
}

function waitForCompareAndExecute(){
    // Have to wait for Compare object to finish.
    if (!compare.done)
    {
      setTimeout(waitForCompareAndExecute, 400);
    } else {
      console.log(compare.p1.name, compare.p1.wins, compare.p2.name, compare.p2.wins)
      performUpdate()
    }
}

function performUpdate(){
    //update Recent Results
    var tbody = document.getElementById("resultsBody");
    tbody.innerHTML = ""
    if (compare.matches.length == 0){
        var new_row = tbody.insertRow();
        new_row.insertCell();
        var new_cell = new_row.insertCell();
        new_cell.innerHTML = "No matches found."
    }
    for (let index = 0; index < (compare.matches.length>6? 6 : compare.matches.length);
            index++)
    {
        const element = compare.matches[index];
        var winner = (element.isWin(compare.p1.name) ? 'p1' : 'p2')
        var match = element.toArray(compare.p1.name);
        var new_row = tbody.insertRow();
        //1st cell = p1 score
        var new_cell = new_row.insertCell();
        new_cell.innerHTML = match[2];
        if (winner=='p1'){
            new_cell.classList.add('p1','winner');
        }
        //2nd cell = tournament
        var new_cell = new_row.insertCell();
        console.log(element.date);
        new_cell.innerHTML = timeSince(element.date);
        //1st cell = p1 score
        var new_cell = new_row.insertCell();
        new_cell.innerHTML = match[4];
        if (winner=='p2'){
            new_cell.classList.add('p2','winner');
    }}
    //update Head to Head
    document.getElementById('p1AllTime').innerHTML = compare.p1.wins;
    document.getElementById('p2AllTime').innerHTML = compare.p2.wins;
    document.getElementById('p1Recent').innerHTML = compare.p1.recent_wins;
    document.getElementById('p2Recent').innerHTML = compare.p2.recent_wins;
    finishFetching()
    
}

function setFetching()
{
    clearInterval(interval)
    var tbody = document.getElementsByTagName("table");
    Array.from(tbody).forEach(element => {
        element.classList.add('hidden');
        element.classList.add('visuallyhidden')
    });
    document.getElementById('fetching').classList.remove('hidden');
    clearInterval(interval)
}

function finishFetching()
{
    document.getElementById('fetching').classList.add('hidden');
    var tbody = document.getElementsByTagName("table");
    tbody[1].classList.remove('hidden')
    setTimeout(function(){tbody[1].classList.remove('visuallyhidden')},50)
    // Array.from(tbody).forEach(element => {
    //     element.classList.add('hidden')
    // });
    interval = setInterval(toggler, 7000)
}

function toggler(){
    if (document.getElementById('resultsTable').classList.contains('hidden'))
    {
        var active_table = document.getElementById('h2hTable')
        var inactive_table = document.getElementById('resultsTable')
    }
    else
    {
        var inactive_table = document.getElementById('h2hTable')
        var active_table = document.getElementById('resultsTable')
    }
    active_table.classList.toggle('visuallyhidden');
    active_table.addEventListener('transitionend', function(e) {
        active_table.classList.add('hidden');
        inactive_table.classList.remove('hidden');
        setTimeout(function(){inactive_table.classList.remove('visuallyhidden')},50)
        }, {
            capture: false,
            once: true,
            passive: false
        });
}

function changePortColors(response)
{
    var p1_color = new tinycolor(response.teams[0].color.color);
    var p2_color = new tinycolor(response.teams[1].color.color);
    var style = document.getElementById('variables');
    var sheet = style.sheet
    if (sheet.rules.length > 0){sheet.deleteRule(0)};

    //add port colors
    sheet.insertRule(`:root {--p1-color:${p1_color.darken(10).toRgbString()};--p2-color:${p2_color.darken(10).toRgbString()}}`)
    
}


document.addEventListener("DOMContentLoaded", function()
{
	initWebsocket();
    checkStreametaUpdate();
});
