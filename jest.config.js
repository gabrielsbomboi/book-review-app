module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'routes/**/*.js',
        'middleware/**/*.js',
        'models/**/*.js'
    ],
    coverageDirectory: 'coverage',
    verbose: true
};