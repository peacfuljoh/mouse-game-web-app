

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
