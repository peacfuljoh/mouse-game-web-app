/* MATH, GEOMETRY */
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

function subVec(x, y) {
    return x.map((e, i) => e - y[i]);
}

function addVec(x, y) {
    return x.map((e, i) => e + y[i]);
}



/* SLEEP */
function sleepLock(locksObj, lockName, func, dur=200) {
    if (!locksObj[lockName]) { func(); return; }
    setTimeout(sleepLock, dur, locksObj, lockName, func, dur)
}


/* OTHER */
function getNeighborIdxLimits(pos) {
    let i_start = (pos[0] == 0) ? 0 : pos[0] - 1;
    let i_end = (pos[0] == GRIDSIZE[0] - 1) ? GRIDSIZE[0] - 1 : pos[0] + 1;
    let j_start = (pos[1] == 0) ? 0 : pos[1] - 1;
    let j_end = (pos[1] == GRIDSIZE[1] - 1) ? GRIDSIZE[1] - 1 : pos[1] + 1;
    return [i_start, i_end, j_start, j_end];
}
