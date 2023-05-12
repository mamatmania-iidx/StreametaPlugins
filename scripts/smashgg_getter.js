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
        this.event = temp[3];
        this.init_done = false;
        this.tournament = temp[1];
        this.recentData = false;
    }

    init_participants()
    {
        var self = this;
        var variables = {"eventSlug": this.slug};
        return new Promise((resolve, reject) =>
        {
            this.runQuery(GET_PARTICIPANTS_ID,function(data)
            {
                console.log("done")
            }, variables, false, false).then(data =>
            {
                var temp = data;
                var totalPages = temp["data"]["event"]["entrants"]["pageInfo"]["totalPages"];
                self.processParticipantData(data);
                
                var promises = []
                if (totalPages > 1)
                {
                    for (var i = 2; i <= totalPages; i++)
                    {
                        promises.push(self.runQuery(GET_PARTICIPANTS_ID, function(data){self.processParticipantData(data)}, variables, i))
                    }
                    
                }
                Promise.all(promises).then(() => 
                    {
                        console.log("promise done");
                        self.init_done = true;
                        resolve()
                    })
            })
        })
    }
    
    getParticipantSets(participant)
    {
        if (!this.init_done){
            throw "Participants not initialized"
        }
        var self = this;
        var keys = $.map(this.participants, function(v, i){
            return i;
          });
        
        var target = difflib.getCloseMatches(participant,keys, cutoff=0.8)[0]
        var variables = {"eventSlug": this.slug, "playerId": this.participants[target]}
        this.done = false;
        return new Promise((resolve, reject) => {
            this.runQuery(GET_PARTICIPANT_SETS,function(data){console.log("done")},
            variables={"eventSlug": this.slug, "playerId": this.participants[target]}).then(data =>
            {if (data["error"]){
                console.log(data["error"])
                throw Error(data["error"])
            }
            else
            {
                var data = data["data"]["event"]["sets"]["nodes"];
                data.sort(function compareFn(a, b) { return a["completedAt"]-b["completedAt"] });
                for (let i = 0; i < data.length; i++) {
                    data[i] = flattenJSON(data[i]);
                }
            }
            resolve(data)}
            )
          });
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

    async runPagedQuery(query, page_func, callback, variables= new Object())
    {
        var first_result = await this.runQuery(query, callback, variables, 1);
        var totalPages = page_func(first_result)["totalPages"];
        
        var promises = [first_result]
        if (totalPages > 1){
            for (var i = 2; i <= totalPages; i++)
            {
                promises.push(this.runQuery(query, function(){}, variables, i))
            };
        }
        var results = await Promise.all(promises);
        return results
    }

    async getEventSets(bracket_name_filter=[])
    {
        var data = await this.runPagedQuery(GET_EVENT_SETS,
            getEventSetsPageInfo, function(){},{'eventSlug':getter.slug});
        console.log(data)
        for (var i = 0; i < data.length; i++){
            console.log(i, data[i])
            data[i] = data[i]["data"]["event"]["sets"]["nodes"]
        }
        data = [].concat.apply([], data);
        data.sort(function compareFn(a, b) { return b["completedAt"]-a["completedAt"] });
        for (let i = 0; i < data.length; i++) {
            data[i] = flattenJSON(data[i]);
        }
        if (bracket_name_filter.length > 0){
            data = data.filter(set => bracket_name_filter.includes(set["phaseGroup.phase.name"]));
        }
        return data
    }

    async getStreamQueueSets(stream_name)
    {
        var self = this;
        var variables;
        var data;
        data = await this.runQuery(GET_STREAM_QUEUE_SETS,function(data){console.log("done")},
        variables={"tourneySlug": `tournament/${this.tournament}`})
        if (data["error"]){
            console.log(data["error"])
            throw Error(data["error"])
        }
        else
        {
            data = data["data"]["tournament"]["streamQueue"];
            var temp;
            for (let i = 0; i < data.length; i++) {
                if (data[i]['stream']['streamName'].toLowerCase()==stream_name.toLowerCase()){
                    temp = data[i]['sets']
                }
            }
            data = temp
            console.log(data)
        }
        return data
    }


}
