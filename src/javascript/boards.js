// starting board configs
const BLOCK_BIN_MASK = [];

const CAT_TYPES = {};
const CAT_PARAMS = {};
for (let i = 0; i <= MAX_LVL; i++) {
    CAT_TYPES[i] = {};
    CAT_PARAMS[i] = {};
}

let L = 0;
let catNums;

let BASIC_SPEED = {"speed": "slow"};

function addO(obj, n, info) {
    obj[ID_RANGE_CAT[0] + n] = info;
}

// level 0
BLOCK_BIN_MASK[L] = [
    "B------------------B",
    "--------------------",
    "---------BBBB-------",
    "---------BBBB-------",
    "-----BBBBBBBB-------",
    "--------BBBBB-BB----",
    "-----BBBBBB---------",
    "--M------BBBBB------",
    "----BBBBBBB-H---A---",
    "------BBBBBBBB------",
    "-----------BBBBB----",
    "---BBBBBBBBBB-------",
    "--------HBBBBB------",
    "----------B---------",
    "----------B---------",
    "----------B---------",
    "---------B----------",
    "----------B---------",
    "----------B---------",
    "B---------B--------B"
];

addO(CAT_TYPES[L], 0, "basic");
addO(CAT_PARAMS[L], 0, BASIC_SPEED);

// level 1
L = 1;
BLOCK_BIN_MASK[L] = [
    "----BB--------------",
    "-M--BBBBBB----------",
    "BBBBBB--------------",
    "--BB----------------",
    "--------------------",
    "BBBB-------BBB------",
    "BBBBBBB------BBBBB--",
    "BBBBB---------BBBBBB",
    "BBB---------------BB",
    "BBBB--------BBBBBBBA",
    "BBBBB-------BBBBBB--",
    "---------------BBBBB",
    "-----BB-----BB------",
    "---------B----------",
    "--BBBB---------BBBBB",
    "---------BBBBBBBB---",
    "-----------BBBB-----",
    "--BBBBB-----B---A---",
    "BBB---BBB---B----BB-",
    "-BB-H-A-BB--B-BB-H--"
];

catNums = [0, 1, 2];
catNums.forEach(n => addO(CAT_TYPES[L], n, "basic"));
catNums.forEach(n => addO(CAT_PARAMS[L], n, BASIC_SPEED));

// level 2
L = 2;
BLOCK_BIN_MASK[L] = [
    "--------------------",
    "--BB---BB---B--B----",
    "--B---B---BB---BBB--",
    "----B-BB-A---BB-----",
    "--B-B-BB-H--B--B-BB-",
    "-BB-BB-B--B--B--A-BB",
    "-B-A-BB-B--BB-B---B-",
    "--B---BB--BB--B-B--B",
    "B--BBB-B-B-B--BB----",
    "--B---B-B-B-B--B----",
    "B---BB-BB---BB--BBB-",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------",
    "--------------------",
    "BBBBBBBBBBBBBBBBBBBB",
    "------B-----B-------",
    "--A---B--M--B---A---",
    "------B-----B-------"
]

catNums = [0, 1, 2];
catNums.forEach(n => addO(CAT_TYPES[L], n, "basicFast"));
catNums.forEach(n => addO(CAT_PARAMS[L], n, BASIC_SPEED));
catNums = [3, 4];
catNums.forEach(n => addO(CAT_TYPES[L], n, "basic"));
catNums.forEach(n => addO(CAT_PARAMS[L], n, BASIC_SPEED));

// validate boards
for (let n = 0; n < BLOCK_BIN_MASK.length; n++) {
    let board = BLOCK_BIN_MASK[n];
    let num_rows = board.length;
    if (num_rows != GRIDSIZE[0]) {
        // error
    }
    for (let i = 0; i < num_rows; i++) {
        if (board[i].length != GRIDSIZE[1]) {
            // error
        }
    }
}