module.exports = function(grunt) {
    "use strict";

    var livereload = {
        host: 'localhost',
        port: 35729
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        build: {
            all: {
                dest: "js/emojionearea.js"
            }
        },
        uglify: {
            all: {
                files: {
                    "js/emojionearea.min.js": ["js/emojionearea.js"]
                },
                options: {
                    preserveComments: false,
                    sourceMap: true,
                    ASCIIOnly: true,
                    sourceMapName: "js/emojionearea.min.map",
                    report: "min",
                    beautify: {
                        "ascii_only": true
                    },
                    banner: "/*! EmojioneArea v<%= pkg.version %> | MIT license */",
                    compress: {
                        "hoist_funs": false,
                        loops: false,
                        unused: false
                    }
                }
            }
        },
        sass: {
            all: {
                options: {
                    unixNewlines: true,
                    compass: true,
                    lineNumbers: true
                },
                files: {
                    'css/emojionearea.css': 'scss/emojionearea.scss'
                }
            },
        },
        cssmin: {
            target: {
                files: {
                    'css/emojionearea.min.css': ['css/emojionearea.css']
                },
                options: {
                    sourceMap: false
                }
            }
        },
        watch: {
            all: {
                files: [
                    'scss/**/*.scss'
                ],
                tasks: ['sass'],
                options: {
                    livereload: livereload
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadTasks("tasks");

    grunt.registerTask("default", ["build", "uglify", "sass", "cssmin"]);
};
