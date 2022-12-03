/* Main functionality for mouse game */
/*
TODO: more cats
TODO:   smart cats (path-finding)
TODO:   jumping cats (can leap over a single block)
TODO:   strong cats (can push blocks)
TODO:   laser cats (can shoot lasers)
TODO:   cat den (spawns new cats, destroyed with a bomb)
TODO:   stealth cat (invisible when not moving)
TODO:   guard cats (stay in certain area)
TODO: more terrain
TODO:   heavy blocks (can't be moved)
TODO:   rivers
TODO:   more interesting background
TODO:   teleport pads (only mouse)

TODO: 20 levels
TODO: better styling (centered elements, nice-looking buttons and stats)

TODO: mouse abilities (timeout between each use)
TODO:   force push (move block stack max distance)
TODO:   shield (can pick up in some levels from cat fortresses)
TODO:   bomb (can pick up, used to destroy heavy blocks and cat dens)

TODO: fix bug (game over screen goes away if mouse runs through cat)

*/


// elements
const MOUSE_ICON = document.getElementById('mouse-icon');
const OBJECTS_DIV = document.getElementById('objects-div');
const PLAY_GRID = document.getElementById('play-grid');
const OVERLAY_DIV = document.getElementById('overlay');
const LEVEL_P = document.getElementById('level');

// state objects
let LVL = 0;
let mouseInfo;
let objectsInfo;
let timeRemain = 0;
let timer;
let trapped = setInterval(didCatTrapMouse, 10);
let catMove = {};
let GAME_OVER = true;

let HIGH_SCORE = 0;




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
        if (!this.isAlive) {
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
            // otherwise, unpushable blacks are in the way
        }

        // update icon
        this.updateIcon();
        if (!GAME_OVER && !objectsInfo.anyCheeseRemaining()) {
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

        // init cat info
        this.catInfo = {}; // pos, type, params

        // init block mask
        this.objMask = [];
        this.initObjMask(lvl_layout);

        // draw all objects
        this.draw();
    }
    initObjMask(lvl_layout) {
        let n_empty = 0; // empty cells
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            this.objMask.push([]);
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                if (lvl_layout[i][j] == SYMBOL_BLOCK) {
                    this.objMask[i].push(this.n_block);
                    this.n_block += 1;
                }
                else if (lvl_layout[i][j] == SYMBOL_CHEESE) {
                    this.objMask[i].push(this.n_cheese);
                    this.n_cheese += 1;
                }
                else if (lvl_layout[i][j] == SYMBOL_CAT) {
                    this.objMask[i].push(this.n_cat);
                    this.catInfo[this.n_cat] = {
                        "pos": [i, j],
                        "type": CAT_TYPES[LVL][this.n_cat],
                        "params": CAT_PARAMS[LVL][this.n_cat]
                    };
                    this.n_cat += 1;
                }
                else {
                    this.objMask[i].push(n_empty);
                }
            }
        }
    }
    draw() {
        let n;
        let text = '';
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                n = this.objMask[i][j];
                if (n != 0) {
                    text += this.addObjectText(i, j, getObjectTypeFromId(n));
                }
            }
        }
        OBJECTS_DIV.innerHTML = text;
    }
    addObjectText(i, j, type) {
        let top = BLOCK_PX_TOP0 + i * BLOCK_PX_PER_CELL;
        let left = BLOCK_PX_LEFT0 + j * BLOCK_PX_PER_CELL;
        if (type == "cheese") { top += 2; }
        let n = this.objMask[i][j];

        let text = '';
        text += '<img id="object' + n.toString() + '" src=';
        if      (type == "block")  { text += '"' + ASSET_PATH_BLOCK + '"';  }
        else if (type == "cheese") { text += '"' + ASSET_PATH_CHEESE + '"'; }
        else if (type == "cat")    { text += '"' + ASSET_PATH_CAT + '"';    }
        text += ' style="';
        text += ' top:' + top.toString() + 'px;';
        text += ' left:' + left.toString() + 'px;';
        text += ' position:absolute;';
        text += ' border-radius:20%;';
        text += ' height:' + this.getObjectTextHeight(type) + ';';
        text += ' z-order:5;'
        text += '"';
        text += '>';
        text += '\n';

        return text;
    }
    getObjectTextHeight(type) {
        if      (type == "block")  { return '26px'; }
        else if (type == "cheese") { return '18px'; }
        else if (type == "cat")    { return '24px'; }
    }
    initCatsMovement() {
        Object.keys(this.catInfo).forEach(n => catMoveFunc(n));
    }

    // status check methods
    hasEmpty(pos) {
        return this.objMask[pos[0]][pos[1]] == 0;
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
        let canPush = false;
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
        while (!canPush && i >= 0 && i <= GRIDSIZE[0] - 1 && j >= 0 && j <= GRIDSIZE[1] - 1) {
            canPush ||= (this.hasEmpty([i, j]) || this.hasCheese([i, j]));
            increment();
        }

        return canPush;
    }
    anyCheeseRemaining() {
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                if (isEdible(this.objMask[i][j])) {
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
            if (this.hasEmpty([i, j]) || this.hasCheese([i, j])) {
                break;
            }
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
        if (isCat(n)) {
            this.catInfo[n]["pos"] = [i_end, j_end];
//            this.catPos[n] = [i_end, j_end];
        }
    }
    remove(pos) {
        this.objMask[pos[0]][pos[1]] = 0;
        this.draw();
    }
    turnCatIntoCheese(n) {
        // get info
        let elem = document.getElementById("object" + n.toString());
//        let pos = this.catPos[n];
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
//        delete this.catPos[n];
    }
}



/* USER INPUT */
document.onkeypress = function(e) {
    switch (e.key) {
        case "w":
            mouseInfo.move("up");
            break;
        case "d":
            mouseInfo.move("right");
            break;
        case "s":
            mouseInfo.move("down");
            break;
        case "a":
            mouseInfo.move("left");
            break;
    }
}




/* GAME OVER, NEW GAME, LEVEL CHANGE */
function new_game() {
    GAME_OVER = false;
    reset_overlay();
    timeRemain = 0;
    go_to_level(INIT_LVL);
}

function reset_overlay() {
    OVERLAY_DIV.innerHTML = "";
    OVERLAY_DIV.style.padding = "";
}

function game_over(win=false) {
    GAME_OVER = true;

    // update mouse info
    if (!win) {
        mouseInfo.isAlive = false;
        mouseInfo.pos = [-100, -100];
        MOUSE_ICON.src = "";
    }

    // save high score
    HIGH_SCORE = Math.max(HIGH_SCORE, get_score());

    // show overlay
    show_game_over_overlay(win)

    // stop timer
    clearInterval(timer);
    delete timer;
}

function show_game_over_overlay(win) {
    OVERLAY_DIV.innerHTML = game_over_text(win);
    OVERLAY_DIV.style.padding = "30px 50px";
    if (win) {
        OVERLAY_DIV.style.top = "160px";
        OVERLAY_DIV.style.left = "125px";
    }
    else {
        OVERLAY_DIV.style.top = "160px";
        OVERLAY_DIV.style.left = "170px";
    }
    OVERLAY_DIV.style.backgroundColor = "rgba(217, 245, 255, 0.9)";
}

function game_over_text(win) {
    centerStyle = 'text-align:center; ';

    let score_ = get_score();
    let scoreColorStyle = '';
    if (score_ == HIGH_SCORE) { scoreColorStyle = "color:green; " }

    let endGameMsg, gameOverMsg;
    if (win) {
        gameOverMsg = 'CONGRATULATIONS'
        endGameMsg = 'You ate all the cheese!';
    }
    else {
        gameOverMsg = 'GAME OVER';
        if (timeRemain >= 0) { endGameMsg = 'You have been eaten.'; }
        else                 { endGameMsg = 'You ran out of time!'; }
    }

    text = '';
    text += '<h2 style="' + centerStyle + 'font-weight:bold">' + gameOverMsg + '</h2>';
    text += '<h3 style="' + centerStyle + '">' + endGameMsg + '</h3>';
    text += '<h4 style="' + centerStyle + scoreColorStyle + '">Final Score: ' + score_ + '</h4>';
    text += '<h4 style="' + centerStyle + scoreColorStyle + '">High score: ' + HIGH_SCORE + '</h4>';
    return text;
}

function go_to_level(lvl=null) {
    // freeze cats
    clearCatMove();

    // determine level
    if (lvl == null) { // new game
        LVL = 0;
    }
    else if (lvl <= MAX_LVL) { // next level
        LVL = lvl;
    }
    else { // game finish
        add_time_to_score()
        game_over(true);
        console.log('here');
        return;
    }

    // continue reset
    delete mouseInfo;
    delete objectsInfo;
    PLAY_GRID.src = "";
    show_next_level_overlay();

    // reset play objects
    PLAY_GRID.src = ASSET_PATH_GRID;
    let board = BLOCK_BIN_MASK[LVL];
    mouseInfo = new Mouse(board);
    objectsInfo = new Objects(board);
    objectsInfo.initCatsMovement();

    // update game info
    if (lvl == null) {
        update_score();
    }
    else {
        add_time_to_score();
    }
    LEVEL_P.innerHTML = "Level " + (LVL + 1);

    // reset timer
    timeRemain = TIME_REMAIN_ALL[LVL] + 1;
    if (timer != undefined) {
        clearInterval(timer);
    }
    update_timer();
    timer = setInterval(update_timer, 1000);
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

    setTimeout(function() {
        OVERLAY_DIV.innerHTML = '';
        OVERLAY_DIV.style.padding = '';
    }, 2000);
}



/* TIMER, SCORE */
function update_timer() {
    let elemTimer = document.getElementById("timer");

    // decrement timer
    timeRemain -= 1;

    // reset if timer ran out
    if (timeRemain < 0) {
        game_over();
        return;
    }

    // update text
    let min = Math.floor(timeRemain / 60);
    let sec = (timeRemain - min * 60);
    let text = min.toString() + ":";
    if (sec < 10) {
        text += "0"
    }
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

function update_score(incr=null) {
    let elem = document.getElementById("score");
    if (incr == null) { elem.innerHTML = "Score: 0"; }
    else              { elem.innerHTML = "Score: " + (get_score() + incr); }
}

function get_score() {
    let elem = document.getElementById("score");
    return Number(elem.innerHTML.substring(7));
}



/* PLAY AREA STATUS */
function didCatTrapMouse() {
    if (objectsInfo == undefined || mouseInfo == undefined) {
        return;
    }
    for (const cat of Object.values(objectsInfo.catInfo)) {
        if (hasMouse(cat["pos"])) {
            game_over();
            break;
        }
    }
}

function hasMouse(pos) {
    return mouseInfo.pos[0] == pos[0] && mouseInfo.pos[1] == pos[1];
}

function isBlock(n) {
    return n >= ID_RANGE_BLOCK[0] && n <= ID_RANGE_BLOCK[1];
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

function getObjectTypeFromId(n) {
    if (isBlock(n))  { return "block";  }
    if (isCheese(n)) { return "cheese"; }
    if (isCat(n))    { return "cat";    }
    return "";
}



/*  CAT MOVEMENT: GENERAL */
function catMoveFunc(n) {
    let cat = objectsInfo.catInfo[n];
    let catType = cat["type"];
    switch(catType) {
        case "basic":
        case "basicFast": {
            catMoveFuncGeneral(n) ? setCatMoveBasic(n) : clearCatMove(n);
            break;
        }
        case "pathFinding": {
            catMoveFuncGeneral(n) ? setCatMovePathFinding(n) : clearCatMove(n);
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
    if (n == null) {
        Object.keys(catMove).forEach(n => clearCatMove(n));
    }
    else {
        clearInterval(catMove[n]);
        delete catMove[n];
    }
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
                newPos = catMoveFuncPathFinding(n);
                break;
            }
        }
        if (newPos != undefined) {
            objectsInfo.move(catPos[0], catPos[1], newPos[0], newPos[1]);
            objectsInfo.catInfo[n]["pos"] = newPos; // TODO: do this in objectsInfo.move(...) call
        }
        return 1;
    }
    else { // cat is trapped, turns into cheese
        processCatToCheese(n);
    }
    return 0;
}

function catMoveFuncBasic(n, freePos) {
    let mousePos = mouseInfo.pos;
    let cat = objectsInfo.catInfo[n];
    let catPos = cat["pos"];
    let i;
    if (distEuclidean(catPos, mousePos) > DETECT_RADIUS) {
        i = getNextCatPosRandom(freePos.length);
        if (cat["type"] == "basicFast") { cat["params"]["speed"] = "slow"; }
    }
    else {
        i = getNextCatPosChaseBasic(mousePos, catPos, freePos);
        if (cat["type"] == "basicFast") { cat["params"]["speed"] = "fast"; }
    }
    return freePos[i];
}

function setCatMoveBasic(n) {
    if (n in catMove) {
        clearInterval(catMove[n]);
    }
    let cat = objectsInfo.catInfo[n];
    let speed = cat["params"]["speed"]
    switch(speed) {
        case "slow": dur = getCatMoveBasicDurSlow(); break;
        case "fast": dur = getCatMoveBasicDurFast(); break;
        default:     dur = getCatMoveBasicDurSlow(); break;
    }
    catMove[n] = setInterval(catMoveFunc, dur, n);
}

function getCatMoveBasicDurSlow() {
    return CAT_MOVE_BASIC_SLOW_MIN + CAT_MOVE_BASIC_SLOW_RANGE * Math.random();
}

function getCatMoveBasicDurFast() {
    return CAT_MOVE_BASIC_FAST_MIN + CAT_MOVE_BASIC_FAST_RANGE * Math.random();
}

function getNextCatPosChaseBasic(mousePos, catPos, freePos) {
    let dirVec = [mousePos[0] - catPos[0], mousePos[1] - catPos[1]];
    let innerProd = [];
    let val;
    let maxVal = -2;
    for (const [n, vec] of freePos.entries()) {
        val = innerProdNormalized([vec[0] - catPos[0], vec[1] - catPos[1]], dirVec);
        if (val > maxVal) {
            maxVal = val;
            i = n;
        }
    }
    return i;
}

/*  CAT MOVEMENT: PATHFINDING */
function catMoveFuncPathFinding(n) {
    let objMask = objectsInfo.objMask;

}

function setCatMovePathFinding(n) {
    if (n in catMove) {
        clearInterval(catMove[n]);
    }
    catMove[n] = setInterval(catMoveFunc, 500, n);
}






/* MATH, GEOMETRY */
function distEuclidean(x, y) {
    if (x.length != y.length) {
        return Math.NaN;
    }
    let dist = 0;
    for (let n = 0; n < x.length; n++) {
        dist += (x[n] - y[n]) ** 2;
    }
    return Math.sqrt(dist);
}

function innerProdNormalized(x, y) {
    return (x[0] * y[0] + x[1] * y[1]) / (L2Norm(x) * L2Norm(y))
}

function L2Norm(x) {
    return Math.sqrt(x.reduce((sum, x) => sum + x ** 2, 0))
}
