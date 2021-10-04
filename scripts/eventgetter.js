function flattenJSON(obj = {}, res = {}, extraKey = '') {
    for(key in obj){
       if(typeof obj[key] !== 'object'){
          res[extraKey + key] = obj[key];
       }else{
          flattenJSON(obj[key], res, `${extraKey}${key}.`);
       };
    };
    return res;
 };

class SmashGGGetter {
    constructor(event_url){
        var self = this;
        var smashggKey = smashGGKey;
        this.url = new URL(event_url);
        var temp = this.url.pathname.replace(/^\/|\/$/g, '').split('/');
        this.slug = temp.slice(0,4).join('/');
        this.headers = {"Authorization": `Bearer ${smashggKey}`};
        this.api_url = "https://api.smash.gg/gql/alpha";
        this.participants = {};
        this.event = "";
        this.tournament = "";
        this.recentData = false;
        this.done = false;

        var variables = {"eventSlug": this.slug};
        this.runQuery(GET_PARTICIPANTS_ID,function(data)
        {
            var temp = data;
            var totalPages = temp["data"]["event"]["entrants"]["pageInfo"]["totalPages"];
            self.processParticipantData(data);
            if (totalPages > 1)
            {
                for (var i = 2; i <= totalPages; i++)
                {
                    self.runQuery(GET_PARTICIPANTS_ID, function(data){self.processParticipantData(data)}, variables, i)
                }
            }
        }, variables, false, false).done(function(){console.log(self.participants)})
    }

    
    getParticipantSets(participant)
    {
        var self = this;
        var keys = $.map(this.participants, function(v, i){
            return i;
          });
        
        var target = difflib.getCloseMatches(participant,keys)[0]
        var variables = {"eventSlug": this.slug, "playerId": this.participants[target]}
        this.done = false;
        this.runQuery(GET_PARTICIPANT_SETS,function(data)
        {
            if (data["error"]){
                console.log(data["error"])
            }
            else
            {
                var data = data["data"]["event"]["sets"]["nodes"];
                data.sort(function compareFn(a, b) { return a["completedAt"]-b["completedAt"] });
                for (let i = 0; i < data.length; i++) {
                    data[i] = flattenJSON(data[i]);
                    self.recentData = data;
                
                }
                self.done = true;
            }
        }, variables={"eventSlug": this.slug, "playerId": this.participants[target]})
        }


    runQuery(query, callback, variables= new Object(), page=false, async=true)
    {
        if (page)
        {
            variables["page"]=page;
        };
        return $.ajax({
            url: this.api_url,
            headers: this.headers,
            contentType: "application/json",
            type: "POST",
            async: async,
            data: JSON.stringify({"query":query, "variables": variables}),
            success: callback
            });
    }

    processParticipantData(data){
        var participants = data["data"]["event"]["entrants"]["nodes"];
        for (var i = 0; i < participants.length; i++) {
            participants[i] = flattenJSON(participants[i])
            this.participants[participants[i]["participants.0.gamerTag"].toLowerCase()] = participants[i]["id"]
        }
    }
}
