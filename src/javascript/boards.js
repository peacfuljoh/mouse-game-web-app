// starting board configs
const BLOCK_BIN_MASK = [];
const TIME_REMAIN_ALL = [];

const CAT_TYPES = {};
const CAT_PARAMS = {};
for (let i = 0; i <= MAX_LVL; i++) {
    CAT_TYPES[i] = {};
    CAT_PARAMS[i] = {};
}

let L, catNums;

let BASIC_SPEED = {"speed": "slow"};

function addO(obj, n, info) {
    obj[ID_RANGE_CAT[0] + n] = info;
}

// level 0
L = 0;
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

TIME_REMAIN_ALL[L] = 180;

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

TIME_REMAIN_ALL[L] = 180;

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
    "BBBBBFFFBBBFFFBBBBBB",
    "------F-----F-----A-",
    "A-----F--M--F-------",
    "------F-----F-------"
]

catNums = [0, 1, 2];
catNums.forEach(n => addO(CAT_TYPES[L], n, "basicFast"));
catNums.forEach(n => addO(CAT_PARAMS[L], n, BASIC_SPEED));
catNums = [3, 4];
catNums.forEach(n => addO(CAT_TYPES[L], n, "basic"));
catNums.forEach(n => addO(CAT_PARAMS[L], n, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 240;

// level 3
L = 3;
BLOCK_BIN_MASK[L] = [
    "FFFFFF--FFFFFFFF----",
    "-H-------------A--H-",
    "BBBFFFFFBB--BBFFFFBB",
    "--------------------",
    "FFF--BBBBBBBBBBBBBBB",
    "--------------------",
    "BBBBFFFFFBBBBBB--FFF",
    "--------------------",
    "BBBBBBBB--BBBBBBBBBB",
    "--------------------",
    "FFFFFFFFFBFFFFFFBB--",
    "--------------------",
    "--BBBBBBBBBBBBBBBBBB",
    "--------------------",
    "BFFBBBFFFBB--FFBBFBB",
    "--------------------",
    "BBB--BBBBBBBBBBBBBBB",
    "--------------------",
    "FFFFFBBBFFBBBFFFFFBB",
    "M-------------------"
]

addO(CAT_TYPES[L], 0, "pathFinding");
addO(CAT_PARAMS[L], 0, BASIC_SPEED);

TIME_REMAIN_ALL[L] = 120;

// level 4
L = 4;
BLOCK_BIN_MASK[L] = [
    "--------BBF---------",
    "-H--------B-------H-",
    "--------B-B----A----",
    "--------F-B---------",
    "A-------B-B---------",
    "-------BB-BB--------",
    "----BBBBF-FBBBB-----",
    "FBBBBBF-----FBBBFBB-",
    "BB-------M----------",
    "BB-BBBF-----FBBBBBFB",
    "----BBBBF-FBBBB-----",
    "-------BB-BB--------",
    "--------B-B---------",
    "--------B-F---------",
    "--------B-B---------",
    "--------B-B---------",
    "--------B-B---A-----",
    "------A-B-B---------",
    "-H------F-B-------H-",
    "--------B-----------"
]

catNums = [0, 1, 2, 3];
catNums.forEach(i => addO(CAT_TYPES[L], i, "pathFinding"));
catNums.forEach(i => addO(CAT_PARAMS[L], i, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 180;


// level 5
L = 5;
BLOCK_BIN_MASK[L] = [
    "--BB------------BB--",
    "----A--BB----BB---A-",
    "FFFFFFF--------BBBBB",
    "--BBBBBB----------B-",
    "BBB---BB---------B--",
    "BB-----BBB-----BB---",
    "B-------------BB----",
    "-------------BB-----",
    "---BB--M------------",
    "-BBB----------------",
    "----------BBB--BBFFF",
    "--FFFFFF--BB--------",
    "---------BB---BBB---",
    "BBBB--BB------BB---F",
    "BBB-BBBB------------",
    "-BBB--BB---BB----FFA",
    "---BBB--A---BBBBFFFF",
    "-BB-BBB--BB-------FF",
    "BB-------------FFFFF",
    "BB-FF-FFFFFFFFFFFFFF"
]

catNums = [0, 1, 2, 3];
catNums.forEach(i => addO(CAT_TYPES[L], i, "evasive"));
catNums.forEach(i => addO(CAT_PARAMS[L], i, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 180;


// level 6
L = 6;
BLOCK_BIN_MASK[L] = [
    "----F-----B----B-B--",
    "--M-F---B----BB---B-",
    "----B-------B---BB--",
    "----B-B---B----B----",
    "FFBBB---B----B--B---",
    "-------B-------B----",
    "----B---B-B---B-----",
    "--B---B--FFBFF----B-",
    "B---B----F---F-B----",
    "---B-----FA-AF------",
    "-B-------FH-HF--B---",
    "---B-B---FFFFF------",
    "--B----B-----B---B--",
    "---B--B---B---B--B-",
    "-B----B--B----B-B---",
    "--B--B---B--B--B--B-",
    "-----------B--B-----",
    "FFFFFBBBB--BBBBFFFFF",
    "--------B---B-------",
    "-A--------B-------A-"
]

catNums = [0, 1];
catNums.forEach(i => addO(CAT_TYPES[L], i, "evasive"));
catNums.forEach(i => addO(CAT_PARAMS[L], i, BASIC_SPEED));

catNums = [2, 3];
catNums.forEach(i => addO(CAT_TYPES[L], i, "pathFinding"));
catNums.forEach(i => addO(CAT_PARAMS[L], i, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 300;

//L = --;
//BLOCK_BIN_MASK[L] = [
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------",
//    "--------------------"
//]





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