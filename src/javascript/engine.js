/* Main functionality for mouse game */
/*
TODO: screens for start, game over, game finish, level finish, level start
TODO: sign in with player name
TODO: high scores (stored locally) indexed by player name
TODO: more cats
TODO:   fast cats (speed up when closer to mouse)
TODO:   strong cats (can push blocks)
TODO:   laser cats (can shoot lasers)
TODO:   jumping cats (can leap over a single block)
TODO:   smart cats (path-finding)
TODO:   guard cats (stay in certain area)
TODO:   cat den (spawns new cats, destroyed with a bomb)
TODO: more terrain
TODO:   heavy blocks (can't be moved)
TODO:   rivers
TODO:   more interesting background
TODO:   teleport pads (only mouse)
TODO: better mouse icon
TODO: mouse abilities (timeout between each use)
TODO:   force push (move block stack max distance)
TODO:   shield (can pick up in some levels from cat fortresses)
TODO:   bomb (can pick up, used to destroy heavy blocks and cat dens)
TODO: 20 levels
TODO: better styling (large play area, centered elements, nice-looking buttons and stats)
TODO: game instructions at bottom
*/


// elements
const MOUSE_ICON = document.getElementById('mouse-icon');
const BLOCKS_DIV = document.getElementById('blocks-div');

// state objects
let LVL = 0;
let mouseInfo;
let objectsInfo;
let timeRemain;
let timer;
let trapped = setInterval(didCatTrapMouse, 10);
let catMove = {};


// classes
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
    }
    move(dir_) {
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
        if (!objectsInfo.anyCheeseRemaining()) {
            go_to_level(LVL + 1);
        }
    }
    updateIcon() {
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

        // init cat positions
        this.catPos = {};

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
                    this.catPos[this.n_cat] = [i, j];
                    catMove[this.n_cat] = setInterval(catMoveFunc, 1000, this.n_cat);
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
        BLOCKS_DIV.innerHTML = text;
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
            this.catPos[n] = [i_end, j_end];
        }
    }
    remove(pos) {
        this.objMask[pos[0]][pos[1]] = 0;
        this.draw();
    }
    turnCatIntoCheese(n) {
        // get info
        let elem = document.getElementById("object" + n.toString());
        let pos = this.catPos[n];
        let n_new = this.n_cheese;
        this.n_cheese += 1;

        // update image
        elem.src = ASSET_PATH_CHEESE;
        elem.style.height = this.getObjectTextHeight("cheese");

        // update other info
        elem.id = "object" + n_new.toString();
        this.objMask[pos[0]][pos[1]] = n_new;

        // remove cat pos
        delete this.catPos[n];
    }
}


// callbacks
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




// functions
function game_over() {
    go_to_level();
}

function go_to_level(lvl=null) {
    let board;

    if (lvl == null) {
        LVL = 0;
    }
    else {
        LVL = lvl % (MAX_LVL + 1);
    }

    // reset play objects
    Object.keys(catMove).forEach(n => clearOneCatMove(n));
    delete mouseInfo;
    delete objectsInfo;
    board = BLOCK_BIN_MASK[LVL];
    mouseInfo = new Mouse(board);
    objectsInfo = new Objects(board);

    // update game info
    if (lvl == null) {
        update_score();
    }
    else {
        update_score(Math.floor(timeRemain * timeToScoreFactor));
    }

    // reset timer
    timeRemain = INIT_TIME + 1;
    if (timer != undefined) {
        clearInterval(timer);
    }
    update_timer();
    timer = setInterval(update_timer, 1000);
}

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

function update_score(incr=null) {
    let elem = document.getElementById("score");
    if (incr == null) { elem.innerHTML = "Score: 0"; }
    else              { elem.innerHTML = "Score: " +
                        (Number(elem.innerHTML.substring(7)) + incr).toString(); }
}


function didCatTrapMouse() {
    if (objectsInfo == undefined || mouseInfo == undefined) {
        return;
    }
    for (const pos of Object.values(objectsInfo.catPos)) {
        if (hasMouse(pos)) {
            game_over();
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

function catMoveFunc(n) {
    let catPos = objectsInfo.catPos[n];
    let freePos = objectsInfo.freeCellsAround(catPos);
    if (freePos.length) { // cat can move
        let posNew, i;
        let mousePos = mouseInfo.pos;
        let dist = distEuclidean(catPos, mousePos);
        if (dist > DETECT_RADIUS) {
            // cat is not near mouse, random movement
            i = Math.floor(Math.random() * freePos.length);
        }
        else {
            // cat can see mouse, chase movement
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
        }
        posNew = freePos[i];
        objectsInfo.move(catPos[0], catPos[1], posNew[0], posNew[1]);
        objectsInfo.catPos[n] = posNew;
    }
    else {
        // cat is trapped; turns into cheese
        objectsInfo.turnCatIntoCheese(n);
        clearOneCatMove(n);
    }
}

function clearOneCatMove(n) {
    clearInterval(catMove[n]);
    delete catMove[n];
}

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
