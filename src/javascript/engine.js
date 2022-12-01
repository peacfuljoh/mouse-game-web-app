// global constants
const GRIDSIZE = [20, 20]; // height, width

const MOUSE_PX_LEFT0 = 10;
const MOUSE_PX_TOP0 = 5;
const MOUSE_PX_PER_CELL = 30;

const BLOCK_PX_LEFT0 = 2;
const BLOCK_PX_TOP0 = 2;
const BLOCK_PX_PER_CELL = 29.95;

const INIT_LVL = 0;

const SYMBOL_BLOCK = "B";


// elements
const MOUSE_ICON = document.getElementById('mouse-icon');
const BLOCKS_DIV = document.getElementById('blocks-div');


// block position starting lists for all game levels
const BLOCK_POS_LIST = [
    [2, 3], [5, 7], [13, 6], [5, 2], [18, 10],
    [4, 17], [14, 17], [15, 13], [11, 11], [11, 19],
    [0, 19], [19, 0], [19, 19], [0, 1]
];

const BLOCK_BIN_MASK = [
    "--------------------",
    "--------------------",
    "---------BBBB-------",
    "---------BBBB-------",
    "-----BBBBBBBB-------",
    "--------BBBBB-BB----",
    "--------------------",
    "---------BBBBB------",
    "----BBBBBBB---------",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------"
];


// classes
class Mouse {
    constructor(vpos=0, hpos=0) {
        this.pos = [vpos, hpos]; // vertical, horizontal
        this.dir = 0;
        this.updateIcon();
    }
    move(dir_) {
        let next_pos;
        let onEdge = false;

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
            if (!blocksInfo.hasBlock(next_pos)) { // space is free
                this.pos = next_pos;
            }
            else if (blocksInfo.canPush(next_pos, dir_)) {
                blocksInfo.pushBlocks(next_pos, dir_);
                this.pos = next_pos;
            }
        }

        // update icon
        this.updateIcon();
    }
    updateIcon() {
        MOUSE_ICON.style.transform = 'rotate(' + (90 * this.dir).toString() + 'deg)'
        MOUSE_ICON.style.top = (MOUSE_PX_TOP0 + this.pos[0] * MOUSE_PX_PER_CELL).toString() + 'px';
        MOUSE_ICON.style.left = (MOUSE_PX_LEFT0 + this.pos[1] * MOUSE_PX_PER_CELL).toString() + 'px';
    }
}

class Blocks {
    constructor(blockPosList=null, blockBinMask=null) {
        // initialize block mask
        this.blockMask = [];
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            this.blockMask.push([]);
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                this.blockMask[i].push(0);
            }
        }

        // populate block mask from list or binary mask
        if (blockPosList != null) {
            let n = 1;
            for (let blockPos of blockPosList) {
                this.blockMask[blockPos[0]][blockPos[1]] = n;
                n += 1;
            }
        }
        else if (blockBinMask != null) {
            let n = 1;
            for (let i = 0; i < GRIDSIZE[0]; i++) {
                for (let j = 0; j < GRIDSIZE[1]; j++) {
                    if (blockBinMask[i][j] == SYMBOL_BLOCK) {
                        this.blockMask[i][j] = n;
                        n += 1;
                    }
                }
            }
        }
        else {
            // error
        }
        this.draw();
    }
    draw() {
        let n = 0;
        let text = '';
        for (let i = 0; i < GRIDSIZE[0]; i++) {
            for (let j = 0; j < GRIDSIZE[1]; j++) {
                if (this.blockMask[i][j]) {
                    text += this.addBlock(i, j);
                }
            }
        }
        BLOCKS_DIV.innerHTML = text;
    }
    addBlock(i, j) {
        let top = BLOCK_PX_TOP0 + i * BLOCK_PX_PER_CELL;
        let left = BLOCK_PX_LEFT0 + j * BLOCK_PX_PER_CELL;
        let n = this.blockMask[i][j];

        let text = '';
        text += '<img id="block' + n.toString() + '" src="assets/block.png"';
        text += ' style="';
        text += ' top:' + top.toString() + 'px;';
        text += ' left:' + left.toString() + 'px;';
        text += ' position:absolute;';
        text += ' border-radius:20%;';
        text += ' height:26px;';
        text += ' z-order:5;'
        text += '"';
        text += '>';
        text += '\n';

        return text;
    }
    hasBlock(pos) {
        return this.blockMask[pos[0]][pos[1]]
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
            canPush ||= !Boolean(this.blockMask[i][j]);
            increment();
        }

        return canPush;
    }
    pushBlocks(next_pos, dir_) {
        let n, elem, increment, cond, i_inc, j_inc;
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
            if (!this.blockMask[i][j]) {
                break;
            }
            increment(0);
        } while (i >= 0 && i <= GRIDSIZE[0] - 1 && j >= 0 && j <= GRIDSIZE[1] - 1);

        // move blocks away in reverse distance-from-mouse order
        while (cond()) {
            n = this.blockMask[i + i_inc][j + j_inc];
            elem = document.getElementById("block" + n.toString());
            elem.style.top = (BLOCK_PX_TOP0 + i * BLOCK_PX_PER_CELL).toString() + 'px';
            elem.style.left = (BLOCK_PX_LEFT0 + j * BLOCK_PX_PER_CELL).toString() + 'px';
            this.blockMask[i][j] = n;
            this.blockMask[i + i_inc][j + j_inc] = 0;
            increment(1);
        }
    }
}


// objects
let mouseInfo = new Mouse(Math.floor(0.75 * GRIDSIZE[0]), Math.floor(0.50 * GRIDSIZE[1]));
//let blocksInfo = new Blocks({"blockPosList": BLOCK_POS_LIST});
let blocksInfo = new Blocks(null, BLOCK_BIN_MASK);


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
function start_new_game() {

}