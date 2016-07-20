# gulp-utils [![Build Status](https://travis-ci.org/khalidhoffman/gulp-utils.svg?branch=master)](https://travis-ci.org/khalidhoffman/gulp-utils)
A personal dev library for quicker for development

#### How To Use
1. `npm init` in root folder of WordPress site (or any project... eventually)
2. `git clone https://github.com/khalidhoffman/gulp-utils.git` in root of WordPress site. 
3. `npm install; npm run setup` in newly created gulp-utils project folder. This will create a `gulpfile.js` and `dp-project-config.json` in the parent/root folder.
4. `npm i --save gulp` in root folder

* Run `gulp --tasks` from root folder to see list of tasks.
 
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
    }
  ]
}
```
* 

##### Config Details
* All paths are relative to `paths.basePath`. Paths passed in config are absolute
* `basePath` defaults to `{current working directory}/wp-content/themes/dp-{projectName}`

###### Task Options

Task Names   | Details
-------------|---------
`pug`    	 | additional helper functions are included before compilation
`stylus`	 | additional helper functions are included at compilation
`less`	 	 | compiles first path listed in array
`js`  | beautifies js. overwrites file
`js-bundle`  | bundles and minfies with requirejs. input path should be a path to a requirejs config `build.js`
`jsx`		 | compiles js to same directory as original `.jsx` file
`sass`		 |
`pugjs`		 | additional helper functions are included before compilation
