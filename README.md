# gulp-utils [![Build Status](https://travis-ci.org/khalidhoffman/gulp-utils.svg?branch=master)](https://travis-ci.org/khalidhoffman/gulp-utils)
A personal dev library for quicker for development

#### How To Use
1. run `npm i --save-dev git://github.com/khalidhoffman/gulp-utils.git`
2. Run `dp-setup` within the project's npm environment (add `dp-setup` to npm scripts).
3. Run `gulp --tasks` from root folder to see list of tasks.
 
#### Example Config
```
{
  "name": "project_name"
  "prefix": "wp_table_prefix",
  "dbNamePrefix" : "for_wordpress_dev",
  "avocodeSelector" : "for_avocode_dev",
  "basePath" "/an/absolute/path",
  "tasks" : [
    {
      "name" : "stylus",
      "input": "relative/path/to/stylus/folder/from/basePath",
      "output": "relative/path/to/stylesheets/folder/from/basePath"
    },
    {
      "name" : "pug",
      "input": "relative/path/to/pug/folder/from/basePath",
      "output": "relative/path/to/php/folder/from/basePath"
    },
    {
      "name" : "jsx",
      "input": "relative/path/to/jsx/folder/from/basePath",
      "ignore": ["glob/pattern/to/ignore", "**/node_modules/**"]
    }
  ]
}
```
* 

##### Config Details
* All paths are relative to `basePath`. `basePath` is an absolute path.
* `basePath` when set to `"default"`, uses the `process.cwd()` (the current working directory)
* `jsx`, `stylus`, `less`, and `js` tasks support an ignore field which is a [glob pattern](https://github.com/isaacs/node-glob#glob-primer) to exclude
* using the predefined value `"wordpress"` for `basePath`  to `{current working directory}/wp-content/themes/dp-{projectName}`

###### Task Options

Task Names    | Details
--------------|---------
`pug`         | [additional helper functions](lib/pug/helpers/_functions.pug) are saved  and included before compilation. compiles to `.php` files
`stylus`      | [additional helper functions](lib/stylus/lib/stylus/) are included at compilation. compiles to css
`less`        | compiles to css
`js`          | beautifies js. Overwrites file
`js-bundle`   | bundles and minfies with requirejs. input path should be a path to a requirejs config `build.js`
`compass`     | compiles to css
`jsx`         | compiles js to same directory as original `.jsx` file
`sass`        | compiles to css
`pug-ejs`     | [additional helper functions](lib/pug/helpers/_functions.pug) are saved  and included before compilation. compiles to `.ejs` files
`pug-html`    | [additional helper functions](lib/pug/helpers/_functions.pug) are saved  and included before compilation. compiles to `.html` files
`pug-beautify`| beautifies pug files. Overwrites file
`jade`        | [additional helper functions](lib/jade/helpers/_functions.jade) are saved  and included before compilation. compiles to `.php` files
`jade-ejs`    | [additional helper functions](lib/jade/helpers/_functions.jade) are saved  and included before compilation. compiles to `.ejs` files
`jade-html`   | [additional helper functions](lib/jade/helpers/_functions.jade) are saved  and included before compilation. compiles to `.html` files
`html-2-pug`  | compiles `.pug` files to `.html` files
`php-2-pug`   | compiles `.pug` files to `.php` files
`ftp`         | uploads files from input to output relative to ftp root. ftp root is configured with `dp-ftp-config.json`. `dp-ftp-config.json` is generated during the setup process. More Info is posted on [the github page](https://github.com/khalidhoffman/ftp-sync)
