# gulp-utils [![Build Status](https://travis-ci.org/khalidhoffman/gulp-utils.svg?branch=master)](https://travis-ci.org/khalidhoffman/gulp-utils)
A personal dev library for quicker for development

#### How To Use
1. run `npm i --save-dev git://github.com/khalidhoffman/gulp-utils.git#dev`
2. Run `dp-setup` within the project's npm environment (add `dp-setup` to npm scripts).
3. Run `gulp --tasks` from root folder to see list of tasks.
 
#### Example Config
```
{
  "name": "project_name"
  "wordpress": {
      "wpThemePrefix": "for_DPPAD_themes",
      "dbTablePrefix": "wp_table_prefix",
      "dbNamePrefix" : "for_wordpress_dev"
  },
  "avocode" : {
      "userSelector": "User's Full Name",
      "projectSelector": "Project_name_to_match_against"
  },
  "workingDir" "/an/absolute/path|default|wordpress",
  "tasks" : [
    {
      "name" : "stylus",
      "input": "relative/path/to/stylus/folder/from/workingDir",
      "output": "relative/path/to/stylesheets/folder/from/workingDir"
    },
    {
      "name" : "pug-php",
      "input": "relative/path/to/pug/folder/from/workingDir",
      "output": "relative/path/to/php/folder/from/workingDir"
    },
    {
      "name" : "jsx",
      "input": "relative/path/to/jsx/folder/from/workingDir",
      "ignore": ["glob/pattern/to/ignore", "**/node_modules/**"]
    }
  ]
}
```
 

##### Config Details
* All paths are relative to `workingDir`. `workingDir` is an absolute path.
* `workingDir` when set to `"default"`, uses the `process.cwd()` (the current working directory)
* `jsx`, `stylus`, `less`, and `js` tasks support an ignore field which is a [glob pattern](https://github.com/isaacs/node-glob#glob-primer) to exclude
* using the predefined value `"wordpress"` for `workingDir`  to `{current working directory}/wp-content/themes/{wpThemePrefix}{projectName}`

###### Task Options

Task Names    | Details
--------------|---------
`pug-php`     | [additional helper functions](lib/pug/helpers/_functions.pug) are saved  and included before compilation. compiles to `.php` files
`stylus-bem`  | [additional helper functions](lib/stylus/lib/stylus/) are included at compilation. compiles to css. Read more about [stylus-bem](https://github.com/khaliddpdev/stylus-bem)
`stylus`      | [additional helper functions](lib/stylus/lib/stylus/) are included at compilation. compiles to css
`css`         | minifies css with cssnano. Will rewrite files with `.min.css` extension. Accepts path to single file or folder relative to workingDir for input
`less`        | compiles less to css. will prompt for filename.
`js`          | beautifies js, overwriting file
`requirejs`   | bundles and minfies with requirejs. input path should be a path to a requirejs config `build.js`
`webpack`  | bundles with webpack. input path should be a path to a webpack config file
`compass`     | compiles to css
`jsx`         | compiles to `.js` in same directory as original `.jsx` file
`sass`        | compiles to css
`pug-ejs`     | [additional helper functions](lib/pug/helpers/_functions.pug) are saved  and included before compilation. compiles to `.ejs` files
`pug-html`    | [additional helper functions](lib/pug/helpers/_functions.pug) are saved  and included before compilation. compiles to `.html` files
`pug`         | beautifies pug files. Overwrites file
`jade-php`    | [additional helper functions](lib/jade/helpers/_functions.jade) are saved  and included before compilation. compiles to `.php` files
`jade-ejs`    | [additional helper functions](lib/jade/helpers/_functions.jade) are saved  and included before compilation. compiles to `.ejs` files
`jade-html`   | [additional helper functions](lib/jade/helpers/_functions.jade) are saved  and included before compilation. compiles to `.html` files
`html-2-pug`  | compiles `.html` files to `.pug` files
`php-2-pug`   | compiles `.php` files to `.pug` files
