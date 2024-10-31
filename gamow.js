// todo: start tanks with orders to advance
// turn system
// adding 
/* There are many judgement calls I've had to make:
- In the rules as originally written, in which victory is only achieved by 
  eliminating all opposing tansk, one player could force a stalemate by 
  placing, for example, three tanks in a clump of three cells. They would 
  be able to cover all approaches. I considered various possibilities for removing
  this stalemate condition, inlcuding leaving as-is (and either documenting the
  forced draw or not), adding an "artillery" or "airstrike" tool that would discourage
  remaining overlong in the same place, or adding a timer after which the player
  with the most tanks on the field would win. I decided the least disruptive and 
  most intuitive change would be adding a "capture the flag" victory condition, 
  whereby a player can also win by capturing their opponent's back corner
- In order to implement a "back corner" I changed the shape of the board. It is also
  slightly smaller (and with slightly fewer tanks) to allow faster games.
- To encourage using the woods to sneak past opposing players, I have implemented
  a "sneaking" flag whereby the player can order tanks not to fire unless they 
  are spotted. 
- In the paper game, players can only see their own tanks, so visually depicting
  combat in a way both players could watch became an issue. I decided to assist
  players by marking the enemy tanks that were involved in the pervious round of combat
  (a fog-of-war style mechanism that may be familiar from many other games), but not 
  to assist players in keeping track of individual tanks' trajectories (in other
  words, tanks are fungible — if two of your tanks are destroyed nearby on 
  successive turns, you won't know for sure whether the same enemy tank or a 
  different one did so). 
- The original board depicted in Thornton Page's description shows a seemingly 
  random distribution of forests. I could have implemented a random distribution
  that changes every game, but decided that a default, symmetric distribution
  was more fair and allows a more replicable exploration of the game's mechanics.
- The original game doesn't specify the order in which combat is resolved, which
  has subtle effects on the meta. For versimilitude, combat is resolved in the
  following order: 
   1. pairs that have swapped places (as if encountering each other in transit)
   2. tanks occupying the same hex target each other
   3. tanks in wooded hexes destroy all tanks in adjacent cleared hexes
   4. tanks in adjacent cleared hexes target each other
*/

// game options
const DEBUG = false; // makes "hidden" tanks visible for DEBUGging
const bigBoard = false; // side length of the game board (default 5, 6 is big)
if (bigBoard) {
  document.getElementById("game-board").style.minHeight = "650px";
  document.getElementById("game-board").style.maxHeight = "650px";
  document.getElementById("game-board").style.width = "550px";
  document.getElementById("turn-screen").style.width = "550px";
  document.getElementById("turn-screen").style.minHeight = "650px";
  document.getElementById("turn-screen").style.maxHeight = "650px";
  document.getElementById("qRemaining").innerHTML = "🟠🟠🟠🟠 🟠🟠🟠🟠 🟠🟠🟠🟠";
  document.getElementById("pRemaining").innerHTML = "🟣🟣🟣🟣 🟣🟣🟣🟣 🟣🟣🟣🟣"
}

const hiddOp = DEBUG ? 0.5 : 0;
const showOp = "1"; // opacity of visible tanks

// BOARD SPECS & GAME DATA INIT
// defaults to a 5-a-side hexagon (65 cells) with 8 tanks

// display constants
const IMGH = 56; // the actual height of a hex (px)
const IMGW = 64; // the actual width of a hex
const IMGRAD = 28; // the radius for the border surrounding it
const COLW = 48; // the width of a column (because columns interleaf slightly)

const bSideLen = bigBoard ? 6 : 5;
const lcols = bigBoard // row i starts lcols[i] columns to the right of col 0
    ? [5, 4, 3, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 3, 4, 5]
    : [4, 3, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 3, 4];
    
const ncols = bigBoard // row i has ncols[i] columns
    ? [1, 2, 3, 4, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 4, 3, 2, 1]
    : [1, 2, 3, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 3, 2, 1];
    
const woods = bigBoard // the woods are on these hexes
    ? "A05 A07 A09 A11 A13 A15 B08 B10 B12 C09 C11 K05 K07 K09 K11 K13 K15" + 
    " J08 J10 J12 I09 I11 D06 E07 F04 G03 G05 H02 H04 D16 D18 E15 E17 F16 G13 H14 F10"
    : "B03 A04 A06 A08 A10 A12 I04 I06 I08 I10 I12 H13 C08 C10 D07 D09 D11 E08 F05 F07 F09 G08 G06";
    
const startQ = bigBoard // the orange tanks start on these cells
    ? ["A07", "B06", "B08", "C07", "E07", "F08", "F06", "G07", "I07", "J06", "J08", "K07"]
    : ["B05", "C04", "D03", "E02", "E04", "F03", "G04", "H05"];

const startP = bigBoard // the purple tanks start on these cells
    ? ["A13", "B12", "B14", "C13", "E13", "F14", "F12", "G13", "I13", "J12", "J14", "K13"]
    : ["B11", "C12", "D13", "E12", "E14", "F13", "G12", "H11"];
    
const baseP = bigBoard ? "F20" : "E16"; // Purple base
const baseQ = bigBoard ? "F00" : "E00"; // Orange base

/* 
if (bSideLen == 5) {
    // offset and count of cells in each row of the board
    const lcols = [4, 3, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 3, 4]; 
    const ncols = [1, 2, 3, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 3, 2, 1];
    
    // specify which cells have woods and home bases
    const woods = "A04 A06 A08 A10 A12 I04 I06 I08 I10 I12" + // 5- FLANKS
                    "C08 D07 D09 E06 E08 E10 F07 F09 G08"; //5 - CENTER
    const baseP = "E16"; 
    const baseQ = "E00"; 
    
    // specify where the tanks start
    const startQ = ["B03", "B05", "D03", "E02", "E04", "F03", "H03", "H05"]
    const startP = ["B13", "B11", "D13", "E12", "E14", "F13", "H13", "H11"]
}

// if loop for larger boards, to activate change b[oard]SideLen at top
if (bSideLen == 6) {
    console.log("six")
    const lcols = [5, 4, 3, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 3, 4, 5]; 
    const ncols = [1, 2, 3, 4, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 4, 3, 2, 1];
    
    const woods = "A05 A07 A09 A11 A13 A15 B08 B10 B12 C09 C11" + // 6-left flank
                    "K05 K07 K09 K11 K13 K15 J08 J10 J12 I09 I11" + // 6-right flank
                    "D06 E07 F04 G03 G05 H02 H04" + //6 - tops
                    "D16 D18 E15 E17 F16 G13 H14 F10"  // 6 - bottom and center
    const baseP = "F20";
    const baseQ = "F00";
    const startQ = ["A05", "B04", "B06", "C05", "E05", "F06", "F04", "G05", "I05", "J04", "J06", "K05"];
    const startP = ["A15", "B14", "B16", "C15", "E15", "F16", "F14", "G15", "I15", "J14", "J16", "K15"];
    console.log("six")
}
*/

// tanksRemaining is a global variable that tracks how many tanks live
let tanksRemaining = [startP.length, startQ.length]

// list of all tanks and hexes; 
const tanks = {};
const hexes = {};

// changes each time a tank is selected -- the hexes available for movement
const availableHexes = [];

// tracks the game's stage; there has to be a better way of doing this
gameStage = {"o": true, "p": false, "over": false};

// tracks the selected tank
var activeSprite = null;

/* 
Click interactions
*/ 

// show/hide written instructions
function toggleInstructions() {
  let ds = document.getElementById("instructions")
  if (ds.hasAttribute("hidden")) {
    ds.removeAttribute("hidden");
    document.getElementById("insToggle").innerHTML = "Hide"
  }
  else {
    ds.setAttribute("hidden", false)
    document.getElementById("insToggle").innerHTML = "Show"

  }
}
         
// spotlight a tank if the mouse is hovering over it   
function spotlight(x) {
  if (activeSprite != null) {return;}
  if (gameStage[x.id[0]]) {
    x.style.backgroundColor = "rgba(71, 255, 255, 0.5)";
  }
}

// remove the spotlight once the mouse moves on
function unlight(x) {
  if (activeSprite != null) {return;}
  if (gameStage[x.id[0]]) {
    x.style.backgroundColor = "transparent";
  }
}
  
// unselects a tank
function deSelectSprite() {
  if (activeSprite == null) {return;}  // don't bother if none's selected
  
  // recolor the tank
  activeSprite.style.border = "none";
  activeSprite.style.backgroundColor = "transparent";
  activeSprite = null;
  
  // de-grayscale the inactive hexes
  for (i in hexes) {
    h = hexes[i];
    h.style.filter = "none"
  } 
  
  // de-emphasize the active hexes
  for (i in availableHexes) {
    let h = availableHexes[i];
    h.style.backgroundColor = "transparent";
    h.style.border = "none";
    h.style.opacity = "1"
    h.style.transform = "none";
    h.style.zIndex = "0";
    h.dataset.inRange = "false";
    h.onmouseover = "none";
    h.onmouseout = "none";
    h.onclick = "none";
    delete availableHexes[i];
  }
  
  // hide all messaging about the selected tank
  document.getElementById("tankhint").setAttribute('hidden', false);
  document.getElementById("sneak").setAttribute('hidden', false);
  document.getElementById("unsneak").setAttribute('hidden', false);
  document.getElementById("toggleSneak").setAttribute('hidden', false);
  
  // reveal instructions for selecting a tank
  document.getElementById("hexhint").removeAttribute('hidden');
}

function selectSprite(x) {
  if (activeSprite != null) {return;} // you can't select a tank while another is selected
  
  // you can only select live tanks on your own team
  if (gameStage[x.id[0]] && x.dataset.live == "T") {
      deSelectSprite(); // can probably remove
      
      
      activeSprite = x;
      
      // desaturate all the hexes you can't move to, and highlight the ones you can
      availableHexes.push(...hexesByTank(x));
      for (i in hexes) {
        h = hexes[i];
        h.style.filter = "saturate(0%)"
      }
      for (i in availableHexes) {
        h = availableHexes[i];
        h.style.filter = "none"
        h.style.opacity = "0.7"
        h.style.zIndex = "2";
        h.dataset.inRange = true;
        
        // available hexes will react to mouseover
        h.onmouseover = function() {hoverHex(this)};
        h.onmouseout = function() {unHoverHex(this)};
        h.onclick = function() {cmdToHex(this, activeSprite)};
        
        // the current destination will get a dashed green border
        if (h.id == x.dataset.dest) {
          h.style.border = "rgb(70, 255, 70) dashed 5px";
        }
      }
      
      // change the instructions to display info/options for the selected tank
      document.getElementById("hexhint").setAttribute('hidden', false);
      document.getElementById("tankhint").removeAttribute('hidden');
      /* document.getElementById("toggleSneak").removeAttribute('hidden');
      if (x.dataset.sneaking == "T") {
        document.getElementById("sneak").removeAttribute('hidden');
      }
      else {
        document.getElementById("unsneak").removeAttribute('hidden');
      } */ 
  }
}

function hoverHex(x) {
  // if (x.dataset.live != "T") {return;} 
  x.style.opacity = "1";
  // x.style.transform = "scale(1, 1)";
  x.style.border = "rgb(70, 255, 70) solid 5px";
  // x.style.backgroundColor = "rgb(70, 255, 70)";
}

function unHoverHex(x) {
  // if (x.dataset.live != "T") {return;}
  x.style.opacity = "0.7";
  // h.style.transform = "scale(0.8, 0.8)";
  x.style.border = "none";
  if (x.id == activeSprite.dataset.dest) {
    x.style.border = "rgb(70, 255, 70) dotted 5px";
  }
  // x.style.backgroundColor = "transparent";
}

function cmdToHex(x, tank) {
  if (!x.dataset.inRange) {return;}
  dir = getDir(tank.dataset.loc, x.id);
  if (!dir) {return;}
  tank.dataset.dest = x.id;
  if (tank.id.includes("or")) {var color = "Orange";}
  else {var color = "Purple";}
  if (dir == "hold") {tank.src = "imgs/s" + color + ".png";}
  else {
    tank.src = "imgs/s" + color + "A.png";
    tank.style.transform = dir;
  }
  deSelectSprite();
}

function getHexId(col, row) {
  return String.fromCharCode(65 + col) + ('0' + row).slice(-2);
}

function idToCol(id) {
  return id[0].charCodeAt() - 65;
}

function idToRow(id) {
  let cha = id[0];
  return parseInt(id.split(cha)[1]);
}

function hexesByTank(tank) {
  let id = tank.dataset.loc;
  return hexesAdjTo(id);
} 

function hexesAdjTo(id) {
  let adjs = [hexes[id]]; // will run zero, then widershins from NW
  let col = idToCol(id);
  let row = idToRow(id);
  const colDs = [-1, -1, 0, 1, 1, 0]
  const rowDs = [-1, 1, 2, 1, -1, -2]
  for (var i = 0; i < 6; i++) {
    let id = getHexId(col + colDs[i], row + rowDs[i])
    if (Object.keys(hexes).includes(id)) {
      adjs.push(hexes[id])
    }
  }
  return adjs;
}

function hexesVisTo(id) {
  let adjs = [hexes[id]]; // will run zero, then widershins from NW
  let col = idToCol(id);
  let row = idToRow(id);
  const colDs = [-1, -1, 0, 1, 1, 0]
  const rowDs = [-1, 1, 2, 1, -1, -2]
  for (var i = 0; i < 6; i++) {
    let id = getHexId(col + colDs[i], row + rowDs[i])
    if (Object.keys(hexes).includes(id) && !document.getElementById(id).src.includes("hGreen")) {
      adjs.push(hexes[id])
    }
  }
  return adjs;
}
 
function getDir(hexFromId, hexToId) {
  reachable = hexesAdjTo(hexFromId);
  if (!reachable.includes(hexes[hexToId])) {return false;}
  if (hexFromId == hexToId) {return "hold";}
  let cha1 = hexFromId[0];
  let cha2 = hexToId[0];
  let west = cha1.charCodeAt() - cha2.charCodeAt();
  let north = parseInt(hexFromId.split(cha1)[1]) - parseInt(hexToId.split(cha2)[1]);
  if (north > 0) { 
    if (west > 0) {return "rotate(300deg)";}
    if (west == 0) {return "rotate(0deg)";}
    return "rotate(60deg)";
  }
  if (west > 0) {return "rotate(240deg)";}
  if (west == 0) {return "rotate(180deg)";}
  return "rotate(120deg)";
}

function hexByDir(hexId, dir) {
  let row = idToRow(hexId);
  let col = idToCol(hexId);
  if (dir.includes("N")) {
     var NS = -1;
  }
  else {
     var NS = 1;
  }
  if (dir.includes("E")) {
    col = col - 1;
  }
  else if (dir.includes("W")) {
    col = col + 1;
  }
  else {
    NS = NS * 2;
  }
  row = row + NS;
  return getHexId(col, row);
}

function placeImg(imgName, x, y, id) {
    // Get the game-board element by its ID
    var gameBoard = document.getElementById("game-board");
    
    // Create a new image element
    var img = document.createElement("img");
    
    // Set the source of the image
    img.src = imgName;
    
    img.style.width = IMGW + "px";   // Set width to 64px
    img.style.height = IMGH + "px";  // Set height to 56px
    img.id = id; 
    
    // Set the position of the image using the offsets
    img.style.position = "absolute"; // Set position to absolute
    img.style.left = x + "px";  // Set x offset
    img.style.top = y + "px";   // Set y offset
    img.style.borderRadius = IMGRAD + "px";
    
    // add the functions for a tank
    if (id.includes("or") || id.includes("pu")) {
      // img.style.borderRadius = IMGRAD + "px";
      img.onmouseover = function() {spotlight(this);}
      img.onmouseout = function() {unlight(this);}
      img.onclick = function() {selectSprite(this);}
      img.dataset.live = "T";
      img.dataset.vis = "T";
      img.dataset.sneaking = "F";
      img.style.zIndex = "1";
      // if (id.includes("or")) {
        // img.style.transform = "rotate(180deg)";
      // }
    }
    
    // implement fog of war on the hex cells
    else {
      img.dataset.visTo = "OP"; // TODO: fog of war
      img.dataset.occ = "";
      //img.style.opacity = "0.5";
    }
        
    // Append the image to the game-board element
    gameBoard.appendChild(img);
    return img;
}

function placeHexes() {
    var yOffset = -10;
    var xMiddle = document.getElementById("game-board").clientWidth / 2;
    var idSuffix = '';
    var tanHex = "imgs/hTan.png"
    var grnHex = "imgs/hGreen.png"
    var puBase = "imgs/hPurple.png"
    var orBase = "imgs/hOrange.png"
    var startCol = 5;
    
    // Loop for 4N-3 rows
    var nrows = bSideLen * 4 - 3;
    for (var row = 0; row < nrows; row++) {
        // Calculate yOffset for the row
        yOffset += IMGH / 2;
        startCol = lcols[row];
        endCol = startCol + (ncols[row]) * 2;
        xOffset = xMiddle + (startCol - bSideLen * 4/3) * COLW;
        
        // Loop for 5 columns
        for (var col = startCol; col < endCol; col += 2) {
            // Calculate xOffset for the column
            xOffset += COLW * 2;
            
            // Generate the unique three-character ID for each hex
            var id =  getHexId(col, row);
            
            // Call the placeImg function to place the image
            var img
            if (woods.includes(id)) {imgpath = grnHex;}
            else if (id == baseP) {imgpath = puBase;}
            else if (id == baseQ) {imgpath = orBase;}
            else {imgpath = tanHex;}
            hexes[id] = placeImg(imgpath, xOffset, yOffset, id); 
        }
    }
}
                
function setTanks() {
  ntanks = startQ.length
  var id = ""
  for (var i = 0; i < ntanks; i++) {
    let id = "or" + String.fromCharCode(65 + i);
    let h = hexes[startQ[i]];
    let x = h.style.left.split("px")[0];
    let y = h.style.top.split("px")[0];
    tanks[id] = placeImg("imgs/sOrange.png", x, y, id);
    tanks[id].dataset.loc = h.id;
    h.dataset.occ = id;
    tanks[id].dataset.dest = h.id;
  }
  for (var i = 0; i < ntanks; i++) {
    let id = "pu" + String.fromCharCode(65 + i);
    let h = hexes[startP[i]];
    let x = h.style.left.split("px")[0];
    let y = h.style.top.split("px")[0];
    tanks[id] = placeImg("imgs/sPurple.png", x, y, id);
    tanks[id].dataset.loc = h.id;
    h.dataset.occ = id;
    tanks[id].dataset.dest = h.id;
  }    
} 

function gameOver(winner) {
    var message;
    if (winner == "Orange") {
      message = "Game over — Orange won! 🔥 🌞 🧡";
        document.getElementById("banner").style.boxShadow = "5px 5px Orange";
        for (h in hexes) {
          if (!woods.includes(h)) {hexes[h].src = "imgs/hOrange.png";}
        }
    }
    else if (winner == "Purple") {
      message = "Game over — Purple won! 😈 🏴 🩷";
      document.getElementById("banner").style.boxShadow = "5px 5px Purple";
      for (h in hexes) {
        if (!woods.includes(h)) {hexes[h].src = "imgs/hPurple.png";}
      }
    }
    else {
      message = "Game over — Tied match! 😈 ⚔️ 🌞";
      document.getElementById("banner").style.boxShadow = "5px 5px Gray";
      for (h in hexes) {
        if (!woods.includes(h)) {hexes[h].src = "imgs/hGray.png";}
      }
    }
    for (i in tanks) {
      tanks[i].onmouseover = "";
      tanks[i].onclick = "";
      tanks[i].onmouseout = "";
      if (tanks[i].dataset.live == "T") {
        tanks[i].style.opacity = showOp;
      }
    }
    document.getElementById("hexhint").innerHTML = message;
    document.getElementById("newGame").hidden = false;
    
}


// TODO: all advance option

function moveTank(k) {
  let isMoving = document.getElementById(k).dataset.loc != document.getElementById(k).dataset.dest;
  if (isMoving) {
    console.log("moving " + k + " from " + document.getElementById(k).dataset.loc + " to " + document.getElementById(k).dataset.dest);
  }
  else {
    console.log(k + " staying at " + document.getElementById(k).dataset.loc)
  }
  let img = document.getElementById(k);
  let newHex = document.getElementById(img.dataset.dest);
  let oldHex = document.getElementById(img.dataset.loc)
  if (k[0] == "o") {var color = "Orange";}
  else {var color = "Purple";}
  img.src = "imgs/s" + color + ".png";
  if (oldHex == newHex) {return;}
  img.dataset.loc = img.dataset.dest;
  img.style.left = newHex.style.left;
  img.style.top = newHex.style.top;
  
  // if the old hex has another tank in it, only remove the current tank
  var occTemp = []
  if (oldHex.dataset.occ != "") {occTemp = oldHex.dataset.occ.split(",");}
  occTemp.splice(occTemp.indexOf(k), 1);
  oldHex.dataset.occ = occTemp.join(",");
  
  // do the same for the new hex
  if (newHex.dataset.occ == "") {occTemp = [];}
  else {occTemp = newHex.dataset.occ.split(",");}
  occTemp.push(k);
  newHex.dataset.occ = occTemp.join(","); // order of these two lines matters!

}

function moveTanks() {
  let arr = Object.entries(tanks);
  
  /* TODO: Check if swapping
  for (e in arr) {
    if (arr[e][1]) {
       let k = arr[e][0];    
    }
  }
  */ 
  const swaps = [];
  for (e in arr) {
    let k = arr[e][0];
    if (document.getElementById(k).dataset.live == 'T') {
      moveTank(k);
    }
  }
  return swaps;
  // return(swaps);
    //console.log("moving " + k + " from " + document.getElementById(k).dataset.loc + " to " + document.getElementById(k).dataset.dest);
}

function gamShuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Create a random index to pick from the original array
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // Cache the value, and swap it with the current element
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
} // from https://pitayan.com/posts/javascript-shuffle-array/



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function highlightPair(p) {
    let atk = document.getElementById(p[0]);
    let targ = document.getElementById(p[1]);
    atk.style.opacity = showOp;
    targ.style.opacity = showOp;
    atk.style.backgroundColor = "rgba(255, 100, 0, 0.8)";
    targ.style.backgroundColor = "rgba(255, 100, 0, 0.8)";
    return;
}

function resolvePair(pair) {
    // get ids elements for attacker and target, plus hex
    let atk = document.getElementById(pair[0]);
    let targ = document.getElementById(pair[1]);
    let targHex = document.getElementById(targ.dataset.loc);
    console.log(targ)
    
    atk.style.backgroundColor = "transparent";
    targ.style.backgroundColor = "transparent";
    
    // tanksRemaining is a general variable, decremented every time  a tank is lost
    if (pair[1][0] == "o") {
      var xOffset = 0;
      var yOffset = 0;
      tanksRemaining[0] = tanksRemaining[0] - 1;
      let fours = Math.floor(tanksRemaining[0] / 4);
      let singles = tanksRemaining[0] % 4;
      document.getElementById("qRemaining").innerHTML = "🟠🟠🟠🟠 ".repeat(fours) + "🟠".repeat(singles)

      // if (tanksRemaining[0] == 0) {alert("Purple won! 😈🏴🩷\n\nRefresh for a new game")}
    }
    else {
      var xOffset = 0;
      var yOffset = 0;
      tanksRemaining[1] = tanksRemaining[1] - 1;
      let fours = Math.floor(tanksRemaining[1] / 4);
      let singles = tanksRemaining[1] % 4;
      document.getElementById("pRemaining").innerHTML = "🟣🟣🟣🟣 ".repeat(fours) + "🟣".repeat(singles)
      // if (tanksRemaining[1] == 0) {alert("Orange won! 🔥🌞🧡\n\nRefresh for a new game")}
    }
    targ.style.left = xOffset + "px";
    targ.style.top = yOffset  + "px";
    targ.dataset.live = "F";
    targ.dataset.loc = "";
    targ.dataset.dest = "";
    targ.onmouseover = "none";
    targ.onmouseout = "none";
    targ.onclick = "none";
    targHex.dataset.occ = targHex.dataset.occ.replace(pair[1], "")
    targ.hidden = true;
    // atk.dataset.vis = "T";
}

async function resolveCombat() {
  // render all tanks transparent
  for (i in tanks) {
    let t = tanks[i];
    if (t.dataset.live == "T")
        t.style.opacity = hiddOp;
        t.dataset.vis = "F";
  } 
  // build targList
  let targList = [];
  // arr is an enumerated list of tanks for iteration
  let arr = Object.entries(tanks)
  for (i in arr) {
    let tank = arr[i][1];
    
    // if tank is alive...
    if (tank.dataset.live == "T") {
        let id = arr[i][0];
        console.log(id + " @ " + tank.dataset.loc);
        // find the hexes visible to it
        let visList = hexesVisTo(tank.dataset.loc);
        console.log(visList);
        // for each of those hexes...
        for (j in visList) {
          let hex = visList[j];
          
          // if the hex is occupied...
          if (hex.dataset.occ != "") {
              // console.log("'" + hex.dataset.occ + "'")
              // get the list of occupants... 
              let occs = hex.dataset.occ.split(",");
              // console.log(occs)
              // ...for each of those occupants...
              for (t in occs) {
                let targ = occs[t]
                if ((targ != "") && (targ[0] != id[0])) { // fix in case same hex (??) 
                  // add "current tank [id] targets this occupant [targ]" to target list
                  console.log(id + "–" + targ)
                  targList.push([id, targ]);
                  // make both tanks visible, regardless of whether they fire
                  tank.dataset.vis = "T";
                  tank.style.opacity = showOp;
                  tanks[targ].style.opacity = showOp;
                }              
              }
          
          }
        } 
    }
  }
  console.log(targList);
  let tl = gamShuffle(targList);
  await sleep(100)
  // console.log(tl);
  
  for (i in tl) {
      let p = tl[i];
      let targLive = (document.getElementById(p[1]).dataset.live == "T");
      let atkLive = (document.getElementById(p[0]).dataset.live == "T");
      if (atkLive && targLive) {
          highlightPair(p);
          await sleep(1000);
          resolvePair(p);
          await sleep(500);
      }

  }
  
  console.log("checking for victory...")
    
  var basePocc = document.getElementById(baseP).dataset.occ[0] == "o";
  var baseQocc = document.getElementById(baseQ).dataset.occ[0] == "p";
  
  if (tanksRemaining[0] == 0) {
    gameOver("Purple"); 
    gameStage.over = true; 
    return true;
  }
  if (tanksRemaining[1] == 0) {
    gameOver("Orange"); 
    gameStage.over = true; 
    return true;
  }
  else if (basePocc && baseQocc) { 
    if (tanksRemaining[0] > tanksRemaining[1]) {
      gameOver("Orange");
      gameStage.over = true; 
    }
    else if (tanksRemaining[1] > tanksRemaining[0]) {
      gameOver("Purple"); 
      gameStage.over = true; 
    }
    else {
      gameOver("Tied");
      gameStage.over = true; 
    }
   }
   else if (basePocc) {
      gameOver("Orange");
      gameStage.over = true; 
    }
   else if (baseQocc) {
      gameOver("Purple"); 
      gameStage.over = true; 
    }
  
  console.log(gameStage);
  
  await sleep(500)
  
  if (!gameStage.over) {
      console.log("continuing game...")
      document.getElementById("hexhint").innerHTML = "Combat resolved!\nNow, start a new round and let Orange make their commands in secret again..."
      document.getElementById("startOrange").hidden = false;
      if (DEBUG) {startOrange();}
  }
  
  return false;


}

function validateMove(team) {
  var dests = [];
  var ks = Object.keys(tanks);
  for (k in ks) {
    if (ks[k].includes(team)) {
      var tank = tanks[ks[k]];
      if (tank.dataset.dest != "" && dests.includes(tank.dataset.dest)) {
        console.log("found collision!")
        return false;
      }
      else {
        dests.push(tank.dataset.dest)
      }
    }
  }
  console.log(dests);
  return true;

}

function showTanks(team) {
  for (i in tanks) {
    let t = tanks[i];
    if (t.id[0] == "o") {var color = "Orange";}
    else {var color = "Purple"}
    t.src = "imgs/s" + color + ".png"
    if (t.id[0] == team || t.dataset.vis == "T" || t.dataset.live == "F") {
      t.style.opacity = showOp;
      
    }
    else {
      t.style.opacity = hiddOp;
    }
  }
}

function endTurn(playerCode, bkgd, name) {
    document.getElementById("game-board").hidden = true;
    document.getElementById("turn-screen").hidden = false;
    document.getElementById("submit").hidden = true;
    gameStage[playerCode] = false;
    if (playerCode == "o") {
        document.getElementById("submit").hidden = true;
        document.getElementById("startPurple").hidden = false;
        document.getElementById("hexhint").innerHTML = "Great — Now let Purple complete their orders in secret!"
        if (DEBUG) {startPurple();}
    }
    else { 
        document.getElementById("submit").hidden = true;
        document.getElementById("startCombat").hidden = false;
        document.getElementById("hexhint").innerHTML = "Great! Now both players can watch their orders resolve."
        if (DEBUG) {startCombat();}

    }
}

function startTurn(playerCode, bkgd, name) {
  console.log(playerCode);
  document.getElementById("game-board").hidden = false;
  document.getElementById("turn-screen").hidden = true;
  document.getElementById("startPurple").hidden = true;
  document.getElementById("startOrange").hidden = true;
  document.getElementById("submit").hidden = false;
  gameStage["p"] = false;
  gameStage["o"] = false;
  gameStage[playerCode] = true;
  showTanks(playerCode)
  // document.getElementById("teamName").innerHTML = name;
  // document.getElementById("teamName").style.backgroundColor = bkgd;
  document.getElementById("banner").style.boxShadow = "5px 5px " + bkgd;
}

function startPurple() {
  startTurn("p", "purple", "«Purple»")
  document.getElementById("hexhint").innerHTML = "Now, Purple: Click a Tank to give it orders."

}

function startOrange() {
  startTurn("o", "orange", "«Orange»")
  document.getElementById("hexhint").innerHTML = "Orange: Click a Tank to give it orders."
}

function startCombat() {
    document.getElementById("game-board").hidden = false;
    document.getElementById("turn-screen").hidden = true;
    document.getElementById("startCombat").hidden = true;
    document.getElementById("hexhint").innerHTML = "Resolving combat..."
    const swaps = moveTanks();
    resolveCombat(swaps); 
    console.log(gameStage);
}

function submit() {
  deSelectSprite();
  if (gameStage["o"] && gameStage["p"]) {
    alert("error, both purple and orange turns somehow lol");
    return;
  }
  if (gameStage["o"]) {    
    let valid = validateMove("o");
    if (!valid) {
      alert("Oops, that won’t work: No two tanks can have the same destination!");
      return;
    }
    endTurn("o", "orange", "«Orange»")
  }
  else if (gameStage["p"]) {
    let valid = validateMove("p");
    if (!valid) {
      alert("Oops, that won’t work: No two tanks can have the same destination!");
      return;
    }
    endTurn("p", "purple", "«Purple»")
  }
  else {
    alert("error, neither purple nor orange turns somehow lol");
    return 0;
  }
}


// pressing the "toggle sneakiness" button changes the selected tank's sneakiness
function toggleSneak(x) {
  alert("Sorry, I haven't implemented this yet :(")
/*  if (x.dataset.sneaking == "T") {
    console.log("changing sneak to unsneak")
    x.dataset.sneaking = "F";
    document.getElementById("sneak").setAttribute('hidden', false);
    document.getElementById("unsneak").removeAttribute('hidden');
  }
  else {
    console.log("changing unsneak to sneak")
    x.dataset.sneaking = "T";
    document.getElementById("unsneak").setAttribute('hidden', false);
    document.getElementById("sneak").removeAttribute('hidden'); 
  }*/
}


// Call the placeHexes function to populate the game board with hexes
placeHexes();
setTanks();




