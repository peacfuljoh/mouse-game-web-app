// global constants
const GRIDSIZE = [20, 20]; // height, width

const MOUSE_PX_LEFT0 = 3;
const MOUSE_PX_TOP0 = 3;
const MOUSE_PX_PER_CELL = 30;

const BLOCK_PX_LEFT0 = 2;
const BLOCK_PX_TOP0 = 2;
const BLOCK_PX_PER_CELL = 29.95;

const INIT_LVL = 0;
const MAX_LVL = 6;
//const MAX_LVL = 0;

const SYMBOL_BLOCK = "B";
const SYMBOL_BLOCK_FIXED = 'F';
const SYMBOL_CHEESE = "H";
const SYMBOL_CAT = "A";
const SYMBOL_MOUSE = "M";

const ID_RANGE_BLOCK = [1, 400];
const ID_RANGE_CHEESE = [401, 450];
const ID_RANGE_CAT = [451, 500];
const ID_RANGE_BLOCK_FIXED = [501, 900];

const VAL_CHEESE = 20;

const timeToScoreFactor = 0.2;

const ASSET_DIR = "assets/";

const ASSET_PATH_MOUSE = ASSET_DIR + "mouse-animal-icon-9.jpg";
const ASSET_PATH_BLOCK = ASSET_DIR + "block.png";
const ASSET_PATH_BLOCK_FIXED = ASSET_DIR + "block_fixed.png";
const ASSET_PATH_CHEESE = ASSET_DIR + "cheese.png";
const ASSET_PATH_CAT_BASIC = ASSET_DIR + "cat.png";
const ASSET_PATH_CAT_PATH_FINDING = ASSET_DIR + "cat_path_finding.png";
const ASSET_PATH_CAT_EVASIVE = ASSET_DIR + "cat_evasive.png";
const ASSET_PATH_GRID = ASSET_DIR + "play_grid.png";

DETECT_RADIUS = 8;

const CAT_MOVE_BASIC_SLOW_MIN = 800;
const CAT_MOVE_BASIC_SLOW_RANGE = 800;
const CAT_MOVE_BASIC_FAST_MIN = 500;
const CAT_MOVE_BASIC_FAST_RANGE = 200;

