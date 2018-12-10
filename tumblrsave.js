/**
 * Backup and save Tumblr blog
 */

const commandLineArgs = require("command-line-args");
const fs = require("fs-extra");
const request = require("request-promise");
const xml2js = require("xml2js-es6-promise");

const package = require(__dirname + "/package.json");

const optionDefs = [
    {
        name: "verbose", 
        alias: "v", 
        type: Boolean, 
        defaultValue: false
    }, 
    {
        name: "src", 
        alias: "s", 
        type: String
    }, 
    {
        name: "help", 
        alias: "h", 
        type: Boolean, 
        defaultValue: false
    }, 
    {
        name: "number", 
        alias: "n", 
        type: Number, 
        defaultValue: 50
    }
];

async function doRun() {

    var baseUrl = options.src + "/api/read?num=" + options.number;

    var blog = {
        posts: []
    };
    
    /**
     * Let's fetch 
     */
    var start = 0;
    var total = 1; // Will be set to real value after first request
    while (start < total) {
        requestUrl = baseUrl + "&start=" + start;

        var rawResponse;
        try {
            options.verbose && console.log("Requesting: %j", requestUrl);
            rawResponse = await request(requestUrl);
        } catch (err) {
            console.error("Got request error: %j", err);
            process.exit(1);
        }

        var jsonResponse;
        try {
            jsonResponse = await xml2js(rawResponse);
        } catch (err) {
            console.error("XML Parse error: %j", err);
            process.exit(2);
        }

        /**
         * Update total if needed
         */
        if (total === 1) {
            total = parseInt(jsonResponse.tumblr.posts[0].$.total);
            options.verbose && console.log("Total set to ", total);
        }

        /**
         * Update blog title if needed
         */
        if (!blog.title) {
            blog.title = tumblr.tumblelog.$.title;
        }

        /**
         * Update blog name if needed
         */
        if (!blog.name) {
            blog.name = tumblr.tumblelog.$.name;
        }

        // Go through posts
        options.verbose && console.log("Going through " + jsonResponse.tumblr.posts[0].post.length + " posts");

        for (var postNumber = 0, len = jsonResponse.tumblr.posts[0].post.length; postNumber < len; ++postNumber) {
            var origPost = jsonResponse.tumblr.posts[0].post[postNumber];

            console.log("Original post: ", JSON.stringify(origPost, null, 2));

        }

        start += options.number;

    }
}

var options = commandLineArgs(optionDefs);

options.verbose && console.log("Command line options: %j", options);

if (options.help) {
    console.log("Usage: tumblrsave [-v|--verbose] [-s|--src tumblr_url]")
} else {
    doRun();
}

/**
 * vim: ts=4 et nowrap autoindent
 */