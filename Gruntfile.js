/*jshint node:true*/
module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-simple-mocha');

	grunt.initConfig({
		test: {
			options: {
        ignoreLeaks: false
      , ui: 'bdd'
      , reporter: 'spec'
      }
    , all: { src: ['test/**/*-test.js'] }
    }
	});

  grunt.renameTask('simplemocha', 'test');

	grunt.registerTask('default', ['test']);
};