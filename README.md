# sets-getter-js
 Streameta Set Getter, but in JS.

This is a 'plugin' for Streameta, allowing you to show players' matches on stream as the tournament progresses.

![Example of usage](https://i.imgur.com/YyPe9YD.png)

**Features**

* Grabs player names from your Streameta overlay and displays their recent matches.
* Supports Smash.GG brackets (Other bracket sites soon, maybe)

**Limitations**

Currently only works with Smash.GG, Challonge support coming soon.  
*Only supports bracket links to event, not tournament.*  
May still have bugs w.r.t. Players with no games played.

**How to use**

1. Clone the project, and put it somewhere.
2. Create config.js file, and fill it it with your [Smash.GG API key](https://developer.smash.gg/docs/authentication/) and [Streameta token](https://streameta.com/help/#8.5).
3. Add tournament_sets.html as a Browser Source, and attach at the end of the URL, either "?side=p1" or "?side=p2"


**Customization**

You can customize the output by modifying the functions that are in main.js and shared.js. I've marked the sections you need to modify, don't touch other things unless you understand what is happening with this spaghetti of a code.

**Upcoming updates**

* Implement support for Challonge.
* Actual tests for the class.
* Merge with [the matchup viewer](https://github.com/mamatmania-iidx/Streameta-Ausmash-VS-Display) into a unified banner. Streameta Plugins, maybe?