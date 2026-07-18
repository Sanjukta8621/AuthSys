// utils/catchAsync.js

// HOF — takes async function, returns new function that catches errors
function catchAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next)
        // .catch(next) passes any error to Express error handler
    }
}

module.exports = catchAsync