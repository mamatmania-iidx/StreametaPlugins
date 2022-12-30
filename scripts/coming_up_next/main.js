if (location.protocol == "https:")
{
    host = "wss://ws.streameta.com:443";
}
else
{
    host = "ws://ns.streameta.com:9000";
}
var getter;
var params = new URLSearchParams(window.location.search);
var random;

function checkTriggerPress(callback){
    return $.ajax({
        url: `https://indopr0.com/streameta_trigger/check${window.location.search}`,
        type: "GET",
        crossDomain: true,
        success: callback
        });
}

function changeIfNew(){
    checkTriggerPress(function(data){
        if (data['random'] != random){
            console.log("trigger")
            //Trigger scene here
            random = data['random']
            getter.getStreamQueueSets("tournameta").then(sets =>
                {
                    $("#player1").text(sets[0]["slots"][0]["entrant"]["name"])
                    $("#player2").text(sets[0]["slots"][1]["entrant"]["name"])
                    $(".marquee").removeClass("hidden")
                    setTimeout(function(){$(".marquee").removeClass("visuallyhidden")}, 50)
                    setTimeout(function(){$(".marquee").addClass("visuallyhidden")}, 15000)
                    setTimeout(function(){$(".marquee").addClass("hidden")}, 16000)
                });
        }
    })
}

$('document').ready(function(){
    try {
        console.log(smashGGKey);
        console.log(streametaToken);
        initWebsocket();
        getStreametaApi(function(data){
            var data = JSON.parse(data);
            var bracketLink = data["tournament"]["brackets"];
            getter = new SmashGGGetter(bracketLink);
            checkTriggerPress(function(data){
                random = data['random']
            })
        });
        setInterval(changeIfNew, 6000)
    } catch (error) {
        console.log(error);
    }
})