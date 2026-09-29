/**
 * Calculate the predicted value of a given x using simple linear regression.
 *
 * @param X - array of independent variable data
 * @param Y - array of dependent variable data
 * @param x - value of independent variable to predict
 * @returns predicted value of dependent variable
 */
const simpleLinearRegression = (X: number[], Y: number[], x: number): number => {
    let greterindex = -1;
    let lessindex = -1;

    for (let i = 0; i < X.length; i++) {
        if (X[i] > x) {
            greterindex = i;
            break;
        }
    }

    for (let i = X.length - 1; i >= 0; i--) {
        if (X[i] < x) {
            lessindex = i;
            break;
        }
    }

    if (greterindex === -1) {
        greterindex = lessindex + 1;
        if (lessindex === X.length - 1) {
            lessindex = X.length - 2;
            greterindex = X.length - 1;
        }
    }
    if (lessindex === -1) {
        lessindex = greterindex - 1;
        if (greterindex === 0) {
            greterindex = 1;
            lessindex = 0;
        }
    }

    const ydiff = Y[greterindex] - Y[lessindex];

    const xdiff = X[greterindex] - X[lessindex];
    const m = ydiff / xdiff;
    const mx1 = m * X[greterindex];
    const c = Y[greterindex] - mx1;

    // if (n !== Y.length || n === 0) {
    //     return 0;
    // }

    // // Calculate means
    // const meanX = X.reduce((acc, val) => acc + val, 0) / n;
    // const meanY = Y.reduce((acc, val) => acc + val, 0) / n;

    // let covariance = 0;
    // let variance = 0;

    // for (let i = 0; i < n; i++) {
    //     covariance += (X[i] - meanX) * (Y[i] - meanY);
    //     variance += (X[i] - meanX) ** 2;
    // }

    // if (variance === 0) {
    //     return 0;
    // }

    // const beta1 = covariance / variance;
    // const beta0 = meanY - beta1 * meanX;
    return m * x + c;
};

export {simpleLinearRegression};
