# StreametaPlugins
 Collection of plugins for Streameta that I've made for my own pleasure.

This is a collections of 'plugins' for Streameta that I made for various purposes that I see fit.

Previously two separate repos, now combined.

## How to use

1. Clone the project, and put it somewhere.
2. Create config.js file, and fill it it with your [Smash.GG API key](https://developer.smash.gg/docs/authentication/), [Streameta token](https://streameta.com/help/#8.5), and [Ausmash API key](https://ausmash.com.au/api).
3. Follow plugin-specific setup if necessary.

## Tournament Sets Getter

Shows a player's result in this exact tournament, who they won/lost to today. Don't need to check Smash.GG anymore!

![Example of usage](https://i.imgur.com/YyPe9YD.png)

### Features

* Grabs player names from your Streameta overlay and displays their matches from the event.
* Supports Smash.GG brackets (Other bracket sites soon, maybe)

### Limitations

* Currently only works with Smash.GG, Challonge support coming soon.  
* **Only supports singles matches for now.**  
* Only supports bracket links to event, not tournament.  
* May still have bugs w.r.t. Players with no games played.

### How to Use

Add tournament_sets.html as a Browser Source to a scene of your choice, and attach at the end of the URL, either "?side=p1" or "?side=p2" before saving.

## Ausmash Head-to-head Display
 Displays head-to-head history between two players using data from Ausmash.

![Example of usage](https://i.imgur.com/v7rNT2D.png)

### Features

* Shows the head-to-head history between the two players that are playing.  
* Shows latest results between those two players.

### Limitations

* Players must exist in the Ausmash database and be classified as Australian.   
* Singles only, does not work on doubles. Not like they record doubles anyway.

### How to Use

Add h2h_display.html as a Browser Source to a scene of your choice, and set the width and height to 640x360px before saving.


**Upcoming updates**

* Implement support for Challonge.
* Actual tests, maybe.

## Shoutouts

 * To the **Queensland Smash Community**, for being awesome.
 * To [**Jett Williams**](https://jettwilliams.name/) of Tournameta, creator of Streameta, arguably the best stream overlay manager ever.
 * To **Shitashi**, creator of Ausmash. The Australian Smash community is eternally blessed by your creation.