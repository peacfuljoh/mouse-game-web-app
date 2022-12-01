// global constants
let timer;
let trapped;

// game state
let time_left;
let LVL = 0;


// elements
const MOUSE_ICON = document.getElementById('mouse-icon');
const BLOCKS_DIV = document.getElementById('blocks-div');



// state objects
let mouseInfo;
let objectsInfo;


// classes
class Mouse {
    constructor(vpos=0, hpos=0, blockBinMask=null) {
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
            if (objectsInfo.hasCheese(next_pos)) {
                update_score(VAL_CHEESE);
                objectsInfo.remove(next_pos);
                this.pos = next_pos;
            }
            else if (!objectsInfo.hasBlock(next_pos) || objectsInfo.hasCat(next_pos)) { // space is free or has cat
                this.pos = next_pos;
            }
            else if (objectsInfo.canPush(next_pos, dir_)) { // blocks in the way
                objectsInfo.pushObjects(next_pos, dir_);
                this.pos = next_pos;
            }
        }

        // update icon
        this.updateIcon();
        if (!objectsInfo.anyCheeseRemaining()) {
            level_up(LVL + 1);
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
        // init block mask
        this.catPos = {};
        this.objMask = [];
        this.initObjMask(lvl_layout);
        this.draw();
    }
    initObjMask(lvl_layout) {
        let n_empty = 0; // empty cells
        let n_block = ID_RANGE_BLOCK[0]; // 1 through 400
        let n_cheese = ID_RANGE_CHEESE[0]; // 401 through 450
        let n_cat = ID_RANGE_CAT[0]; // 451 through 500
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            this.objMask.push([]);
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                if (lvl_layout[i][j] == SYMBOL_BLOCK) {
                    this.objMask[i].push(n_block);
                    n_block += 1;
                }
                else if (lvl_layout[i][j] == SYMBOL_CHEESE) {
                    this.objMask[i].push(n_cheese);
                    n_cheese += 1;
                }
                else if (lvl_layout[i][j] == SYMBOL_CAT) {
                    this.objMask[i].push(n_cat);
                    this.catPos[n_cat] = [i, j];
                    n_cat += 1;
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
                    if (n >= ID_RANGE_BLOCK[0] && n <= ID_RANGE_BLOCK[1]) {
                        text += this.addObjectText(i, j, "block");
                    }
                    else if (n >= ID_RANGE_CHEESE[0] && n <= ID_RANGE_CHEESE[1]) {
                        text += this.addObjectText(i, j, "cheese");
                    }
                    else if (n >= ID_RANGE_CAT[0] && n <= ID_RANGE_CAT[1]) {
                        text += this.addObjectText(i, j, "cat");
                    }
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
        if      (type == "block")  { text += '"assets/block.png"';  }
        else if (type == "cheese") { text += '"assets/cheese.png"'; }
        else if (type == "cat")    { text += '"assets/cat.png"';    }
        text += ' style="';
        text += ' top:' + top.toString() + 'px;';
        text += ' left:' + left.toString() + 'px;';
        text += ' position:absolute;';
        text += ' border-radius:20%;';
        if      (type == "block")  { text += ' height:26px;'; }
        else if (type == "cheese") { text += ' height:18px;'; }
        else if (type == "cat")    { text += ' height:24px;'; }
        text += ' z-order:5;'
        text += '"';
        text += '>';
        text += '\n';

        return text;
    }

    // status check methods
    hasBlock(pos) {
        return this.objMask[pos[0]][pos[1]]
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
            canPush ||= !Boolean(this.objMask[i][j]);
            increment();
        }

        return canPush;
    }
    hasCheese(next_pos) {
        let i = next_pos[0];
        let j = next_pos[1];
        let obj_id = this.objMask[i][j];
        if (obj_id >= ID_RANGE_CHEESE[0] && obj_id <= ID_RANGE_CHEESE[1]) {
            return true;
        }
        return false;
    }
    anyCheeseRemaining() {
        let n;
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                n = this.objMask[i][j];
                if (n >= ID_RANGE_CHEESE[0] && n <= ID_RANGE_CHEESE[1]) {
                    return true;
                }
            }
        }
        return false;
    }
    hasCat(next_pos) {
        let i = next_pos[0];
        let j = next_pos[1];
        let obj_id = this.objMask[i][j];
        if (obj_id >= ID_RANGE_CAT[0] && obj_id <= ID_RANGE_CAT[1]) {
            return true;
        }
        return false;
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
            if (!this.objMask[i][j]) {
                break;
            }
            increment(0);
        } while (i >= 0 && i <= GRIDSIZE[0] - 1 && j >= 0 && j <= GRIDSIZE[1] - 1);

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
        if (n >= ID_RANGE_CAT[0] && n <= ID_RANGE_CAT[1]) {
            this.catPos[n] = [i_end, j_end];
        }
    }
    remove(next_pos) {
        let i = next_pos[0];
        let j = next_pos[1];
        this.objMask[i][j] = 0;
        this.draw();
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
    level_up();
}

function level_up(lvl=-1) {
    let board;

    if   (lvl == -1) { LVL = 0; }
    else             { LVL = lvl % (MAX_LVL + 1); }

    // reset play objects
    delete mouseInfo;
    delete objectsInfo;
    board = BLOCK_BIN_MASK[LVL];
    mouseInfo = new Mouse(null, null, board);
    objectsInfo = new Objects(board);

    // update game info
    if   (lvl == -1) { update_score(); }
    else             { update_score(Math.floor(time_left * timeToScoreFactor)); }

    // reset timer
    time_left = INIT_TIME + 1;
    if (timer != undefined) {
        clearInterval(timer);
    }
    update_timer();
    timer = setInterval(update_timer, 1000);

    // set trap callback
    if (trapped == undefined) {
        trapped = setInterval(didCatTrapMouse, 100);
    }
}

function update_timer() {
    let elem = document.getElementById("timer");

    // decrement timer
    time_left -= 1;

    // reset if timer ran out
    if (time_left < 0) {
        elem.style.color = "black";
        game_over();
        return;
    }

    // update text
    let min = Math.floor(time_left / 60);
    let sec = (time_left - min * 60);
    let text = min.toString() + ":";
    if (sec < 10) {
        text += "0"
    }
    text += sec.toString();
    elem.innerHTML = text;

    // update color
    if (time_left < 30) {
        if (time_left <= 10) {
            elem.style.color = "red";
        } else {
            elem.style.color = "#cc9900";
        }
    }
}

function update_score(incr=null) {
    let elem = document.getElementById("score");
    if (incr == null) {
        elem.innerHTML = "Score: 0";
    } else {
        let score = Number(elem.innerHTML.substring(7)) + incr;
        elem.innerHTML = "Score: " + score.toString();
    }
}


function didCatTrapMouse() {
//    console.log(Object.values(objectsInfo.catPos));
    for (const pos of Object.values(objectsInfo.catPos)) {
        if (mouseInfo.pos[0] == pos[0] && mouseInfo.pos[1] == pos[1]) {
            game_over();
        }
    }
}