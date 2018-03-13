console.log("linked");

let number = $("#counter");
let progress = $("#progress-bar");
let counter = 0;
let progressCounter = 0;
let direction = true;
let progressDirection = true;
let gameCounter = true; // game counter for turns
let gameState = "live";
let selectEnemy = false;
let robotList = [
  {
    id: "robot1",
    name: "hardcoded1",
    isVisible: true,
    cooldown: 3,
    masterCooldown: 3,
    isOwn: true,
    hp: 100,
    ammo: 3,
    ammoCap: 3,
    isDead: false
  },
  {
    id: "robot2",
    name: "hardcoded2",
    isVisible: true,
    cooldown: 4,
    masterCooldown: 4,
    isOwn: true,
    hp: 100,
    ammo: 2,
    ammoCap: 3,
    isDead: false
  },
  {
    id: "robot3",
    name: "hardcoded3",
    isVisible: true,
    cooldown: 5,
    masterCooldown: 5,
    isOwn: true,
    hp: 100,
    ammo: 1,
    ammoCap: 1,
    isDead: false
  },
  {
    id: "robot4",
    name: "fatty cheeks",
    isVisible: false,
    cooldown: 4,
    masterCooldown: 4,
    isOwn: false,
    hp: 100,
    ammo: 3,
    ammoCap: 3,
    isDead: false
  },
  {
    id: "robot5",
    name: "thunder thighs",
    isVisible: false,
    cooldown: 3,
    masterCooldown: 3,
    isOwn: false,
    hp: 100,
    ammo: 2,
    ammoCap: 2,
    isDead: false
  }
];

let currentRobot = {
  id: "robot1"
};

// GENERATE BOARD AND BACKEND MATRIX
// one grid is 80 x 80 pixels
const gameColumns = 10;
const gameRows = 8;
let matrix = [];
let originalMatrix = [];
let color;

// do first row
const generateRow = (rowNumber) => {
  let isDark;
  // if row number is even start with light, else start with dark
  if (rowNumber % 2 === 0) {
    isDark = false;
  } else {
    isDark = true;
  }
  row = [];
  for (i=1; i<=gameColumns; i++) {
    let color = isDark ? "dark" : "light";
    let grid = $("<div></div>").attr('id', j + "-" + i).addClass(color).addClass("square").css("visibility", "hidden");
    isDark = !isDark;
    $("#checker-board").append(grid);

    // MATRIX
    row.push(null);
  }
  matrix.push(row.slice());
  originalMatrix.push(row.slice());
}

const generateBoard = () => {
  // loop rows
  for (j=1; j<=gameRows; j++){
    generateRow(j);
  }
}
generateBoard();

// MOVE LOGIC
// get coordinates for robot1 using parent id
const getPosition = (robot) => {
  let robotPosition = $("#" + robot).parent().attr("id");
  robotPosition = robotPosition.split("-");
  return robotPosition;
}

const retriveRobotPosition = (id) => {
  for (robotN=0; robotN < robotList.length; robotN++) {
    if (robotList[robotN].id === id) {
      return robotN;
    }
  }
}

// CHECK NEXT MOVE LOGIC
const checkMove = (nextRow, nextColumn) => {
  let row = nextRow - 1;
  let col = nextColumn - 1;
  try {
    if (matrix[row][col] === undefined || matrix[row][col] !== null) {
      console.log("move failed");
      return false;
    }
  }
  catch(error) {
    console.log("move failed");
    return false;
  }
  return true;
}

// update css visibility
const updateVisible = (row, column) => {
  $("#" + row + "-" + column).css("visibility", "visible");
  // update robots to isVisible
  let robotId = $("#" + row + "-" + column + "> .robot").attr( "id" );
  if(typeof robotId !== "undefined"){
    // console.log("not undefined", robotId);
    // loop through robotList and update
    for (botNumber = 0; botNumber < robotList.length; botNumber++) {
      if (robotList[botNumber].id === robotId && (!robotList[botNumber].isVisible)) {
        robotList[botNumber].isVisible = true;
        $("#attackbutton").prop('disabled', false);
        $("#box-" + robotList[botNumber].id).css("visibility", "visible");
        console.log(`Enemy ${robotList[botNumber].name} is now visible!`);
      }
    }
  }
}

// REMOVE FOG AROUND ROBOT
const removeFog = (rowPosition, columnPosition) => {
  for (k=-2; k<3; k++){
    // adjust rows
    for (l=-2; l<3; l++){
      // adjust columns
      row = rowPosition + k;
      column = columnPosition + l;
      updateVisible(row, column);
    }
  }
}

// random whole number function - between start and end range
const getNumber = (start, end) => {
  return (Math.floor(Math.random() * (end + 1 - start)) + start);
};

const test = () => {
  console.log("test");
}

// true for personal, false for enemy
const generateRobot = (name, id, isOwn=true) => {
  let colNumber = getNumber(1, 10);
  let rowNumber;
  // check if grid is taken
  if (isOwn) {
    rowNumber = 8;
    while (matrix[7][colNumber-1] !== null) {
      console.log("re-drawing");
      colNumber = getNumber(1, 10);
    }
    removeFog(rowNumber, colNumber);
  } else {
    rowNumber = getNumber(1, 4);
    while (matrix[rowNumber-1][colNumber-1] !== null) {
      console.log("re-drawing");
      colNumber = getNumber(1, 10);
      rowNumber = getNumber(1, 4);
    }
  }

  name = encodeURI(name);
  let robotObj = document.createElement('img');
  robotObj.id = id;
  robotObj.classList.add("robot");
  robotObj.setAttribute('src', `https://robohash.org/${name}?size=80x80`);
  $("#" + rowNumber + "-" + colNumber).append(robotObj);

  // update matrix
  matrix[rowNumber-1][colNumber-1] = id;
  console.log(`${id} generated`);

  // add empty player box
  let playerBox = document.createElement('div');
  playerBox.id = "box-" + id;
  // playerBox.classList.add("row");
  playerBox.classList.add("player-box");

  playerBox.style.opacity = 0.5;
  // hide box if robot is not own
  if (!isOwn) {
    playerBox.style.visibility = "hidden";
  }
  $("#player-box").append(playerBox);
}

const updateBoxes = () => {
  // update player box
  for (robotNumber = 0; robotNumber < robotList.length; robotNumber++){
    $("#box-"+robotList[robotNumber].id).html(`<p><b>${robotList[robotNumber].name}</b></p><p>Cooldown: ${robotList[robotNumber].cooldown}</p><p>HP: ${robotList[robotNumber].hp}</p><p>Ammo: ${robotList[robotNumber].ammo}</p>`);
  }
}


// BATTLE LOGIC
const getDistance = (attackerId, defenderId) => {
  let attacker = getPosition(attackerId);
  let defender = getPosition(defenderId);
  // console.log("attacker location", attacker);
  // console.log("defender location", defender);
  let height = Math.abs(parseInt(attacker[0]) - parseInt(defender[0]));
  let width = Math.abs(parseInt(attacker[1]) - parseInt(defender[1]));
  // console.log("height diff", height);
  // console.log("width diff", width);
  let maxDistance = Math.max(height, width);
  // console.log(maxDistance);
  return maxDistance;
}

const getAccuracy = (attackerId, defenderId) => {
  // 1 - 2 // 3 - 4 // 5 - 6 // 7 - 8 // 9
  let distance = getDistance(attackerId, defenderId);
  let distanceScore;
  // console.log("distance", distance);
  switch (true) {
    case 9:
      distanceScore = 30;
      break;
    case (distance >= 7):
      distanceScore = 45;
      break;
    case (distance >= 5):
      distanceScore = 60;
      break;
    case (distance >= 3):
      distanceScore = 80;
      break;
    default:
      distanceScore = 100;
  }
  console.log(distanceScore);
  // roll number between 0 to 30
  let randomNumber = getNumber(0 ,100);
  // console.log("random num", randomNumber);

  let accuracyScore = randomNumber * 0.3 + distanceScore * 0.7
  // console.log("accuracy score", accuracyScore);
  return accuracyScore;
}

const checkDead = (robotPosition) => {
  if (robotList[robotPosition].hp <= 0 && !robotList[robotPosition].isDead ) {
    console.log(`${robotList[robotPosition].id} is dead.`);
    robotList[robotPosition].isDead = true;
    robotList[robotPosition].hp = 0;

    // kill player-box (front-end)
    let id = robotList[robotPosition].id;
    $("#box-robot4").css('border', 0).css("cursor", "auto").css("opacity", 0.5);
    $("#box-robot5").css('border', 0).css("cursor", "auto").css("opacity", 0.5);
    $("#box-" + id).css("opacity", 0.1).css('border', 0);
    // need to improve
    $("#" + id).css("background", "rgba(255,0,0, 0.6)").css("opacity", 0.5);

    return true;
  } else {
    // let id = robotList[robotPosition].id;
    $("#box-robot4").css('border', 0).css("cursor", "auto").css("opacity", 0.5);
    $("#box-robot5").css('border', 0).css("cursor", "auto").css("opacity", 0.5);
    return false;
  }
}

const attack = (attacker, defender) => {

  attackPosition = retriveRobotPosition(attacker);
  // reload gun is ammo is empty
  if (robotList[attackPosition].ammo === 0) {
    console.log("reloading");
    robotList[attackPosition].ammo = robotList[attackPosition].ammoCap;
  } else {
    defendPosition = retriveRobotPosition(defender);
    // console.log(attackPosition, defendPosition);

    let accuracyScore = getAccuracy(attacker, defender);
    //  attack will miss if random is bigger than score
    let randomNumber = getNumber(10, 90);
    console.log("random", randomNumber);
    console.log("score", accuracyScore);

    if (accuracyScore < randomNumber) {
      console.log(`attack missed!`);
      robotList[attackPosition].ammo += -1;
      checkDead(defendPosition);
    } else if ((accuracyScore - randomNumber) > 50) {
      console.log('critical hit!');
      robotList[attackPosition].ammo += -1;
      let damage = getNumber(20, 40) * 2;
      robotList[defendPosition].hp += - damage;
      console.log("dmg", damage);
      checkDead(defendPosition);
    } else {
      console.log('hit!');
      robotList[attackPosition].ammo += -1;
      let damage = getNumber(20, 40);
      robotList[defendPosition].hp += - damage;
      console.log("dmg", damage);
      checkDead(defendPosition);
    }
  }
  updateBoxes();

}

//////////// CORE FUNCTION //////////
const getNextTurn = (forceSkip=false) => {
  console.log("forceskip: ", forceSkip);
  gameState = "live";
  console.log("game_state: ", gameState);
  while (gameState === "live") {
    // reduce cooldown for all visible robots
    for (robotNumber = 0; robotNumber < robotList.length; robotNumber++) {
      if (robotList[robotNumber].isVisible && !robotList[robotNumber].isDead) {
        if (robotList[robotNumber].cooldown > 0) {
          robotList[robotNumber].cooldown += -1;
        }
      }
    }

    for (robotNumber = 0; robotNumber < robotList.length; robotNumber++) {
      // pause game if cooldown is reached
      if (robotList[robotNumber].cooldown <= 0) {
        if (robotList[robotNumber].isOwn === true && !robotList[robotNumber].isDead){
          // player
          gameState = "pause";
          $("#turn-des").text(`${robotList[robotNumber].name}`);
          // console.log(robotList[0].cooldown);
          // console.log(robotList[1].cooldown);
          // console.log(robotList[2].cooldown);
          // toggle css back  for previous robot
          let prevousPosition = retriveRobotPosition(currentRobot.id );
          $("#box-" + robotList[prevousPosition].id).css("opacity", 0.5);
          $("#box-" + robotList[prevousPosition].id).css("background-color", "inherit");

          currentRobot.id = robotList[robotNumber].id;
          // light up color box for active player
          $("#box-" + robotList[robotNumber].id).css("background-color", "#d7ecd1");
          $("#box-" + robotList[robotNumber].id).css("opacity", 1.0);
          $("#avatar").attr("src", `https://robohash.org/${robotList[robotNumber].name}?size=100x100`);
          // robotObj.setAttribute('src', `https://robohash.org/${name}?size=80x80`);
          // reset cooldown
          robotList[robotNumber].cooldown = robotList[robotNumber].masterCooldown;
        }
        // stop loop to prevent dupliate resets
        break;
      }
    }
    // execute all non-player turns
    for (robotNumber = 0; robotNumber < robotList.length; robotNumber++) {
      if (robotList[robotNumber].isVisible && !robotList[robotNumber].isOwn && !robotList[robotNumber].isDead && robotList[robotNumber].cooldown <= 0) {
        robotList[robotNumber].cooldown = robotList[robotNumber].masterCooldown;
        console.log(`${robotList[robotNumber].name} just made a move!`);
        // roll random number
        let attackNumber = getNumber(0, 2);
        while (robotList[attackNumber].isDead === true) {
          attackNumber = getNumber(0, 2);
        }
        console.log(robotList[attackNumber].id);
        attack(robotList[robotNumber].id, robotList[attackNumber].id);
      }
    }
  }
}

for (robotNumber = 0; robotNumber < robotList.length; robotNumber++) {
  generateRobot(robotList[robotNumber].name, robotList[robotNumber].id, robotList[robotNumber].isOwn);
}

console.log(matrix);

// add event listener for keystrokes
$("body").keydown((e) => {
  if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
    // do nothing is modal is showing
    if(gameState === "pause"){
      // get Position of the current robot
      robotPosition = getPosition(currentRobot.id);
      console.log("original_position", robotPosition);
      currentRow = parseInt(robotPosition[0]);
      currentColumn = parseInt(robotPosition[1]);

      // up
      if (e.keyCode === 38) {
        let nextRow = currentRow - 1;
        if (checkMove(nextRow, currentColumn)) {
          // set matrix back to original value
          matrix[currentRow - 1][currentColumn - 1] = null;
          // update front end
          $("#" + nextRow + "-" + currentColumn).append($("#" +  currentRobot.id));
          // update matrix
          matrix[nextRow - 1][currentColumn - 1] = currentRobot.id;
          // update FOG
          removeFog(nextRow, currentColumn);
          // resume game

          getNextTurn();
          updateBoxes();
          gameState="live";
          $("#movebutton").prop('disabled', false);

        }
      }

      // right
      if (e.keyCode === 39) {
        let nextColumn = currentColumn + 1;
        if (checkMove(currentRow, nextColumn)) {
          // set matrix back to original value
          matrix[currentRow - 1][currentColumn - 1] = null;
          // update front end
          $("#" + currentRow + "-" + nextColumn).append($("#" + currentRobot.id));
          // update matrix
          matrix[currentRow - 1][nextColumn - 1] = currentRobot.id;
          // update FOG
          removeFog(currentRow, nextColumn);
          // resume game
          getNextTurn();
          updateBoxes();
          gameState="live";
          $("#movebutton").prop('disabled', false);
        }
      }

      // down
      if (e.keyCode === 40) {
        let nextRow = currentRow + 1;
        if (checkMove(nextRow, currentColumn)) {
          // set matrix back to original value
          matrix[currentRow - 1][currentColumn - 1] = null;
          // update front end
          $("#" + nextRow + "-" + currentColumn).append($("#" +  currentRobot.id));
          // update matrix
          matrix[nextRow - 1][currentColumn - 1] = currentRobot.id;
          // update FOG
          removeFog(nextRow, currentColumn);
          // resume game
          getNextTurn();
          updateBoxes();
          gameState="live";
          $("#movebutton").prop('disabled', false);
        }
      }

      // left
      if (e.keyCode === 37) {
        let nextColumn = currentColumn - 1;
        if (checkMove(currentRow, nextColumn)) {
          // set matrix back to original value
          matrix[currentRow - 1][currentColumn - 1] = null;
          // update front end
          $("#" + currentRow + "-" + nextColumn).append($("#" + currentRobot.id));
          // update matrix
          matrix[currentRow - 1][nextColumn - 1] = currentRobot.id;
          // update FOG
          removeFog(currentRow, nextColumn);
          // resume game
          getNextTurn();
          updateBoxes();
          gameState="live";
          $("#movebutton").prop('disabled', false);
        }
      }

      robotPosition = getPosition(currentRobot.id);
      console.log("new_position", robotPosition);
    }
  }
});

// add event listners for buttons
$("#skipbutton").click(() => {
  // gameState = "pause";
  console.log("skip button clicked");
  getNextTurn();
  updateBoxes();
  gameState="live";
  $("#movebutton").prop('disabled', false);
});

$("#attackbutton").click(() => {
  gameState = "pause";
  console.log("attack clicked");
  // make visible enemies clickable
  selectEnemy = true;
  // turn on border for selectable enemies
  if (!robotList[3].isDead && robotList[3].isVisible) {
    $("#box-robot4").css('border', "2px solid red").css("border-radius", "8px").css("cursor", "pointer").css("opacity", 0.8);
  }
  if (!robotList[4].isDead && robotList[4].isVisible) {
    $("#box-robot5").css('border', "2px solid red").css("border-radius", "8px").css("cursor", "pointer").css("opacity", 0.8);
  }
  $("#attackbutton").prop('disabled', false);
});

$("#movebutton").click(() => {
  gameState = "pause";
  console.log("move clicked");
  $("#movebutton").prop('disabled', true);
});

$("#box-robot4").click(() => {
  if (selectEnemy) {
    selectEnemy = false;
    // console.log(`${currentRobot.id} attacked robot4.`);
    attack(currentRobot.id, "robot4");
    getNextTurn();
  }
});

$("#box-robot5").click(() => {
  if (selectEnemy) {
    selectEnemy = false;
  // console.log(`${currentRobot.id} attacked robot5.`);
  attack(currentRobot.id, "robot5");
  getNextTurn();
}
});

// shortcut keys
$("body").keydown((e) => {
  if (e.keyCode === 65) {
    if(!($("#attackbutton").prop('disabled'))) {
      $("#attackbutton").click();
    }
  } else if (e.keyCode === 77) {
    if(!($("#movebutton").prop('disabled'))) {
      $("#movebutton").click();
    }
  } else if (e.keyCode === 83) {
    if(!($("#skipbutton").prop('disabled'))) {
      $("#skipbutton").click();
    }
  }
});

// manually initate first turn
getNextTurn();
updateBoxes();
gameState = "live";


// getAccuracy("robot1", "robot4");

// attack("robot1", "robot4");

// progress.css('width', '75%').attr('aria-valuenow', 75);

// console.log(progress);

/*
// game bar
let repeat = setInterval(function(){
// console.log("hi");
number.text(counter);

// change directin if number is 0 or 100
if (counter === 100) {
direction = false;
} else if (counter === 0) {
direction = true;
}
if (direction){
counter += 1;
} else {
counter += -1;
}
}, 10);


// progress bar
let progressBar = setInterval(function(){
// update progress bar
progress.css('width', progressCounter + '%').attr('aria-valuenow', progressCounter);

// change directin if number is 0 or 100
if (progressCounter === 100) {
progressDirection = false;
} else if (progressCounter === 0) {
progressDirection = true;
}
if (progressDirection){
progressCounter += 1;
} else {
progressCounter += -1;
}
}, 150);


// onclick listner
$("#stop").click(function(){
clearTimeout(repeat);
clearTimeout(progressBar);
});

*/
