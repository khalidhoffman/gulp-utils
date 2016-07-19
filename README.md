# gulp-utils [![Build Status](https://travis-ci.org/khalidhoffman/gulp-utils.svg?branch=master)](https://travis-ci.org/khalidhoffman/gulp-utils)
A personal dev library for quicker for development

#### Example Config
```
{
  "name": "project_name"
  "prefix": "wp_table_prefix",
  "dbNamePrefix" : "for_wordpress_dev",
  "avocodeSelector" : "for_avocode_dev",
  "paths" : {
  	"basePath" "absolute/path",
    "inputs" : {
      "pug" : "absolute/path/to/pug/src"
    },
    "outputs" : {
      "php" : "absolute/path/to/pug/output"
    }
  }
}
```
* `name` field should match wp structure `wp-content/themes/dp-{project_name}/`

##### Config Details
* all inputs should be array of strings
* all output values should be a single string path
* Paths passed in config are joined with defaults
* All default paths are relative to `paths.basePath`. Paths passed in config are absolute

Input Fields | Default Input  | Output Fields | Default Output								 | Details
-------------|---------------|---------------|-----------------------------------------------|---------
`pug`    	 |`["pug/"]`	 |`php`			 |`./`											 |additional helper functions are included before compilation
`less`	 	 |`["less/"]`	 |`css`			 |`stylesheets/`								 | compiles first path listed in array
`jsx`		 |`["js/src/"]`	 |`null`		 |`null`										 | outputs to same directory
`js`		 |`["js/src/"]`	 |`js`			 |`js/`											 | bundles and minfies with requirejs
`sass`		 |`["sass/"]`	 |`css`			 |`stylesheets/`								 |
`stylus`	 |`["stylus/"]`	 |`css`			 |`stylesheets/`								 | additional helper functions are included at compilation
`pugjs`		 |`["js/src/modules/views/html/"]`|`js`|`js/src/modules/views/html/` 			 | additional helper functions are included before compilation
