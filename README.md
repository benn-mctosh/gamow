# Gamow’s “tank game”
## Emulating a 1950s paper-and-pencil wargame (And also, what on Earth was its designer thinking??)

<img width="400" alt="A hexagon made of green and tan hexagons, some of which have purple or orange six-leged gamepieces on them" src="https://github.com/user-attachments/assets/117c3a28-1e52-420c-a061-622f737ef6a6">

Play the game at [http://gamow.bennettmcintosh.com/play](http://gamow.bennettmcintosh.com/play)

## 1. The History

In the late 40s and early 50s, physicist George Gamow[^1] was working at the Operations Research Office, one of the U.S. Army’s early forrays into would would eventually become the field of Operations Research.[^2] While there, he came up with a game played by three players (two opponents and a referee) with paper and “real tanks (from the 5&10 cents store).”[^3] Gamow intended the game to simulate the uncertain conditions of war (what any modern military planner or wargamer will surely be familiar with as “fog of war”). He hoped eventually to implement the game in an IBM computer, and have the computer play against itself many times to learn... something about military planning.

<img width="250" alt="Hex grid for Gamow's tank game. A 10x10 board of hexagons with mostly white cells, though some are a darker gray. Ten circular tokens for each of two players are arrayed on the top row (black tokens) and bottom row (white tokens)." src="https://github.com/user-attachments/assets/9939018e-71e0-4d44-a02b-345867e67e66">

The games rules are [described in a 1952 note](https://www.jstor.org/stable/166721) by Thorton Page to the *Journal of Operations Research*. Essentially, each player moves his tanks on a hidden board, and the referee then notes which tanks have come into contact with each other, and then resolves the ensuing “battles” by flipping a coin. A tank in a cleared (white) cell can be targeted by a tank on its own cell or any adjacent cell, but a tank in the wooded (gray) cells can only be targeted by a tank on its own cell. This means that a tank in the woods can be assured a clean kill of any tank on any adjacent cleared cells. This simple, intuitive rule creates...

## 2. ...The Big Problem

If the goal is to destroy all the opposing tanks, a player with at least two tanks can force a stalemate by placing them two wooded cells, making them unassailable. 

This makes it a game with possibly no winning move—what [Joshua from *WarGames*](https://en.wikipedia.org/wiki/WarGames#Plot) might called “a strange game.” Did Page lay out the rules incorrectly/incompletely? Did Gamow intend a stalemate-friendly game? Did Gamow’s colleagues simply play too aggressively for this to matter? 

**If you’re a historian or aficionado of physics, O.R., games, or the Cold War, maybe you can help me figure out what’s up?** 

[You can play the game here](http://gamow.bennettmcintosh.com/play), though I’ve made some changes, including eliminating the possibility of forced stalemate with a ‘capture the flag’–style victory condition. There are also [print-and-play versions available](https://grognard.com/download/games/board/tankgame.pdf).

## 3. Other Little Problems

As any TTRPG DM or GM knows, computer referees require much more explicit instructions than do the human referees used in the original version of this game. I've made some changes and interpretations, but I don’t know what Gamow did or would have chosen had he made these instructions explicit enough for a computer:
* I considered various possibilities for removing the stalemate condition, inlcuding leaving as-is (and either documenting the forced draw or not), adding an "artillery" or "airstrike" tool that would discourage remaining overlong in the same place, or adding a timer after which the player with the most tanks on the field would win. I decided the least disruptive and most intuitive change would be adding a “capture the flag”–style victory condition, whereby a player can also win by capturing their opponent's back corner
* In order to implement such a “back corner” I changed the shape of the board. It is also slightly smaller (and with slightly fewer tanks) to allow faster games. You are not an IBM computer, so if you’re going to learn the game through repetition, you need every advantage you can get
* Gamow doesn’t mention (nor does Page) whether a tank firing reveals its position. I’ve chosen to allow this to happen (it makes gameplay more fun/visually interesting, and allows the players to check the computer-referee’s work), but this amplifies another omission from Gamow’s rules:
* There’s no mention of whether a tank that fires explicitly reveals its position to the other player. I’ve chosen to do so, so after each round of combat, all the victorious tanks will be visible to the opposing player. I chose not, however, to assist players in keeping track of individual tanks' trajectories (in other words, tanks are fungible—if two of your tanks are destroyed nearby on successive turns, you won't know for sure whether the same enemy tank or a different one did so). 
* The original board depicted in Thornton Page's description shows a seemingly random, or at least asymmetrical, distribution of wooded cells. I might implement some sort of randomization in the future, but, symmetric distribution was more fair and allows a more replicable exploration of the game's mechanics.
* The original game doesn't specify the order in which battles are resolved, which has subtle effects on the strategy. I resolve them in random order
* Tanks in adjacent wooded cells that swap places might, if we insist on versimilitude, be able to see and fire on each other. I chose not to allow this, which means that stationary tanks play slightly better defense, and moving tanks play slightly better offense. 

Some of these questions (the possible advantages of passing up a ‘clear kill’, the question of making victors visible) have been noted in an interesting discussion of the game in a book released by the CNA Corporation (formerly the Center for Naval Analysis; like the ORO a 1940s-born military scence outfit).[^4] The athor, Brian McCue, is especially interested in how much of an advantage various information or kill-probability asymmetries would grant a player, and writes:

> These questions have the interesting property of being impossible to answer on the basis of pure consideration; probably even experienced players of the game would have have trouble answering these questions, and different players would give different answers. Nor are the questions subject to mathematical analysis via game theory or the like... Surely real war is no simpler. (p. 30)

---

We humans learn through experimentation, through play. Maybe you’ll simulate the game by running a million Monte Carlo iterations; maybe you’ll play the game enough yourself to get a *gestalt* understanding of the strategy. But in making this game a manageable, computable way of imagining war, Gamow inevitably, intentionally, abstracted out the human lives that the game contemplates losing.  

Gamow’s tank game is a tool for more efficient, more effective, simulation of death and destruction. It arose from the same broad intellectual circles as did the concept of a ‘winnable’ nuclear war. Because of this, those little hexagons fascinate me—but also terrify me.

[^1]: Also known, among other things, for the Alphe-Bethe-Gamow paper, in which Gamow screwed over his graduate student Alphe for the sake of a pun by adding his friend Bethe to the author list: https://en.wikipedia.org/wiki/Alpher%E2%80%93Bethe%E2%80%93Gamow_paper
[^2]: These were heady days for military science, you can read some great stuff about them in Mirowski’s *Machine Dreams* (Cambridge, 2001) and Erickson & colleagues’ *How Reason Almost Lost its Mind*, (Chicago, 2013) among others. 
[^3]: Gamow to von Nuemann, 1952, quoted in Mirowski, p. 362
[^4]: Brian McCue’s *The Art of Military Experimentation* (CNA, 2004), pp. 26–30. Accessed October 31, 2024 from https://www.cna.org/archive/CNA_Files/pdf/d0010079.a3.pdf 
