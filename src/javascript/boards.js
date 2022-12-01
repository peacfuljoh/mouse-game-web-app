// starting board configs
const BLOCK_BIN_MASK = [];

// level 0
BLOCK_BIN_MASK[0] = [
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

// level 1
BLOCK_BIN_MASK[1] = [
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

const MAX_LVL = BLOCK_BIN_MASK.length - 1;