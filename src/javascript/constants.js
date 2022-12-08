// global constants
const GRIDSIZE = [20, 20]; // height, width

const MOUSE_PX_LEFT0 = 3;
const MOUSE_PX_TOP0 = 3;
const MOUSE_PX_PER_CELL = 30;

const BLOCK_PX_LEFT0 = 2;
const BLOCK_PX_TOP0 = 2;
const BLOCK_PX_PER_CELL = 29.95;

const MAX_LVL = 9;
const INIT_LVL = 0;

const SYMBOL_BLOCK = "B";
const SYMBOL_BLOCK_FIXED = 'F';
const SYMBOL_CHEESE = "H";
const SYMBOL_CAT = "A";
const SYMBOL_MOUSE = "M";
const SYMBOL_DEN = "D";

const ID_RANGE_BLOCK = [1, 400];
const ID_RANGE_CHEESE = [401, 450];
const ID_RANGE_CAT = [451, 500];
const ID_RANGE_BLOCK_FIXED = [501, 900];
const ID_RANGE_DEN = [901, 1000];

const CAT_MOVE_BASIC_SLOW_MIN = 800;
const CAT_MOVE_BASIC_SLOW_RANGE = 800;
const CAT_MOVE_BASIC_FAST_MIN = 500;
const CAT_MOVE_BASIC_FAST_RANGE = 200;
const CAT_MOVE_BASIC_VERY_FAST_MIN = 350;
const CAT_MOVE_BASIC_VERY_FAST_RANGE = 100;


/* adjustable constants */
const VAL_CHEESE = 50;
const timeToScoreFactor = 0.2;

const DETECT_RADIUS = 7;
const DETECT_RADIUS_SMALL = 5;

const HARD_MODE = false; // allows for level progression despite remaining cats when time runs out



/* asset paths */
const ASSET_DIR = "assets/";
const ASSET_DIR_IM = ASSET_DIR + 'images/';
const ASSET_DIR_AUD = ASSET_DIR + 'audio/';

const ASSET_PATH_MOUSE = ASSET_DIR_IM + "mouse-animal-icon-9.jpg";
const ASSET_PATH_BLOCK = ASSET_DIR_IM + "block.png";
const ASSET_PATH_BLOCK_FIXED = ASSET_DIR_IM + "block_fixed.png";
const ASSET_PATH_CHEESE = ASSET_DIR_IM + "cheese.png";
const ASSET_PATH_CAT_BASIC = ASSET_DIR_IM + "cat.png";
const ASSET_PATH_CAT_PATH_FINDING = ASSET_DIR_IM + "cat_path_finding.png";
const ASSET_PATH_CAT_EVASIVE = ASSET_DIR_IM + "cat_evasive.png";
const ASSET_PATH_CAT_STRONG = ASSET_DIR_IM + "cat_strong.png";
const ASSET_PATH_GRID = ASSET_DIR_IM + "play_grid.png";
const ASSET_PATH_DEN = ASSET_DIR_IM + "cat_den.png";

const ASSET_PATH_CAT_BASIC_AUD = [1, 2, 3, 4, 5, 6].map(
    n => ASSET_DIR_AUD + '383427__deleted-user-7146007__cat-meow-meowing-' + n + '.wav'
);

const ASSET_PATH_CAT_PATH_FINDING_AUD = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
    n => ASSET_DIR_AUD + 'cat_axe-' + n + '.wav'
);

const ASSET_PATH_CAT_EVASIVE_AUD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
    n => ASSET_DIR_AUD + 'scaredycat-' + n + '.wav'
);

const ASSET_PATH_CAT_STRONG_AUD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10].map(
    n => ASSET_DIR_AUD + 'Lion-' + n + '.wav'
);
