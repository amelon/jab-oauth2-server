/*jshint node:true*/
module.exports = function (grunt) {
	'use strict';

  grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
		simplemocha: {
			options: {
        ignoreLeaks: false
      , ui: 'bdd'
      , reporter: 'dot'
      // , reporter: 'spec'
      }
    , all: { src: ['test/**/*-test.js'] }
    }

  , watch: {
      test: {
        files: ['*.js', 'test/*.js']
      , tasks: ['simplemocha']
      , options: {
          interrupt: true
        }
      }
    }
	});

	grunt.registerTask('default', ['simplemocha', 'watch']);
};