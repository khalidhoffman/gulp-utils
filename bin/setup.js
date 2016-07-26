var path = require('path'),
    fs = require('fs');


fs.readFile(path.resolve(__dirname, '../', '_gulpfile.js'), {encoding: 'utf8'}, function(err, gulpSrc){
    if(err) throw err;
    fs.writeFile(path.resolve(process.cwd(), 'gulpfile.js'), gulpSrc, function(err){
        if(err) throw err;
    })
});

fs.readFile(path.resolve(__dirname, '../', '_dp-project-config.json'), {encoding: 'utf8'}, function(err, configSrc){
    if(err) throw err;
    fs.writeFile(path.resolve(process.cwd(), 'dp-project-config.json'), configSrc, function(err){
        if(err) throw err;
    })
});