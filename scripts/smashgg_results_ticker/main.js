if (location.protocol == "https:")
{
    host = "wss://ws.streameta.com:443";
}
else
{
    host = "ws://ns.streameta.com:9000";
}
var getter;
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
            $('body').html("Fetching..")
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
        getStreametaApi(function(data){
            var data = JSON.parse(data);
            var bracketLink = data["tournament"]["brackets"];
            getter = new SmashGGGetter(bracketLink);
            getter.getEventSets(bracketNames).then(sets =>
            {
                sets = sets.filter(set => set.displayScore != "DQ" && set.displayScore != null)
                if (sets.length > 0)
                {
                    var newHTML = "Latest results&nbsp;&nbsp;"
                    sets = sets.slice(0,20)
                    
                    
                    sets.forEach(set => {
                        addition = ""
                        if (set["phaseGroup.phase.name"] == "Top 16 (Bo5)"){
                            addition = "Top 16 "
                        }
                        newHTML += `<span class="fnsorange">|</span>&nbsp;&nbsp;<span class="fnsblue">${addition}${set.fullRoundText}</span>&nbsp&nbsp;${formatSetData(set.displayScore)}&nbsp;&nbsp;`
                    });
                    $('.marquee').html(newHTML);
                    var mq = $('.marquee')
                    mq.removeClass('hidden')
                    setTimeout(function(){mq.removeClass('visuallyhidden'); mq.marquee({
                        //duration in milliseconds of the marquee
                        speed: 120,
                        //gap in pixels between the tickers
                        gap: 50,
                        //time in milliseconds before the marquee will start animating
                        delayBeforeStart: 500,
                        //'left' or 'right'
                        direction: 'left',
                        //true or false - should the marquee be duplicated to show an effect of continues flow
                        duplicated: false
                    })},50)
                }
            });
        })
    } catch (error) {
        console.log(error);
    }
})