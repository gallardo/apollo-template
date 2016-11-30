
var modules = {};

var themes = [];
var sassSrc = [];
var cssSrc = [];
var jsSrc = [];
var resources = [];

var themeSassSrc = [];
var themeCssSrc = [];
var themeConcatTasks = [];

var grunt;
var deployTarget;
var buildDir;
var moduleDir;

var path = require('path');

exports.initGrunt = function(_grunt, _buildDir) {

    grunt = _grunt;
    
    moduleDir = path.normalize(process.cwd()) + '/';
    buildDir = path.normalize(moduleDir + _buildDir);

    if (grunt.option('verbose')) {
        console.log('OpenCms module source directory: ' + moduleDir);
        console.log('OpenCms module build directory : ' + buildDir);

        require('time-grunt')(grunt);
    }

    _gruntLoadNpmTasks();
}

_getModuleThemes = function(envname, themes) {
    console.log('Value of env ' + envname + ': ' + process.env[envname]);
    if (grunt.option('useenv') && process.env[envname]) {
        return [ process.env[envname] ];
    } 
    return themes;
};

exports.loadModule = function(moduleName) {
    
    var f = path.normalize(moduleDir + moduleName + '/Gruntparts.js');

    if (grunt.option('verbose')) {
        console.log('Loading OpenCms module: ' + f);
    }
    
    try {
        var m = require(f);
        
        modules[_moduleName(m.mf)] = m;
        
        if (m.sassSrc) {
            sassSrc = sassSrc.concat(m.sassSrc);
        }
        if (m.cssSrc) {
            cssSrc = cssSrc.concat(m.cssSrc);
        }
        if (m.jsSrc) {
            jsSrc = jsSrc.concat(m.jsSrc);
        }
        if (m.resources) {
            resources = resources.concat(m.resources);
        }
        if (m.themes) {
            themes = themes.concat(_getModuleThemes(m.envname, m.themes));
        }
        if (m.deployTarget) {
            exports.deployTarget = deployTarget = m.deployTarget;
        }

        return m;
        
    } catch (err) {
        grunt.log.errorlns('Error: ' + err.message);
    }
}

exports.registerGruntTasks = function() {
    
    _gruntInitConfig();
    _gruntRegisterTasks();
        
    if (grunt.option('verbose')) {
        _showImports();
    }    
}

_moduleName = function(mf) {

    return mf.split('/').slice(-1);
}

_gruntLoadNpmTasks = function() {

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
}

_gruntInitConfig = function() {

    // Project configuration
    grunt.initConfig({
            
        clean : {
            all : [ buildDir + '**' ],
            theme : {
                files : [ {
                    expand : true,
                    src : [ '*.css', '*.css.map' ],
                    filter : 'isFile',
                } ],
            },
        },
        
        copy : {
            resources : {
                files : [ {
                    expand : true,
                    src : oc.resources(),
                    dest : buildDir + '03_final',
                    rename: function (dest, src) {
                        // TODO: determine and remove the 'appollo-src' folder part dynamically
                        src = src.replace(moduleDir + 'apollo-src', '/');
                        return dest + src;
                    },
                    filter : 'isFile'
                } ],
            },
            save : {
                files : [ {
                    expand : true,
                    src : [ '*.css', '*.css.map' ],
                    dest : buildDir + '02_minified',
                    filter : 'isFile',
                } ],
            },
            restore : {
                files : [ {
                    expand : true,
                    cwd : buildDir + '02_minified',
                    src : [ '*.css', '*.css.map' ],
                    dest : moduleDir,
                    filter : 'isFile',
                } ],
            },            
            deploy : {
                files : [ {
                    expand : true,
                    cwd : buildDir + '03_final/',
                    src : [ '**' ],
                    dest : oc.deployTarget,
                } ]
            }
        },
        
        sass : {
            theme : {
                options : {
                    sourcemap : 'auto',
                    lineNumbers : false,
                    style : 'nested',
                },
                files : [ {
                    expand : true,
                    cwd : moduleDir,
                    src : oc.themeSassSrc(),
                    dest : buildDir + '01_processed',
                    ext : '.css',
                    flatten: true
                } ]
            },
            csscheck : {
                options : {
                    sourcemap : 'auto',
                    lineNumbers : false,
                    style : 'nested',
                },
                files : [ {
                    expand : true,
                    cwd : moduleDir,
                    src : oc.themeSassSrc(),
                    dest : buildDir + '03_final/csscheck',
                    ext : '.css',
                    flatten: true
                } ]
            }
        },

        concat : {
            theme : {
                options: {
                    sourceMap: true,
                    sourceMapStyle: 'embed',
                },
                src: [ 
                    moduleDir + 'plugins.min.css', 
                    '<%= grunt.task.current.args[0] %>.min.css' 
                ], 
                dest: buildDir + '03_final/css/<%= grunt.task.current.args[0] %>.min.css' 
            },
        },
        
        cssmin : {
            options : {
                advanced: true,  // sometimes setting this to false helps to debug SASS
                processImport: true,
                sourceMap: true,
                sourceMapInlineSources: true,
                roundingPrecision : -1,
            },
            //
            // Important note regarding the source map handling:
            //   The source map is inlined and also referenced to the original file.
            //   If we use different src / dest folders the path information 
            //   to the original source maps gets lost in the cssmin task. 
            //   The workaround is to write to the 'moduleDir' folder, in which case the relative path information 
            //   remains intact. We clean up later in separate 'copy:save' and 'clean:theme' tasks.
            //
            theme : {
                files : [{
                    expand : true,
                    cwd : buildDir + '01_processed',
                    src : oc.themeCssSrc(),
                    dest : moduleDir,
                    ext : '.min.css'
                }]
            },
            pluginCss : {
                src : oc.cssSrc(),
                dest : moduleDir + 'plugins.min.css',
            },
            csscheck : {
                src : oc.cssSrc(),
                dest : buildDir + '03_final/csscheck/plugins.min.css',
            },
        },
        
        uglify : {
            options : {
                sourceMap: true,
                sourceMapIncludeSources: true,
                mangleProperties: false,
                mangle : {
                    except : [ 
                        'jQuery', 
                        'bootstrapPaginator', 
                        'revolution',
                    ],
                },
            },
            pluginJs : {
                src : oc.jsSrc(),
                dest : buildDir + '03_final/js/scripts-all.min.js',
            },
        },
        
        watch: {
            options: {
                interrupt: true,     // interrupt when new modification happens during build
                debounceDelay: 2000, // wait 2 seconds after file was saved before starting build 
            },
            scss : {
                files : [ oc.sassSrc() ],
                tasks : [ 'copy:restore', 'theme', 'combine', 'deploy' ],
            },    
            pluginCss : {
                files : [ oc.cssSrc() ],
                tasks : [ 'copy:restore', 'pluginCss', 'combine', 'deploy' ],
            },
            pluginJs : {
                files : [ oc.jsSrc() ],
                tasks : [ 'pluginJs', 'deploy' ],
            },
            resources : {
                files : [ oc.resources() ],
                tasks : [ 'deploy' ],
            },
        },
    });
}

_gruntRegisterTasks = function() {

    grunt.registerTask('default', [ 
        'clean',
        'theme',
        'pluginCss',
        'combine',
        'pluginJs',
        'deploy',
    ]);
    
    grunt.registerTask('csscheck', [ 
        'clean',
        'sass:csscheck',
        'cssmin:csscheck',
        'deploy',
    ]);
    
    grunt.registerTask('theme', [ 
        'sass:theme',
        'cssmin:theme',
    ]);
    
    grunt.registerTask('plugins', [ 
        'cssmin:pluginCss',
        'uglify:pluginJs',
    ]);
    
    grunt.registerTask('pluginCss', [ 
        'cssmin:pluginCss',
    ]);
        
    grunt.registerTask('pluginJs', [ 
        'uglify:pluginJs',
    ]);
    
    grunt.registerTask('combine',
        oc.themeConcatTasks().concat(
        'copy:save', 
        'clean:theme'
    ));
    
    grunt.registerTask('deploy', function() {
        if (grunt.file.expand(oc.deployTarget + '*').length) { 
            grunt.task.run( [
                'copy:resources',
                'copy:deploy',
            ] );
        } else {
            grunt.log.errorlns('Deploy target CSS folder ' + oc.deployTarget + ' not found, skipping deploy!');
        }
    });    
}    

_showImports = function() {
    
    console.log('\nLoaded path elements from OpenCms modules');

    console.log('- Themes');
    for (var i in themes) { console.log("    " + themes[i]) };
    
    console.log('\n- Sass');
    for (var i in sassSrc) { console.log("    " + sassSrc[i]) };
    
    console.log('\n- Css');
    for (var i in cssSrc) { console.log("    " + cssSrc[i]) };

    console.log('\n- Js');
    for (var i in jsSrc) { console.log("    " + jsSrc[i]) };

    console.log('\n- Resources');
    for (var i in resources) { console.log("    " + resources[i]) };
    console.log();
    
    console.log('\n- Deploy target folder: ' + deployTarget + "\n");    
}

exports.sassSrc = function () {
    return sassSrc;
}

exports.cssSrc = function () {
    return cssSrc;
}

exports.jsSrc = function () {
    return jsSrc;
}

exports.resources = function () {
    return resources;
}

exports.themeSassSrc = function () {
    for (i=0; i<themes.length; i++) {
        themeSassSrc[i] = '**/' + themes[i] + '.scss';
    }
    return themeSassSrc;
}

exports.themeCssSrc = function () {
    for (i=0; i<themes.length; i++) {
        themeCssSrc[i] = themes[i] + '.css';
    }
    return themeCssSrc;
}

exports.themeConcatTasks = function () {
    for (i=0; i<themes.length; i++) {
        themeConcatTasks[i] = 'concat:theme:' + themes[i];
    }
    return themeConcatTasks;
}