// starting board configs
const BLOCK_BIN_MASK = [];
const TIME_REMAIN_ALL = [];

let L, catNums;
let BASIC_SPEED = {"speed": "slow"};

const CAT_TYPES = {};
const CAT_PARAMS = {};
for (let i = 0; i <= MAX_LVL; i++) {
    CAT_TYPES[i] = {};
    CAT_PARAMS[i] = {};
}

function addCatInfo(obj, n, info) {
    obj[ID_RANGE_CAT[0] + n] = info;
}



/* level descriptions (layout, cat info, time) */

// level 1
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
    "----BBBBBBB-H----A--",
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

addCatInfo(CAT_TYPES[L], 0, "basic");
addCatInfo(CAT_PARAMS[L], 0, BASIC_SPEED);

TIME_REMAIN_ALL[L] = 180;

// level 2
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
catNums.forEach(n => addCatInfo(CAT_TYPES[L], n, "basic"));
catNums.forEach(n => addCatInfo(CAT_PARAMS[L], n, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 180;

// level 3
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
catNums.forEach(n => addCatInfo(CAT_TYPES[L], n, "basicFast"));
catNums.forEach(n => addCatInfo(CAT_PARAMS[L], n, BASIC_SPEED));
catNums = [3, 4];
catNums.forEach(n => addCatInfo(CAT_TYPES[L], n, "basic"));
catNums.forEach(n => addCatInfo(CAT_PARAMS[L], n, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 240;

// level 4
L = 3;
BLOCK_BIN_MASK[L] = [
    "FFFFFF--FFFFFFFF----",
    "-H-A-----------A--H-",
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

catNums = [0, 1];
catNums.forEach(i => addCatInfo(CAT_TYPES[L], i, "pathFinding"));
catNums.forEach(i => addCatInfo(CAT_PARAMS[L], i, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 120;

// level 5
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
catNums.forEach(i => addCatInfo(CAT_TYPES[L], i, "pathFinding"));
catNums.forEach(i => addCatInfo(CAT_PARAMS[L], i, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 180;


// level 6
L = 5;
BLOCK_BIN_MASK[L] = [
    "--BB------------BB--",
    "-------BB---BB------",
    "FFFFFFF--------B--BB",
    "--BBBBBB-----BB---B-",
    "BBB---BB---------B--",
    "BB-----BBB-----BB---",
    "B-------------BB--A-",
    "-------------BB----A",
    "---BB------------A--",
    "-BBB--------------A-",
    "----------BBB--BBFFF",
    "--FFFFFF--BB--------",
    "---------BB---BBB---",
    "BBBB--BB------BB---F",
    "BBB-BBBB----------FF",
    "-BBB--BB---BB----FFF",
    "---BBB------BBBBFFFF",
    "-BB-BBB--BB-------FF",
    "BB-------------FFFFF",
    "BBMFF-FFFFFFFFFFFFFF"
]

catNums = [0, 1, 2, 3];
catNums.forEach(i => addCatInfo(CAT_TYPES[L], i, "evasive"));
catNums.forEach(i => addCatInfo(CAT_PARAMS[L], i, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 180;


// level 7
L = 6;
BLOCK_BIN_MASK[L] = [
    "----F-----B----B-B--",
    "--M-F---B----BB---B-",
    "----B-------B---BB--",
    "----B-B---B----B----",
    "FFBBB---B----B--B---",
    "-------B-------B----",
    "----B---B--B--B-----",
    "--B---B--FFBFF----B-",
    "B---B----F---F-B----",
    "---B-----FA-AF------",
    "-B-------FHHHF--B---",
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
catNums.forEach(i => addCatInfo(CAT_TYPES[L], i, "evasive"));
catNums.forEach(i => addCatInfo(CAT_PARAMS[L], i, BASIC_SPEED));

catNums = [2, 3];
catNums.forEach(i => addCatInfo(CAT_TYPES[L], i, "pathFinding"));
catNums.forEach(i => addCatInfo(CAT_PARAMS[L], i, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 300;

// level 8
L = 7;
BLOCK_BIN_MASK[L] = [
    "----AA------AA------",
    "--FFFFFF---FFFFFFF--",
    "-------F---F--------",
    "FFFFFF-F-M-F--FFFF--",
    "-------F---F--FH----",
    "-FFF-FFF---F----HF--",
    "----B--F---F--FFFF--",
    "B------F---F----A---",
    "---A--FF---FFFFFFFFF",
    "FHBFHFFF---F--------",
    "FFFFFFFF---F--BFFF--",
    "--A----F---F--FF----",
    "--FFF--F---F--FHHF--",
    "--FH---F---F--FFFF--",
    "--FFF--F---F-----A--",
    "---HF--F---FFFF--FFF",
    "--FFF--F---F-B-B-B--",
    "-------F---F--B-B-B-",
    "--FFFFFF---FFFFFFF--",
    "--------------------"
]

catNums = [0, 1, 2, 3, 4, 5];
catNums.forEach(i => addCatInfo(CAT_TYPES[L], i, "evasive"));
catNums.forEach(i => addCatInfo(CAT_PARAMS[L], i, BASIC_SPEED));

catNums = [6, 7];
catNums.forEach(i => addCatInfo(CAT_TYPES[L], i, "pathFinding"));
catNums.forEach(i => addCatInfo(CAT_PARAMS[L], i, BASIC_SPEED));

TIME_REMAIN_ALL[L] = 120;

// level 9
L = 8;
BLOCK_BIN_MASK[L] = [
    "FFFFFFFFFFFFFFFFFFFF",
    "F-AHF---FHHF-HAF---F",
    "F---F---F--F---F---F",
    "FBBBFBBBF--FBBBFBBBF",
    "F------------------F",
    "F-------FFFF-------F",
    "F---F----------F---F",
    "F---F----------F---F",
    "F---F---FBBF---F---F",
    "F---F---B--B---F---F",
    "F---F---BM-B---F---F",
    "F---F---FBBF---F---F",
    "F---F----------F---F",
    "F---F----------F---F",
    "F-------FFFF-------F",
    "F------------------F",
    "FBBBFBBBF--FBBBFBBBF",
    "F-A-F---F--F-A-F---F",
    "FH--F---FHHFH--F---F",
    "FFFFFFFFFFFFFFFFFFFF"
];

TIME_REMAIN_ALL[L] = 120;

catNums = [0, 1, 2, 3];
catNums.forEach(i => addCatInfo(CAT_TYPES[L], i, "strong"));
catNums.forEach(i => addCatInfo(CAT_PARAMS[L], i, BASIC_SPEED));

// level 10
L = 9
BLOCK_BIN_MASK[L] = [
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