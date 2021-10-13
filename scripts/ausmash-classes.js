var game_id = {"SSBU":13, "SSBWU":12}
var promise2 = [];
class Compare {
    constructor(game, p1_state, p1_name, p2_state, p2_name, extend_back = null)
    {
        var self = this;
        this.p1_id = null;
        this.p2_id = null;
        this.ausmash_key = ausmashKey;
        this.game = game;
        this.matches = [];
        this.initiated = false;
        this.extend_back = extend_back;
        this.p1 = {"name":p1_name, "state":p1_state}
        this.p2 = {"name":p2_name, "state":p2_state}
    }

    init()
    {
        //grab ausmash ID for both players
        var self = this;
        var promises = [];
        return new Promise((resolve, reject) =>
        {
            promises.push(this.getPlayerID(p1_name, p1_state, function(data)
            {
                if (p1_name.includes('/'))
                {
                    self.p1_id = JSON.parse(data)[0].ID
                }
                else
                {
                    self.p1_id = JSON.parse(data).ID
                }
            }));
            promises.push(self.getPlayerID(p2_name, p2_state,  function(data)
            {
                if (p2_name.includes('/'))
                {
                    self.p2_id = JSON.parse(data)[0].ID
                }
                else
                {
                    self.p2_id = JSON.parse(data).ID
                }
            }));
            //Fetch all-time matchup data
            Promise.all(promises).then(() =>
            {
                self.ausmash_link = `https://api.ausmash.com.au/compare/${game_id[game]}/${self.p1_id}/${self.p2_id}`
                
                promise2.push(self.fetchCompareData("stats", function(data)
                {
                    data = JSON.parse(data);
                    self.p1 = {"name":p1_name, "state":p1_state, "wins":data["Player1WinCount"], "recent_wins":0};
                    self.p2 = {"name":p2_name, "state":p2_state, "wins":data["Player2WinCount"], "recent_wins":0};
                }));
                
                //TODO Fetch back 90 days if extend_back not null
                self.target_date = new Date();
                self.target_date.setDate(self.target_date.getDate()-self.extend_back);
                var today = new Date();
                var link_string = 'matches';
                // if (extend_back) {
                //     link_string += `?startDate=${getDateStringFromDate(this.target_date)}&endDate=${getDateStringFromDate(today)}`
                // } 
                promise2.push(self.fetchCompareData(link_string, function(data)
                {
                    data = JSON.parse(data);
                    data.Matches.forEach(element => {
                        self.matches.push(new AusmashMatch(element));
                    });
                    self.countRecentWins();
                }));
                console.log("Made promises")
                Promise.all(promise2).then(() => {console.log("Done"); self.initiated = true; resolve()})
            })
        })
    }
        
            

    async getPlayerID(player, state, callback)
    {
        if (player.includes('/'))
        //Special case for players with / in their name
        //Looking at you scott/max
        {
            var search_link = `https://api.ausmash.com.au/players/search?q=${encodeURIComponent(player)}`
           
        }
        else
        {
            var search_link = `https://api.ausmash.com.au/players/find/${encodeURIComponent(player)}/${encodeURIComponent(state)}/`
        }
        return ajax(search_link,callback,null,"X-ApiKey",this.ausmash_key)
    }

    fetchCompareData(subset, callback)
    {
        return ajax(this.ausmash_link+"/"+subset,callback,null,"X-ApiKey",this.ausmash_key)
    }

    isSwapped(game, p1_state, p1_name, p2_state, p2_name)
    {
        if (equalLower(game, this.game) && equalLower(p1_state, this.p2.state)
        && equalLower(p1_name, this.p2.name) && (p2_state, this.p1.state)
        && equalLower(p2_name, this.p1.name))
        {
            return true
        }
        else {return false}
    }

    isEqual(game, p1_state, p1_name, p2_state, p2_name)
    {
        if (equalLower(game, this.game) && equalLower(p1_state, this.p1.state)
            && equalLower(p1_name, this.p1.name)&& (p2_state, this.p2.state)
            && equalLower(p2_name, this.p2.name))
        {
            return true
        }
        else {return false}
    }

    isEqualOrSwapped(game, p1_state, p1_name, p2_state, p2_name)
    {
        if (!this.initiated){throw "Object not initiated"}
        if (this.isEqual(game, p1_state, p1_name, p2_state, p2_name) || this.isSwapped(game, p1_state, p1_name, p2_state, p2_name))
        {
            return true
        }
        else {return false}
    }

    autoEqualSwappedSwap(game, p1_state, p1_name, p2_state, p2_name)
    /**
     * @description If it's the same or swapped, returns true. If swapped, automatically swap. If different, returns false.
     * @returns {boolean}
     */
    {
        if (!this.initiated){throw "Object not initiated"}
        if (this.isEqual(game, p1_state, p1_name, p2_state, p2_name))
        {
            return true
        }
        if (this.isSwapped(game, p1_state, p1_name, p2_state, p2_name))
        {
            [this.p1, this.p2] = [this.p2, this.p1];
            return true
        }
        else {return false}
    }

    countRecentWins(){
        
        var self = this;
        if (!this.extend_back)
        {
            this.p1.recent_wins = this.p1.wins;
            this.p2.recent_wins = this.p1.wins;
        }
        else
        {
            this.matches.some(function(match) {
                if (match.date < self.target_date){
                    return true;
                }
                else
                {
                    if (match.isWin(self.p1.name))
                    {
                        self.p1.recent_wins+=1;
                    }
                    else
                    {
                        self.p2.recent_wins+=1;
                    };
                }
            });
        }
    }
}

class AusmashMatch{
    constructor(match_obj)
    {

        this.tournament = match_obj.Tourney.Name;
        this.winner = match_obj.WinnerName;
        this.loser = match_obj.LoserName;
        this.wscore = match_obj.ScoreWins;
        this.lscore = match_obj.ScoreLosses;
        this.date = new Date(match_obj.Tourney.TourneyDate);
    }

    isWin(player){
        if (this.winner.toLowerCase()==player.toLowerCase())
        {return true}

        else
        {return false} 
    }

    getplayerScore(player){
        if (this.winner.toLowerCase()==p1.toLowerCase())
        {
            return this.wscore
        }
        else
        {
            return this.lscore
        }
    }

    toArray(p1)
    {
        //Format: [tournament, p1 name, p1 score, p2 name, p2 score]
        if (this.winner.toLowerCase()==p1.toLowerCase())
        {
            return [this.tournament, this.winner, this.wscore,
                this.loser, this.lscore];
        }
        else
        {
            return [this.tournament, this.loser, this.lscore,
                this.winner, this.wscore];
        }
    }
    toString(p1, show_tournament = False)
    {
        //TODO
    }
}

