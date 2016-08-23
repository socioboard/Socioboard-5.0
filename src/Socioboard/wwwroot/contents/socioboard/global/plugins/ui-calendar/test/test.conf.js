// Contents of: config/karma.conf.js
module.exports = function (config) {
  config.set({
    basePath : '..',
    files : [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/moment/moment.js',
        'bower_components/fullcalendar/dist/fullcalendar.js',
        'src/calendar.js',
        'test/*.spec.js'
    ],

    singleRun : true,

    browsers : ['Chrome'],

    frameworks : ["jasmine"],

    preprocessors : {
        '**/src/*.js': 'coverage'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit'
    reporters : ['progress', 'coverage']

  });
};