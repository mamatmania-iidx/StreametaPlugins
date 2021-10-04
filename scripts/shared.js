const formatSetData = (string, player) => {
    let re = new RegExp("(.*) ([0-9]+) - (.*) ([0-9]+)");
    var temp;
    var result = re.exec(string);
    var p1 = result[1];
    var p1_score = parseInt(result[2]);
    var p2 = result[3];
    var p2_score = parseInt(result[4]);

    temp = p1.split("|");
    if (temp.length > 1){
       p1 = temp.slice(1).join('').trim();
    }
    temp = p2.split("|");
    if (temp.length > 1){
       p2 = temp.slice(1).join('').trim();
    }

    closest = difflib.getCloseMatches(player, [p1, p2]);
    player = closest[0];
    if (player == p1){
       var player_score = p1_score
       var opp_score = p2_score
       var opponent = p2
    }
    else {
      var player_score = p2_score
      var opp_score = p1_score
      var opponent = p1
    }

    if (player_score > opp_score){
      var symbol = "✔"
    }
    else {
      var symbol = "✗"
    }

    return `${player_score} - ${opp_score} ${symbol} ${opponent}`
};
