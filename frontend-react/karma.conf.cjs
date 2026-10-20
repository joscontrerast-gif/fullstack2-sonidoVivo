
module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'src/**/*.spec.js',
      'src/**/*.spec.jsx'
    ],

    preprocessors: {
      'src/**/*.spec.js': ['webpack'],
      'src/**/*.spec.jsx': ['webpack']
    },

    webpack: require('./webpack.config.cjs'),

    reporters: ['progress', 'coverage'],

    browsers: ['ChromeHeadless'],

    singleRun: true,

    restartOnFileChange: true,

    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'text-summary' },
        { type: 'html', subdir: 'html' }
      ]
    }
  });
};
