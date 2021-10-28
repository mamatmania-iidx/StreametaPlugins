if (location.protocol == "https:")
{
    host = "wss://ws.streameta.com:443";
}
else
{
    host = "ws://ns.streameta.com:9000";
}
var getter;
var lastPlayer="";
var player;
var side = urlParams.get("side");
// Sets what to get based on side
var messagesToGet = ["teams-1"]
if (side == "p1"){
    messagesToGet = messagesToGet.concat("teams-0-players-0-person-name");
}
else {
    messagesToGet = messagesToGet.concat("teams-1-players-0-person-name");
}

function checkMessage(data)
{
    if (messagesToGet.includes(data)){
        getStreametaApi(function(data){
            data = JSON.parse(data);
            if (side == "p1"){
                player = data["teams"][0]["players"][0]["person"]["name"]
            } else {
                player = data["teams"][1]["players"][0]["person"]["name"]
            };
        },"teams-0-players-0-person-name").then(function(){
            $('body').html("")
            getter.getParticipantSets(player).then(data =>
                {
                    var newHTML = "";
                    var max = Math.min(data.length, 6)
                    for (let i = 0; i < max; i++) {
                        newHTML = newHTML + formatSetData(data[i]['displayScore'], player) + "<br>"
                    }
                    $('body').html(newHTML);
                });
        })
    }
}

$('document').ready(function(){
    try {
        console.log(smashGGKey);
        console.log(streametaToken);
        $('body').html("");
        initWebsocket();
        getStreametaApi(function(data){
            var data = JSON.parse(data);
            if (side == "p1"){
                player = data["teams"][0]["players"][0]["person"]["name"]
            } else {
                player = data["teams"][1]["players"][0]["person"]["name"]
            }
            var bracketLink = data["tournament"]["brackets"];
            getter = new SmashGGGetter(bracketLink);
            getter.init_participants().then(() => 
            {
                console.log(player);
                getter.getParticipantSets(player).then(data =>
                    {
                        console.log(data)
                        var newHTML = "";
                        var max = Math.min(data.length, 6)
                        for (let i = 0; i < max; i++) {
                            newHTML = newHTML + formatSetData(data[i]['displayScore'], player) + "<br>"
                            
                        }
                        $('body').html(newHTML);
                    });
            })
            
        });
    } catch (error) {
        console.log(error);
    }
    
})