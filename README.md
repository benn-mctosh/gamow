# gamow
Emulating a 1950s paper-and-pencil wargame

Play the game at [http://gamow.bennettmcintosh.com/play](http://gamow.bennettmcintosh.com/play)

Based on the game by George Gamow [[pdf instructions](https://grognard.com/download/games/board/tankgame.pdf)], as described by Thornton Page in [a 1953 report to J. Operations Res.](https://www.jstor.org/stable/166721).

As any TTRPG DM or GM knows, computer referees require much more explicit instructions than do the human referees used in the original version of this game. I've made some changes and interpretations:
* In the rules as originally written, in which victory is only achieved by eliminating all opposing tansk, one player could force a stalemate by placing, for example, three tanks in a clump of three cells. They would be able to cover all approaches. I considered various possibilities for removing this stalemate condition, inlcuding leaving as-is (and either documenting the forced draw or not), adding an "artillery" or "airstrike" tool that would discourage remaining overlong in the same place, or adding a timer after which the player with the most tanks on the field would win. I decided the least disruptive and most intuitive change would be adding a "capture the flag"–style victory condition, whereby a player can also win by capturing their opponent's back corner
* In order to implement a "back corner" I changed the shape of the board. It is also
slightly smaller (and with slightly fewer tanks) to allow faster games.
* To encourage using the woods to sneak past opposing players, I have (not yet!) implemented a "sneaking" flag whereby the player can order tanks not to fire unless they are spotted. 
* In the paper game, players can only see their own tanks, so visually depicting combat in a way both players could watch became an issue. I decided to assist players by marking visible the enemy tanks that were involved in the pervious round of combat (a fog-of-war style mechanism that may be familiar from many other games), but not to assist players in keeping track of individual tanks' trajectories (in other words, tanks are fungible — if two of your tanks are destroyed nearby on successive turns, you won't know for sure whether the same enemy tank or a different one did so). 
* The original board depicted in Thornton Page's description shows a seemingly random distribution of forests. I could have implemented a random distribution that changes every game, but decided that a default, symmetric distributionwas more fair and allows a more replicable exploration of the game's mechanics.
* The original game doesn't specify the order in which combat is resolved, which has subtle effects on the strategy. I resolve it in random order (and choose not to pit against each other tanks that pass each other while swapping places in the woods, since they can't see each other from their destinations)
