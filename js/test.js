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
let gameWin = false;
let gameLose = false;
let modalQueue = [];
let robotList = [
  {
    id: "robot1",
    name: "hardcoded1",
    isVisible: true,
    cooldown: 6,
    masterCooldown: 6,
    isOwn: true,
    hp: 100,
    ammo: 3,
    ammoCap: 3,
    isDead: false,
    class: "scout"
  },
  {
    id: "robot2",
    name: "hardcoded2",
    isVisible: true,
    cooldown: 8,
    masterCooldown: 8,
    isOwn: true,
    hp: 100,
    ammo: 2,
    ammoCap: 3,
    isDead: false,
    class: "riflebot"
  },
  {
    id: "robot3",
    name: "hardcoded3",
    isVisible: true,
    cooldown: 10,
    masterCooldown: 10,
    isOwn: true,
    hp: 100,
    ammo: 1,
    ammoCap: 1,
    isDead: false,
    class: "sniper"
  },
  {
    id: "robot4",
    name: "fatty cheeks",
    isVisible: false,
    cooldown: 8,
    masterCooldown: 8,
    isOwn: false,
    hp: 100,
    ammo: 3,
    ammoCap: 3,
    isDead: false,
    class: "advanced riflebot"
  },
  {
    id: "robot5",
    name: "thunder thighs",
    isVisible: false,
    cooldown: 7,
    masterCooldown: 7,
    isOwn: false,
    hp: 100,
    ammo: 2,
    ammoCap: 2,
    isDead: false,
    class: "advanced riflebot"
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
    let grid = $("<div></div>").attr('id', j + "-" + i).addClass(color).addClass("square").css("position", "relative");
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
        $("#box-" + robotList[botNumber].id).show(1000);
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
  if (!isOwn) {
    $("#player-box").append(
      $('<div></div>').attr("id", "box-" + id).addClass("player-box").css("opacity", 0.5).hide()
    );
    // add evil background color
    $("#" + rowNumber + "-" + colNumber).css("background-color","#44023f");
  } else {
    $("#player-box").append(
      $('<div></div>').attr("id", "box-" + id).addClass("player-box").css("opacity", 0.5)
    )
  }
}

const modalMessage = (title, message) => {
  $("#battleText1").text(message);
  $("#battleText2").text(title);
  $("#battleModal").modal("show");
}


const imgInsert = (amount) => {
  let html = "";
  for (i=0; i < amount; i++){
    html += `<img class="zap" width="8px" src="img/zap.svg"></img>`;
  }
  return html;
}

const updateBoxes = () => {
  // update player box
  for (robotNumber = 0; robotNumber < robotList.length; robotNumber++){
    let amount = robotList[robotNumber].ammo;
    $("#box-"+robotList[robotNumber].id).html(`<div class="row"><div class="col-12 flex"><div><b>${robotList[robotNumber].name}</b></div><div><sup>${robotList[robotNumber].class}</sup></div></div></div>

      <div class="row attr-font"><div class="col-3">HP
    </div><div class="col-9"><div class="progress" style="height: 0.5rem;">
  <div id="${robotList[robotNumber].id}-health" class="progress-bar bg-danger" role="progressbar" style="width: ${robotList[robotNumber].hp}%"></div>
</div></div></div>

<div class="row attr-font"><div class="col-3">Cooldown</div><div class="col-9">
<div class="progress" style="height: 0.5rem; width: ${robotList[robotNumber].masterCooldown * 10}%">
<div id="${robotList[robotNumber].id}-cooldown" class="progress-bar" role="progressbar" style="width: ${robotList[robotNumber].cooldown * 10}%"></div>
</div></div></div>

<div class="row attr-font"><div class="col-3">Ammo</div><div class="col-9">${imgInsert(amount)}</div></div>`);
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
  // check char class to modify grading bands
  // riflebot 0 // advanced riflebot +1 // sniper +2 // scout -1
  let distanceMod = 0;
  let charClass = robotList[retriveRobotPosition(attackerId)].class;
  if (charClass === "advanced riflebot") {
    distanceMod = 1;
  } else if (charClass === "sniper") {
    distanceMod = 2;
  } else if (charClass === "scout") {
    distanceMod = -1;
  }
  switch (true) {
    case (distance >= 9 + distanceMod):
      distanceScore = 30;
      break;
    case (distance >= 7 + distanceMod):
      distanceScore = 45;
      break;
    case (distance >= 5 + distanceMod):
      distanceScore = 60;
      break;
    case (distance >= 3 + distanceMod):
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
    $("#box-robot4").css('background-color', "inherit").css("cursor", "auto").css("opacity", 0.5).off( "mouseenter mouseleave" );;
    $("#box-robot5").css('background-color', "inherit").css("cursor", "auto").css("opacity", 0.5);
    $("#box-" + id).css("opacity", 0.1).off( "mouseenter mouseleave" );;
    // need to improve
    $("#" + id).css("background", "rgba(255,0,0, 0.6)").css("opacity", 0.5);

    return true;
  } else {
    // let id = robotList[robotPosition].id;
    $("#box-robot4").css('background-color', "inherit").css("cursor", "auto").css("opacity", 0.5).off( "mouseenter mouseleave" );;
    $("#box-robot5").css('background-color', "inherit").css("cursor", "auto").css("opacity", 0.5).off( "mouseenter mouseleave" );;
    return false;
  }
}

const attack = (attacker, defender) => {
  let action;
  let message;
  let damage;
  attackPosition = retriveRobotPosition(attacker);
  // reload gun is ammo is empty
  if (robotList[attackPosition].ammo === 0) {
    console.log("reloading");
    action = `${robotList[attackPosition].name} is out of bullets.`;
    message = "Reloading..";
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
      damage = 0;
      message = 'Attack missed';
      robotList[attackPosition].ammo += -1;
      checkDead(defendPosition);
    } else if ((accuracyScore - randomNumber) > 50) {
      console.log('critical hit!');
      action = `${robotList[defendPosition].name} is unscathed.`;
      message = 'Critical hit!';
      robotList[attackPosition].ammo += -1;
      damage = getNumber(20, 40) * 2;
      robotList[defendPosition].hp += - damage;
      console.log("dmg", damage);
      checkDead(defendPosition);
    } else {
      console.log('hit!');
      action = `${robotList[defendPosition].name} is unscathed.`;
      message = 'Hit!';
      robotList[attackPosition].ammo += -1;
      damage = getNumber(20, 40);
      robotList[defendPosition].hp += - damage;
      console.log("dmg", damage);
      checkDead(defendPosition);
    }
    action = `${robotList[attackPosition].name} dealt ${damage} damage to ${robotList[defendPosition].name}`;

  }
  modalQueue.push([message, action]);
  // $("#battleText1").text(action);
  // $("#battleText2").text(message);
  // $("#battleModal").modal("show");
  updateBoxes();

}

//////////// CORE FUNCTION //////////
const getNextTurn = () => {
  if (modalQueue.length > 0) {
    modalMessage(modalQueue[0][0], modalQueue[0][1]);
  }
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

    // execute all non-player turns
    for (robotNumber = 0; robotNumber < robotList.length; robotNumber++) {
      if (robotList[robotNumber].isVisible && !robotList[robotNumber].isOwn && !robotList[robotNumber].isDead && robotList[robotNumber].cooldown <= 0) {
        robotList[robotNumber].cooldown = robotList[robotNumber].masterCooldown;
        console.log(`${robotList[robotNumber].name} just made a move!`);
        // roll random number
        let attackNumber = getNumber(0, 2);
        while (robotList[attackNumber].isDead === true) {
          attackNumber = getNumber(0, 2);
          console.log("attack number", attackNumber);
        }
        console.log(robotList[attackNumber].id);
        attack(robotList[robotNumber].id, robotList[attackNumber].id);
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
      // check for end game
      let ownDeadCount = 0;
      let enemyDeadCount = 0;
      for (robotNumber = 0; robotNumber < robotList.length; robotNumber++) {
        if (robotList[robotNumber].isDead) {
          if (robotList[robotNumber].isOwn) {
            ownDeadCount += 1;
          } else {
            enemyDeadCount +=1;
          }
        }
      }
      if (ownDeadCount >= 3) {
        gameState = "pause";
        console.log("game over. you lost");
        // $("#battleText1").text("You lost!");
        // $("#battleText2").text("GAME OVER");
        // $("#battleModal").modal("show");
        modalQueue.push(["GAME OVER", "You lost!"]);
      } else if (enemyDeadCount >= 2) {
        gameState = "pause";
        console.log("game over. you won");
        // $("#battleText1").text("You won!");
        // $("#battleText2").text("GAME OVER");
        // $("#battleModal").modal("show");
        modalQueue.push(["GAME OVER", "You won!"]);
      }
  }
}

// show Modal
$("#mainModal").modal("toggle");

$('#mainModal').on('hidden.bs.modal', function (e) {
  // e.preventDefault();
  console.log($("#user1input").val());
  if ($("#user1input").val() !== undefined) {
    robotList[0].name = $("#user1input").val();
  }
  if ($("#user2input").val() !== undefined) {
    robotList[1].name = $("#user2input").val();
  }
  if ($("#user3input").val() !== undefined) {
    robotList[2].name = $("#user3input").val();
  }
  // console.log($("#user1input").value);
  // console.log($("#user2input").value);
  // console.log($("#user3input").value);
  generateBoard();

  var numberOfBlades = 80;
  var grass = document.getElementsByClassName('grass')[0];

  function assignRandomStyles(blade) {
    var randomHeight =  Math.floor(Math.random() * 40);
    var randomLeft = Math.floor(Math.random() * (80));
    var randomRotation = Math.floor(Math.random() * 10) - 5;
    blade.style.height = (randomHeight + 40) + 'px';
    blade.style.zIndex = randomHeight;
    blade.style.opacity = randomHeight * 0.02;
    blade.style.left = randomLeft + 'px';
    blade.style.transform = 'rotate(' + randomRotation + 'deg)';
  }

  for (var i = 0; i < numberOfBlades; i++) {
    var blade = document.createElement('div');
    assignRandomStyles(blade);
    $("#7-1").append(blade);
    // grass.appendChild(blade);
  }


  for (robotNumber = 0; robotNumber < robotList.length; robotNumber++) {
    generateRobot(robotList[robotNumber].name, robotList[robotNumber].id, robotList[robotNumber].isOwn);
  }

  console.log(matrix);
});
