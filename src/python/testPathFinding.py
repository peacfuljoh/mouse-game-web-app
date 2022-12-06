"""
Dijkstra's shortest path for cat (port from Javascript)
"""

from pprint import pprint

import numpy as np



mousePos = [7, 2]
catPos = [8, 16]

BLOCK_BIN_MASK = [
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
]

iter = 0




def catMoveFuncPathFinding():
    # init free space mask (0 = occupied, 1 = free, node = node)
    dMask = []
    for i in range(20):
        dMask.append([])
        for j in range(20):
            dMask[i].append(int(BLOCK_BIN_MASK[i][j] in ["-", "M"]))

    # init node list
    inner_iter = 0

    nodeList = [catPos]
    dMask[catPos[0]][catPos[1]] = PathFindingNode(catPos)
    while (True):
        inner_iter += 1

        # failed to find mouse
        if len(nodeList) == 0:
            return None

        # choose lowest-cost node from active list
        nextIndex = np.argmin([dMask[pos[0]][pos[1]].cost for pos in nodeList])
        i, j = nodeList[nextIndex]
        del nodeList[nextIndex]

        # check for mouse and backtrack, otherwise expand
        if (mousePos[0] == i and mousePos[1] == j):
            fullPath = [[i, j]]
            node = dMask[i][j]
            print(node.cost)
            while node.parent.parent is not None:
                node = node.parent
                fullPath.append(node.pos)
            pprint(fullPath)
            return node.pos
        else:
            newHeadNodes = dMask[i][j].expand(dMask)
            nodeList += newHeadNodes

        # populate debug info
        if 0:#np.mod(inner_iter, 10) == 0:
            debug_str = showProgress(dMask)
            print(debug_str)
            a = 5




def showProgress(dMask):
    debug_str = ''
    for i in range(20):
        costs = ''
        parents = ''
        for j in range(20):
            node = dMask[i][j]
            cost_new = 0
            parent_new = '..'
            if isinstance(node, PathFindingNode):
                cost_new = int(np.round(10 * node.cost))
                if node.parent is not None:
                    parent_new = getParentId(node.parent.pos[0] - node.pos[0],
                                             node.parent.pos[1] - node.pos[1])
            if dMask[i][j] == 0:
                cost_new = '::'
                parent_new = '::'
            cost_new = str(cost_new)
            cost_new += ' ' * (4 - len(cost_new))
            costs += cost_new
            parents += parent_new + ' '
        debug_str += costs + '     ' + parents + '\n'
    return debug_str




class PathFindingNode():
    def __init__(self, pos, parent=None, cost=0):
        self.pos = pos; # [i, j]
        self.parent = parent; # PathFindingNode instance
        self.cost = cost; # Number
    
    def expand(self, mask):
        i_start = self.pos[0] - 1;
        i_end = self.pos[0] + 1;
        if self.pos[0] == 0:
            i_start = 0
        if self.pos[0] == 20 - 1:
            i_end = 20 - 1
        j_start = self.pos[1] - 1;
        j_end = self.pos[1] + 1;
        if self.pos[1] == 0:
            j_start = 0;
        if self.pos[1] == 20 - 1:
            j_end = 20 - 1;
        newNodes = [];
        for i in range(i_start, i_end + 1):
            for j in range(j_start, j_end + 1):
                if (mask[i][j] == 1): # unoccupied
                    costMove = getCatMoveCost(self.pos, [i, j]);
                    mask[i][j] = PathFindingNode([i, j], self, self.cost + costMove);
                    newNodes.append([i, j])
                elif (isinstance(mask[i][j], PathFindingNode)):
                    costMove = getCatMoveCost(self.pos, [i, j]);
                    if (self.cost + costMove < mask[i][j].cost):
                        mask[i][j].parent = self;
                        mask[i][j].cost = self.cost + costMove;
        return newNodes;

def getCatMoveCost(x, y):
    if x[0] == y[0] or x[1] == y[1]:
        return 1.0
    else:
        return np.sqrt(2)

def getParentId(v, h):
    if v == -1 and h == -1:
        return 'TL'
    if v == -1 and h == 0:
        return 'T '
    if v == -1 and h == 1:
        return 'TR'
    if v == 0 and h == -1:
        return 'L '
    if v == 0 and h == 1:
        return 'R '
    if v == 1 and h == -1:
        return 'BL'
    if v == 1 and h == 0:
        return 'B '
    if v == 1 and h == 1:
        return 'BR'


def mainFunc():
    global iter, catPos
    iter += 1
    while (catPos != mousePos):
        newPos = catMoveFuncPathFinding()

        i, j = catPos
        s = [c for c in BLOCK_BIN_MASK[i]]
        s[j] = '-'
        BLOCK_BIN_MASK[i] = s
        # BLOCK_BIN_MASK[i][j] = '-'

        i, j = newPos
        s = [c for c in BLOCK_BIN_MASK[i]]
        s[j] = 'A'
        BLOCK_BIN_MASK[i] = s
        # BLOCK_BIN_MASK[i][j] = 'A'

        catPos = newPos



if __name__ == '__main__':
    mainFunc()


