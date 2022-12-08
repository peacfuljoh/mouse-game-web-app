/* Main functionality for mouse game */

// elements
const MOUSE_ICON = document.getElementById('mouse-icon');
const OBJECTS_DIV = document.getElementById('objects-div');
const PLAY_GRID = document.getElementById('play-grid');
const OVERLAY_DIV = document.getElementById('overlay');
const LEVEL_P = document.getElementById('level');

// game state
let mouseInfo, objectsInfo;
let timerClock, timeRemain;
let LVL; // current level
let trapped = setInterval(isMouseDead, 10);
let catMove = {}; // intervals for cat movement
let denSpawn = {}; // intervals for den spawn activity
let GAME_OVER = true;
let LOCKS = {lvlEnd: false, lvlStarted: false};
let levelStartTimeout; // ensures fresh new-level overlay on level change

let HIGH_SCORE = 0;
let levelScores = {};
let currentLevelScore = 0;

let meowLock = {}; // ensures a single cat's meows can't pile up






/* CLASSES */
class Mouse {
    constructor(blockBinMask=null, vpos=0, hpos=0) {
        this.pos = [vpos, hpos];
        if (blockBinMask != null) {
            for (let i = 0; i < GRIDSIZE[0]; i++) {
                let j = blockBinMask[i].indexOf("M");
                if (j != -1) {
                    this.pos = [i, j];
                    break;
                }
            }
        }
        this.dir = 0;
        this.updateIcon();
        this.isAlive = true;
    }
    move(dir_) {
        if (!this.isAlive || !LOCKS["lvlStarted"]) {
            return;
        }

        let next_pos;
        let onEdge = false; // trying to move across grid boundary

        // infer movement direction and next position
        switch(dir_) {
            case "up": {
                this.dir = 0;
                if (this.pos[0] == 0) {
                    onEdge = true;
                }
                next_pos = [this.pos[0] - 1, this.pos[1]];
                break;
            }
            case "right": {
                this.dir = 1;
                if (this.pos[1] == GRIDSIZE[1] - 1) {
                    onEdge = true;
                }
                next_pos = [this.pos[0], this.pos[1] + 1];
                break;
            }
            case "down": {
                this.dir = 2;
                if (this.pos[0] == GRIDSIZE[0] - 1) {
                    onEdge = true;
                }
                next_pos = [this.pos[0] + 1, this.pos[1]];
                break;
            }
            case "left": {
                this.dir = 3;
                if (this.pos[1] == 0) {
                    onEdge = true;
                }
                next_pos = [this.pos[0], this.pos[1] - 1];
                break;
            }
            default:
                return;
        }

        // if not boundary-constrained, check if move is possible
        if (!onEdge) {
            if (objectsInfo.hasEmpty(next_pos) || objectsInfo.hasCat(next_pos)) {
                this.pos = next_pos;
            }
            else if (objectsInfo.hasCheese(next_pos)) {
                update_score(VAL_CHEESE);
                objectsInfo.remove(next_pos);
                this.pos = next_pos;
            }
            else if (objectsInfo.canPush(next_pos, dir_)) { // blocks in the way, but pushable
                objectsInfo.pushObjects(next_pos, dir_);
                this.pos = next_pos;
            }
            // otherwise, unpushable block stack
        }

        // update icon
        this.updateIcon();
        if (!GAME_OVER && !objectsInfo.anyEdibleRemaining()) {
            go_to_level(LVL + 1);
        }
    }
    updateIcon() {
        MOUSE_ICON.src = ASSET_PATH_MOUSE;
        MOUSE_ICON.style.transform = 'rotate(' + (90 * this.dir).toString() + 'deg)'
        MOUSE_ICON.style.top = (MOUSE_PX_TOP0 + this.pos[0] * MOUSE_PX_PER_CELL).toString() + 'px';
        MOUSE_ICON.style.left = (MOUSE_PX_LEFT0 + this.pos[1] * MOUSE_PX_PER_CELL).toString() + 'px';
    }
}


class Objects {
    constructor(lvl_layout) {
        // init object id's
        this.n_block = ID_RANGE_BLOCK[0]; // 1 through 400
        this.n_cheese = ID_RANGE_CHEESE[0]; // 401 through 450
        this.n_cat = ID_RANGE_CAT[0]; // 451 through 500
        this.n_block_fixed = ID_RANGE_BLOCK_FIXED[0]; // 501 through 900
        this.n_den = ID_RANGE_DEN[0]; // 901 through 1000

        // init cat info
        this.catInfo = {}; // pos, type, params
        this.catsActive = false;
        this.denInfo = {}; // pos, type, params
        this.denActive = false;

        // init block mask
        this.objMask = [];
        this.initObjMask(lvl_layout);
    }
    initObjMask(lvl_layout) {
        let n_empty = 0; // empty cells
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            this.objMask.push([]);
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                switch(lvl_layout[i][j]) {
                    case SYMBOL_BLOCK: {
                        this.objMask[i].push(this.n_block);
                        this.n_block += 1;
                        break;
                    }
                    case SYMBOL_BLOCK_FIXED: {
                        this.objMask[i].push(this.n_block_fixed);
                        this.n_block_fixed += 1;
                        break;
                    }
                    case SYMBOL_CHEESE: {
                        this.objMask[i].push(this.n_cheese);
                        this.n_cheese += 1;
                        break;
                    }
                    case SYMBOL_CAT: {
                        this.objMask[i].push(null);
                        this.addCat([i, j], CAT_TYPES[LVL][this.n_cat], CAT_PARAMS[LVL][this.n_cat]);
                        break;
                    }
                    case SYMBOL_DEN: {
                        this.objMask[i].push(this.n_den);
                        this.denInfo[this.n_den] = {
                            "pos": [i, j],
                            "type": DEN_TYPES[LVL][this.n_den],
                            "params": DEN_PARAMS[LVL][this.n_den]
                        };
                        this.n_den += 1;
                        break;
                    }
                    default: {
                        this.objMask[i].push(n_empty);
                    }
                }
            }
        }
    }
    addCat(pos, catType, catParams) {
        this.objMask[pos[0]][pos[1]] = this.n_cat;
        this.catInfo[this.n_cat] = {
            "pos": pos,
            "type": catType,
            "params": catParams
        };
        this.n_cat += 1;
        return this.n_cat - 1; // index of cat just created
    }
    draw() {
        let n;
        let text = '';
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                n = this.objMask[i][j];
                if (n != 0) {
                    text += this.addObjectText(i, j, getObjectTypeFromId(n),
                        getCatType(n), getDenType(n));
                }
            }
        }
        OBJECTS_DIV.innerHTML = text;
    }
    drawNewCat(n) {
        let [i, j] = this.catInfo[n].pos;
        OBJECTS_DIV.innerHTML += this.addObjectText(i, j, getObjectTypeFromId(n), getCatType(n), getDenType(n));
    }
    addObjectText(i, j, type, catType, denType) {
        let top = BLOCK_PX_TOP0 + i * BLOCK_PX_PER_CELL;
        let left = BLOCK_PX_LEFT0 + j * BLOCK_PX_PER_CELL;
        if (type == "cheese") { top += 2; }
        let n = this.objMask[i][j];

        let text = '';
        text += '<img id="object' + n.toString() + '" src=';
        text += '"' + this.getObjectAssetPath(type, catType, denType) + '"';
        text += ' style="';
        text += ' top:' + top.toString() + 'px;';
        text += ' left:' + left.toString() + 'px;';
        text += ' position:absolute;';
        text += ' border-radius:20%;';
        text += ' height:' + this.getObjectTextHeight(type, catType) + ';';
        text += ' z-order:5;'
        text += '"';
        text += '>';
        text += '\n';

        return text;
    }
    getObjectAssetPath(type, catType, denType) {
        switch(type) {
            case "block":
                return ASSET_PATH_BLOCK;
            case "blockFixed":
                return ASSET_PATH_BLOCK_FIXED;
            case "cheese":
                return ASSET_PATH_CHEESE;
            case "cat": {
                switch(catType) {
                    case "basic":
                    case "basicFast":
                        return ASSET_PATH_CAT_BASIC;
                    case 'pathFinding':
                        return ASSET_PATH_CAT_PATH_FINDING;
                    case "evasive":
                        return ASSET_PATH_CAT_EVASIVE;
                    case "strong":
                        return ASSET_PATH_CAT_STRONG;
                }
            }
            case "den": {
                return ASSET_PATH_DEN;
            }
        }
    }
    getObjectTextHeight(type, catType) {
        switch(type) {
            case "block":
            case "blockFixed":
                return '26px';
            case "cheese":
                return '18px';
            case "den":
            case "cat": {
                return '24px';
            }
        }
    }
    startActivity() {
        this.catsActive = true;
        this.densActive = true;
        Object.keys(this.catInfo).forEach(n => catMoveFunc(n));
        Object.keys(this.denInfo).forEach(n => setDenSpawn(n));
    }
    stopActivity() {
        this.catsActive = false;
        this.densActive = false;
        Object.keys(this.catInfo).forEach(n => clearCatMove(n));
        Object.keys(this.denInfo).forEach(n => clearDenSpawn(n));
    }
    

    // status check methods
    hasEmpty(pos) {
        return this.objMask[pos[0]][pos[1]] == 0;
    }
    hasFixedBlock(pos) {
        return isFixedBlock(this.objMask[pos[0]][pos[1]]);
    }
    hasBlock(pos) {
        return isBlock(this.objMask[pos[0]][pos[1]]);
    }
    hasCheese(pos) {
        return isCheese(this.objMask[pos[0]][pos[1]]);
    }
    hasCat(pos) {
        return isCat(this.objMask[pos[0]][pos[1]]);
    }
    canPush(next_pos, dir_) {
        let canPush_ = false;
        let i = next_pos[0];
        let j = next_pos[1];
        let increment;
        switch(dir_) {
            case "up": {
                increment = function() { i--; };
                break;
            }
            case "right": {
                increment = function() { j++; };
                break;
            }
            case "down": {
                increment = function() { i++; };
                break;
            }
            case "left": {
                increment = function() { j--; };
                break;
            }
        }
        while (!canPush_ &&
                (i >= 0 && i <= GRIDSIZE[0] - 1 && j >= 0 && j <= GRIDSIZE[1] - 1) &&
                !this.hasFixedBlock([i, j])) {
            canPush_ ||= (this.hasEmpty([i, j]) || this.hasCheese([i, j]));
            increment();
        }

        return canPush_;
    }
    anyEdibleRemaining(onlyCheese=false) {
        let func = (onlyCheese) ? isCheese : isEdible;
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                if (func(this.objMask[i][j])) {
                    return true;
                }
            }
        }
        return false;
    }
    freeCellsAround(pos) {
        let freePos = [];
        for (let i = Math.max(0, pos[0] - 1); i <= Math.min(GRIDSIZE[0] - 1, pos[0] + 1); i++) {
            for (let j = Math.max(0, pos[1] - 1); j <= Math.min(GRIDSIZE[1] - 1, pos[1] + 1); j++) {
                if (!this.objMask[i][j]) {
                    freePos.push([i, j]);
                }
            }
        }
        return freePos;
    }

    // action methods
    pushObjects(next_pos, dir_) {
        let increment, cond, i_inc, j_inc;
        let i = next_pos[0];
        let j = next_pos[1];

        // select controls based on push direction
        switch(dir_) {
            case "up": {
                increment = function(x) { !x ? i-- : i++ };
                i_inc = 1;
                j_inc = 0;
                cond = function() { return i != next_pos[0] };
                break;
            }
            case "right": {
                increment = function(x) { !x ? j++ : j-- };
                i_inc = 0;
                j_inc = -1;
                cond = function() { return j != next_pos[1] };
                break;
            }
            case "down": {
                increment = function(x) { !x ? i++ : i-- };
                i_inc = -1;
                j_inc = 0;
                cond = function() { return i != next_pos[0] };
                break;
            }
            case "left": {
                increment = function(x) { !x ? j-- : j++ };
                i_inc = 0;
                j_inc = 1;
                cond = function() { return j != next_pos[1] };
                break;
            }
        }

        // search for the furthest-away block in the stack
        do {
            if (this.hasEmpty([i, j]) || this.hasCheese([i, j])) { break; }
            increment(0);
        } while (i >= 0 && i <= GRIDSIZE[0] - 1 && j >= 0 && j <= GRIDSIZE[1] - 1);

        // handle cheese getting crushed
        if (this.hasCheese([i, j])) {
            this.objMask[i][j] = 0;
            this.draw();
        }

        // move blocks away in reverse distance-from-mouse order
        while (cond()) {
            this.move(i + i_inc, j + j_inc, i, j)
            increment(1);
        }
    }
    move(i_start, j_start, i_end, j_end) {
        // get object id and html element
        let n, elem;
        n = this.objMask[i_start][j_start];
        elem = document.getElementById("object" + n.toString());

        // update element
        elem.style.top = (BLOCK_PX_TOP0 + i_end * BLOCK_PX_PER_CELL).toString() + 'px';
        elem.style.left = (BLOCK_PX_LEFT0 + j_end * BLOCK_PX_PER_CELL).toString() + 'px';

        // update mask
        this.objMask[i_end][j_end] = n;
        this.objMask[i_start][j_start] = 0;

        // if cat, update its pos array
        if (isCat(n)) { this.catInfo[n]["pos"] = [i_end, j_end]; }
    }
    remove(pos) {
        this.objMask[pos[0]][pos[1]] = 0;
        this.draw();
    }
    turnCatIntoCheese(n) {
        // get info
        let elem = document.getElementById("object" + n.toString());
        let pos = this.catInfo[n]["pos"];
        let n_new = this.n_cheese;
        this.n_cheese += 1;

        // update image
        elem.src = ASSET_PATH_CHEESE;
        elem.style.height = this.getObjectTextHeight("cheese");

        // update other info
        elem.id = "object" + n_new.toString();
        this.objMask[pos[0]][pos[1]] = n_new;

        // remove cat pos
        delete this.catInfo[n];
    }
}



/* USER INPUT */
document.onkeypress = function(e) {
    switch (e.key) {
        case "w": mouseInfo.move("up"); break;
        case "d": mouseInfo.move("right"); break;
        case "s": mouseInfo.move("down"); break;
        case "a": mouseInfo.move("left"); break;
        case "=": // go up a level
            timeRemain = 0;
            currentLevelScore = 0;
            LOCKS["lvlEnd"] = false;
            go_to_level(Math.min(MAX_LVL, LVL + 1));
            break;
        case "-": // go down a level
            timeRemain = 0;
            currentLevelScore = 0;
            LOCKS["lvlEnd"] = false;
            go_to_level(Math.max(0, LVL - 1));
            break;
        case "r": //  restart current level
            timeRemain = 0;
            currentLevelScore = 0;
            LOCKS["lvlEnd"] = false;
            go_to_level(LVL);
            break;
        case "l": // release level end lock
            if (LOCKS["lvlEnd"]) { LOCKS["lvlEnd"] = false; }
            break;
        case "p": // toggle cats freeze
            if (objectsInfo.catsActive) { objectsInfo.stopActivity();  }
            else                        { objectsInfo.startActivity(); }
            break;
    }
}




/* GAME OVER, NEW GAME, LEVEL CHANGE */
function new_game() {
    reset_overlay();
    timeRemain = 0;
    currentLevelScore = 0;
    resetLevelScores();
    update_score();
    LOCKS["lvlEnd"] = false;
    go_to_level(INIT_LVL);
}

function reset_overlay() {
    OVERLAY_DIV.innerHTML = "";
    OVERLAY_DIV.style.padding = "";
}

function resetLevelScores() {
    for (let i = 0; i <= MAX_LVL; i++) {
        levelScores[i] = 0;
    }
}

function game_over(outcome) { // "eaten", "time", "win", "crush"
    GAME_OVER = true;

    // stop timer
    clearInterval(timerClock);

    // update mouse info
    if (outcome != "win") {
        mouseInfo.isAlive = false;
        mouseInfo.pos = [-100, -100];
        MOUSE_ICON.src = "";
    }

    // save high score
    currentLevelScore = 0;
    HIGH_SCORE = Math.max(HIGH_SCORE, getScore());

    // show overlay
    show_game_over_overlay(outcome)
}

function show_game_over_overlay(outcome) {
    OVERLAY_DIV.innerHTML = game_over_text(outcome);
    OVERLAY_DIV.style.padding = "30px 50px";
    if (outcome == "win") {
        OVERLAY_DIV.style.top = "160px";
        OVERLAY_DIV.style.left = "125px";
    }
    else {
        OVERLAY_DIV.style.top = "160px";
        OVERLAY_DIV.style.left = "170px";
    }
    OVERLAY_DIV.style.backgroundColor = "rgba(217, 245, 255, 0.9)";
}

function game_over_text(outcome) {
    centerStyle = 'text-align:center; ';

    let score_ = getScore();
    let scoreColorStyle = '';
    if (score_ == HIGH_SCORE) { scoreColorStyle = "color:green; " }

    let endGameMsg, gameOverMsg;
    if (outcome == "win") {
        gameOverMsg = 'CONGRATULATIONS'
        endGameMsg = 'You ate all of the cheese!';
    }
    else {
        gameOverMsg = 'GAME OVER';
        if (outcome == "timeout") { endGameMsg = 'You ran out of time!'; }
        if (outcome == "eaten")   { endGameMsg = 'You have been eaten.'; }
        if (outcome == "crush")   { endGameMsg = 'You have been crushed.'; }
    }

    text = '';
    text += '<h2 style="' + centerStyle + 'font-weight:bold">' + gameOverMsg + '</h2>';
    text += '<h3 style="' + centerStyle + '">' + endGameMsg + '</h3>';
    text += '<h4 style="' + centerStyle + scoreColorStyle + '">Final Score: ' + score_ + '</h4>';
    text += '<h4 style="' + centerStyle + scoreColorStyle + '">High score: ' + HIGH_SCORE + '</h4>';
    return text;
}

function go_to_level(lvl) {
    GAME_OVER = false;

    // set level not started flag
    LOCKS["lvlStarted"] = false;

    // freeze cats
    clearCatMove();

    // update score
    add_time_to_score();
    if (LVL != undefined) { levelScores[LVL] = Math.max(levelScores[LVL], currentLevelScore); }
    update_score();

    // determine level
    if (lvl <= MAX_LVL) { // next level
        LVL = lvl;
    }
    else { // game finish
        game_over("win");
        return;
    }

    // freeze timer
    if (timerClock != undefined) { clearInterval(timerClock); }

    // hold on level end
    if (LOCKS["lvlEnd"]) {
        show_level_complete_overlay();
        sleepLock(LOCKS, "lvlEnd", go_to_level_finish);
    }
    else { go_to_level_finish(); }
}

function go_to_level_finish() {
    // continue level refresh
    delete mouseInfo;
    delete objectsInfo;
//    PLAY_GRID.src = "";

    // reset play objects
    PLAY_GRID.src = ASSET_PATH_GRID;
    let board = BLOCK_BIN_MASK[LVL];
    mouseInfo = new Mouse(board);
    objectsInfo = new Objects(board);
    objectsInfo.draw();
    show_next_level_overlay();

    // update game info
    LEVEL_P.innerHTML = "Level " + (LVL + 1);

    // reset timer
    timeRemain = TIME_REMAIN_ALL[LVL] + 1;
    update_timer();

    // update score
    currentLevelScore = 0;
    update_score();

    // hold on level start
    if (levelStartTimeout != undefined) { clearTimeout(levelStartTimeout); }
    levelStartTimeout = setTimeout(function() {
        OVERLAY_DIV.innerHTML = '';
        OVERLAY_DIV.style.padding = '';
        go_to_level_start();
    }, 2000);
}

function go_to_level_start() {
    // let cats go
    objectsInfo.startActivity();

    // start timer
    timerClock = setInterval(update_timer, 1000);

    // reset level score
    currentLevelScore = 0;

    // reset locks
    LOCKS["lvlEnd"] = true;
    LOCKS["lvlStarted"] = true;
}

function show_level_complete_overlay() {
    text = '';
    text += '<h1>Level ' + LVL + ' Complete</h1>';
    text += '<p>Press L to continue.</p>';

    OVERLAY_DIV.innerHTML = text;
    OVERLAY_DIV.style.padding = "30px 50px";
    OVERLAY_DIV.style.top = "100px";
    OVERLAY_DIV.style.left = "140px";
    OVERLAY_DIV.style.backgroundColor = "rgba(217, 245, 255, 0.9)";
}

function show_next_level_overlay() {
    text = '';
    text += '<h1>Level ' + (LVL + 1) + '</h1>';
    text += '<p></p>';

    OVERLAY_DIV.innerHTML = text;
    OVERLAY_DIV.style.padding = "30px 50px";
    OVERLAY_DIV.style.top = "100px";
    OVERLAY_DIV.style.left = "210px";
    OVERLAY_DIV.style.backgroundColor = "rgba(217, 245, 255, 0.9)";
}



/* TIMER, SCORE */
function update_timer() {
    let elemTimer = document.getElementById("timer");

    // reset if timer ran out
    if (timeRemain == 0) {
        if (HARD_MODE || objectsInfo.anyEdibleRemaining(true)) { game_over("timeout"); }
        else                                                   { go_to_level(LVL + 1); }
        return;
    }

    // decrement timer
    timeRemain -= 1;

    // update text
    let min = Math.floor(timeRemain / 60);
    let sec = (timeRemain - min * 60);
    let text = min.toString() + ":";
    if (sec < 10) { text += "0"; }
    text += sec.toString();
    elemTimer.innerHTML = text;

    // update color
    if      (timeRemain > 30) { elemTimer.style.color = "black"; }
    else if (timeRemain > 10) { elemTimer.style.color = "#cc9900"; }
    else                      { elemTimer.style.color = "red"; }
}

function add_time_to_score() {
    update_score(Math.floor(timeRemain * timeToScoreFactor));
}

function update_score(incr=0) {
    currentLevelScore += incr;
    document.getElementById("score").innerHTML =
        "Score: " + getScore() + ' (' + currentLevelScore + '/' +
        ((LVL != undefined) ? levelScores[LVL] : 0) + ')';
}

function getScore() {
    if (LVL == undefined) { return 0; }
    return Object.entries(levelScores).reduce((tot, p) =>
        (p[0] == LVL) ? tot + Math.max(currentLevelScore, p[1]) : tot + p[1], 0);
}



/* PLAY AREA STATUS */
function isMouseDead() {
    if (objectsInfo == undefined || mouseInfo == undefined) { return; }

    // check if mouse is crushed under a block
    if (mouseInfo.isAlive && objectsInfo.hasBlock(mouseInfo.pos)) {
        game_over("crush");
        return;
    }

    // check if mouse has been caught
    for (const cat of Object.values(objectsInfo.catInfo)) {
        if (hasMouse(cat["pos"])) {
            game_over("eaten");
            return;
        }
    }
}

function hasMouse(pos) {
    return mouseInfo.pos[0] == pos[0] && mouseInfo.pos[1] == pos[1];
}

function isBlock(n) {
    return n >= ID_RANGE_BLOCK[0] && n <= ID_RANGE_BLOCK[1];
}

function isFixedBlock(n) {
    return n >= ID_RANGE_BLOCK_FIXED[0] && n <= ID_RANGE_BLOCK_FIXED[1];
}

function isCheese(n) {
    return n >= ID_RANGE_CHEESE[0] && n <= ID_RANGE_CHEESE[1];
}

function isCat(n) {
    return n >= ID_RANGE_CAT[0] && n <= ID_RANGE_CAT[1];
}

function isEdible(n) {
    return isCheese(n) || isCat(n);
}

function isDen(n) {
    return n >= ID_RANGE_DEN[0] && n <= ID_RANGE_DEN[1];
}

function getObjectTypeFromId(n) {
    if (isBlock(n))      { return "block";  }
    if (isCheese(n))     { return "cheese"; }
    if (isCat(n))        { return "cat";    }
    if (isFixedBlock(n)) { return "blockFixed"; }
    if (isDen(n))        { return "den"; }
    return "";
}

function getCatType(n) {
    if (isCat(n)) { return objectsInfo.catInfo[n].type; }
    return null;
}

function getDenType(n) {
    if (isDen(n)) { return objectsInfo.denInfo[n].type; }
    return null;
}



/*  CAT MOVEMENT: GENERAL */
function catMoveFunc(n) {
    let cat = objectsInfo.catInfo[n];
    let catType = cat["type"];
    clearCatMove(n);
    switch(catType) {
        case "basic":
        case "basicFast": {
            catMoveFuncGeneral(n) ? setCatMoveBasic(n) : null;
            break;
        }
        case "pathFinding": {
            catMoveFuncGeneral(n) ? setCatMovePathFinding(n) : null;
            break;
        }
        case "evasive": {
            catMoveFuncGeneral(n) ? setCatMoveEvasive(n) : null;
            break;
        }
        case "strong": {
            catMoveFuncGeneral(n) ? setCatMoveStrong(n) : null;
            break;
        }
    }
}

function getNextCatPosRandom(numChoices) {
    return Math.floor(Math.random() * numChoices);
}

function processCatToCheese(n) {
    objectsInfo.turnCatIntoCheese(n);
    clearCatMove(n);
}

function clearCatMove(n=null) {
    (n == null) ? Object.keys(catMove).forEach(n => clearCatMove(n)) : clearInterval(catMove[n]);
}


/*  CAT MOVEMENT: BASIC, BASICFAST */
function catMoveFuncGeneral(n) {
    let cat = objectsInfo.catInfo[n];
    let catPos = cat["pos"];
    let freePos = objectsInfo.freeCellsAround(catPos);
    if (freePos.length) { // cat can move
        let newPos;
        switch(cat["type"]) {
            case "basic":
            case "basicFast": {
                newPos = catMoveFuncBasic(n, freePos);
                break;
            }
            case "pathFinding": {
                newPos = catMoveFuncPathFinding(n, mouseInfo.pos, freePos);
                break;
            }
            case "evasive": {
                newPos = catMoveFuncEvasive(n, mouseInfo.pos, freePos);
                break;
            }
            case "strong": {
                newPos = catMoveFuncStrong(n, mouseInfo.pos, freePos);
                break;
            }
        }
        if (newPos) { objectsInfo.move(catPos[0], catPos[1], newPos[0], newPos[1]); }
        return true;
    }
    else { processCatToCheese(n); } // cat is trapped, turns into cheese
    return false;
}

function catMoveFuncBasic(n, freePos) {
    let mousePos = mouseInfo.pos;
    let cat = objectsInfo.catInfo[n];
    let catPos = cat.pos;
    let catType = cat.type;
    let canChangeSpeed = catType == "basicFast";
    let i;
    if (distEuclidean(catPos, mousePos) > DETECT_RADIUS) {
        i = getNextCatPosRandom(freePos.length);
        if (canChangeSpeed) { cat["params"]["speed"] = "slow"; }
    }
    else {
        i = getNextCatPosChaseBasic(mousePos, catPos, freePos);
        if (canChangeSpeed) { cat["params"]["speed"] = "fast"; }
        meow(n, 0.85);
    }
    return freePos[i];
}

function setCatMoveBasic(n) {
    if (n in catMove) { clearInterval(catMove[n]); }
    let cat = objectsInfo.catInfo[n];
    let speed = cat["params"]["speed"]
    switch(speed) {
        case "slow":     dur = getCatMoveDurSlow(); break;
        case "fast":     dur = getCatMoveDurFast(); break;
        case "veryFast": dur = getCatMoveDurVeryFast(); break;
        default:         dur = getCatMoveDurSlow(); break;
    }
    catMove[n] = setInterval(catMoveFunc, dur, n);
}

function getCatMoveDurSlow() {
    return CAT_MOVE_BASIC_SLOW_MIN + CAT_MOVE_BASIC_SLOW_RANGE * Math.random();
}

function getCatMoveDurFast() {
    return CAT_MOVE_BASIC_FAST_MIN + CAT_MOVE_BASIC_FAST_RANGE * Math.random();
}

function getCatMoveDurVeryFast() {
    return CAT_MOVE_BASIC_VERY_FAST_MIN + CAT_MOVE_BASIC_VERY_FAST_RANGE * Math.random();
}

function getNextCatPosChaseBasic(mousePos, catPos, freePos, mode="chase") {
    let dirVec = (mode == "chase") ? subVec(mousePos, catPos) : subVec(catPos, mousePos);
    let innerProd = [];
    let val;
    let maxVal = -2;
    for (const [n, vec] of freePos.entries()) {
        val = innerProdNormalized(subVec(vec, catPos), dirVec);
        if (val > maxVal) {
            maxVal = val;
            i = n;
        }
    }
    return i;
}

/*  CAT MOVEMENT: PATHFINDING */
function catMoveFuncPathFinding(n, tgtPos, freePos, avoidPos=null) {
    let i, j, newHeadNodes, nextIndex;

    // init free space mask (0 = occupied, 1 = free, node = node)
    const dMask = objectsInfo.objMask.map(function f_row(row) {
        return row.map(function f_col(val) {
            return Number(val == 0);
        });
    });
    if (avoidPos != null && !GAME_OVER) {
        for (pos of avoidPos) {
            dMask[pos[0]][pos[1]] = 0;
        }
    }

    // init node list
    let cat = objectsInfo.catInfo[n];
    let catPos = cat["pos"];
    let node = new PathFindingNode(catPos);
    dMask[catPos[0]][catPos[1]] = node;
    let nodeList = [node];
    while (true) {
        // failed to find mouse
        if (nodeList.length == 0) {
            cat["params"]["speed"] = "slow";
            deAllocateDMask(dMask);
            return catMoveFuncBasic(n, freePos);
        }

        // choose lowest-cost node from active list
        nextIndex = 0;
        for (i = 0; i < nodeList.length; i++) {
            if (nodeList[i].cost < nodeList[nextIndex].cost) {
                nextIndex = i;
            }
        }
        i = nodeList[nextIndex].pos[0];
        j = nodeList[nextIndex].pos[1];
        nodeList.splice(nextIndex, 1); // remove from list

        // check for mouse and backtrack, otherwise expand
        if (tgtPos[0] == i && tgtPos[1] == j) {
            node = dMask[i][j];
            while (node.parent.parent != null) {
                node = node.parent;
            }
            cat["params"]["speed"] = "fast";
            meow(n, 0.90);
            deAllocateDMask(dMask);
            return node.pos;
        }
        else {
            newHeadNodes = dMask[i][j].expand(dMask);
            nodeList = nodeList.concat(newHeadNodes);
        }
    }
}

function deAllocateDMask(d){
    for (let i = 0; i < GRIDSIZE[0]; i++) {
        for (let j = 0; j < GRIDSIZE[1]; j++) {
            if (d[i][j] instanceof PathFindingNode) {
                delete d[i][j];
            }
        }
    }
}

class PathFindingNode {
    constructor(pos, parent=null, cost=0) {
        this.pos = pos; // [i, j]
        this.parent = parent; // PathFindingNode instance
        this.cost = cost; // Number
    }
    expand(mask) {
        let i, j, costMove, newNode;
        let [i_start, i_end, j_start, j_end] = getExpandIdxLimits(this.pos);
        let newNodes = [];
        for (i = i_start; i <= i_end; i++) {
            for (j = j_start; j <= j_end; j++) {
                if (mask[i][j] === 1) { // unoccupied
                    costMove = getCatMoveCost(this.pos, [i, j]);
                    newNode = new PathFindingNode([i, j], this, this.cost + costMove);
                    mask[i][j] = newNode;
                    newNodes.push(newNode);
                }
                else if (mask[i][j] instanceof PathFindingNode) {
                    costMove = getCatMoveCost(this.pos, [i, j]);
                    if (this.cost + costMove < mask[i][j].cost) {
                        mask[i][j].parent = this;
                        mask[i][j].cost = this.cost + costMove;
                    }
                }
            }
        }
        return newNodes;
    }
}

function getExpandIdxLimits(pos) {
    let i_start = (pos[0] == 0) ? 0 : pos[0] - 1;
    let i_end = (pos[0] == GRIDSIZE[0] - 1) ? GRIDSIZE[0] - 1 : pos[0] + 1;
    let j_start = (pos[1] == 0) ? 0 : pos[1] - 1;
    let j_end = (pos[1] == GRIDSIZE[1] - 1) ? GRIDSIZE[1] - 1 : pos[1] + 1;
    return [i_start, i_end, j_start, j_end];
}

function getCatMoveCost(x, y) {
    return (x[0] == y[0] || x[1] == y[1]) ? 1.0 : 1.41421356237; // sqrt(2)
}

function setCatMovePathFinding(n) {
    setCatMoveBasic(n);
}

/* CAT MOVEMENT: EVASIVE */
function catMoveFuncEvasive(n, tgtPos, freePos) {
    let scores, i, j, maxVal, newTgtPos;

    let cat = objectsInfo.catInfo[n];
    let catPos = cat.pos;

    // if far from mouse, move randomly
    if (distEuclidean(catPos, tgtPos) > DETECT_RADIUS) { return catMoveFuncBasic(n, freePos); }

    // init free space mask (0 = occupied, 1 = free)
    const dMask = objectsInfo.objMask.map(function f_row(row) {
        return row.map(function f_col(val) {
            return Number(val == 0);
        });
    });
    if (!GAME_OVER) { dMask[tgtPos[0]][tgtPos[1]] = 0; } // avoid mouse

    // find all reachable cells
    let reachableCells = [];
    let posList = [catPos];
    dMask[catPos[0]][catPos[1]] = 0;
    while (posList.length) {
        let pos = posList.shift();
        let [i_start, i_end, j_start, j_end] = getExpandIdxLimits(pos);
        for (i = i_start; i <= i_end; i++) {
            for (j = j_start; j <= j_end; j++) {
                if (dMask[i][j]) {
                    dMask[i][j] = 0;
                    posList.push([i, j]);
                    reachableCells.push([i, j]);
                }
            }
        }
    }

    // identify cell furthest from mouse
    scores = [];
    for (pos of reachableCells) {
        scores.push(distEuclidean(pos, tgtPos));
    }
    maxVal = Math.max(...scores);
    i = scores.indexOf(maxVal);
    newTgtPos = reachableCells[i];

    // find next move towards new target cell
    let newPos = catMoveFuncPathFinding(n, newTgtPos, freePos, [tgtPos]);

    return newPos;
}

function setCatMoveEvasive(n) {
    let cat = objectsInfo.catInfo[n];
    let mousePos = mouseInfo.pos;
    if (distEuclidean(cat.pos, mousePos) > DETECT_RADIUS) { cat["params"]["speed"] = "slow"; }
    else                                                  { cat["params"]["speed"] = "fast"; }
    setCatMoveBasic(n);
}

/* CAT MOVEMENT: STRONG */
function catMoveFuncStrong(n, mousePos, freePos) {
    let cat = objectsInfo.catInfo[n];
    let catPos = cat.pos;

    let dist = distEuclidean(catPos, mousePos);

    if (!mouseInfo.isAlive || dist > DETECT_RADIUS) {
        cat["params"]["speed"] = "slow";
        return catMoveFuncBasic(n, freePos);
    }

    if (dist > DETECT_RADIUS_SMALL) { cat["params"]["speed"] = "fast"; }
    else                            { cat["params"]["speed"] = "veryFast"; }

    // direction vector from cat to mouse
    let dirVec = subVec(mousePos, catPos);

    // all possible moves (blocked or unblocked)
    let allPos = [];
    let [i_start, i_end, j_start, j_end] = getExpandIdxLimits(catPos);
    for (let i = i_start; i <= i_end; i++) {
        for (let j = j_start; j <= j_end; j++) {
            if (!(i == catPos[0] && j == catPos[1])) { allPos.push([i, j]); }
        }
    }

    // prioritize moves in order of alignment with cat-to-mouse dir vec
    let alignScores = allPos.map(vec => innerProdNormalized(dirVec, subVec(vec, catPos)));

    // check each direction one at a time for a free space or a push
    while (allPos.length > 0) {
        let i = alignScores.indexOf(Math.max(...alignScores));
        let pos = allPos[i];
        if (objectsInfo.hasEmpty(pos)) { // found free space
            meow(n, 0.80);
            return pos;
        }
        else if (pos[0] == catPos[0] || pos[1] == catPos[1]) {
            let dir_;
            if (pos[0] == catPos[0]) {
                if (pos[1] < catPos[1]) { dir_ = "left"; }
                else                    { dir_ = "right"; }
            }
            else {
                if (pos[0] < catPos[0]) { dir_ = "up"; }
                else                    { dir_ = "down"; }
            }
            if (objectsInfo.canPush(pos, dir_)) { // found push option
                objectsInfo.pushObjects(pos, dir_);
                meow(n, 0.80);
                return pos;
            }
        }
        allPos.splice(i, 1);
        alignScores.splice(i, 1);
    }
}

function setCatMoveStrong(n) {
    setCatMoveBasic(n);
}




/* DEN SPAWN */
function denSpawnFunc(n_den) {
    clearDenSpawn(n_den);

    if (objectsInfo.n_cat == ID_RANGE_CAT[1]) { return; }

    let den = objectsInfo.denInfo[n_den];

    let freePos = objectsInfo.freeCellsAround(den.pos);
    if (freePos.length) {
        let pos = freePos[Math.floor(Math.random() * freePos.length)];
        let n_cat = objectsInfo.addCat(pos, den.type, {speed: "slow"});
        objectsInfo.drawNewCat(n_cat);
        catMoveFunc(n_cat);
    }

    setDenSpawn(n_den);
}

function clearDenSpawn(n=null) {
    (n == null) ? Object.keys(denSpawn).forEach(n => clearDenSpawn(n)) : clearInterval(denSpawn[n]);
}

function setDenSpawn(n) {
    if (n in denSpawn) { clearDenSpawn(n); }

    let den = objectsInfo.denInfo[n];
    let params = den.params;

    let dur;
    switch(params.speed) {
        case "slow": dur = 15000 + Math.random() * 10000; break;
        case "fast": dur = 8000 + Math.random() * 4000; break;
        default: return;
    }

    denSpawn[n] = setInterval(denSpawnFunc, dur, n);
}




/* AUDIO */
function meow(n, probMeow=0.95) {
    let cat = objectsInfo.catInfo[n];
    let catType = cat.type;

    if (!(n in meowLock)) { meowLock[n] = false; }
    if (meowLock[n]) { return; }

    let doMeow = Math.random() > probMeow;

    if (doMeow) {
        meowLock[n] = true;

        let clips;
        switch(catType) {
            case "basic":
            case "basicFast":
                clips = ASSET_PATH_CAT_BASIC_AUD;
                break;
            case "pathFinding":
                clips = ASSET_PATH_CAT_PATH_FINDING_AUD;
                break;
            case "evasive":
                clips = ASSET_PATH_CAT_EVASIVE_AUD;
                break;
            case "strong":
                clips = ASSET_PATH_CAT_STRONG_AUD;
                break;
        }

        let i = Math.floor(Math.random() * clips.length);
        let audio = new Audio(clips[i]);
        audio.volume = getMeowVolume(cat.pos);
        audio.play();
        setTimeout(function() { meowLock[n] = false; }, 1000 + 1000 * audio.duration);
        delete audio;
    }
}

function getMeowVolume(catPos) {
    let dist = distEuclidean(mouseInfo.pos, catPos);
    let vol = 0;
    if   (dist < DETECT_RADIUS_SMALL) { return 1.0; }
    else                              { return 10 ** ((-3 - 1.5 * (dist - DETECT_RADIUS_SMALL)) / 20); }
}
