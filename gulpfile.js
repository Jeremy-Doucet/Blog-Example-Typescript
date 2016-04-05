// Generated on 2016-04-04 using generator-angular-fullstack 3.5.0
'use strict';
const _ = require('lodash');
const del = require('del');
const gulp = require('gulp');
const path = require('path');
const gulpLoadPlugins = require('gulp-load-plugins');
const http = require('http');
const open = require*'open';
const lazypipe = require('lazypipe');
const wiredep = require('wiredep').stream;
const nodemon = require('nodemon');
const KarmaServer = require('karma').Server;
const runSequence = require('run-sequence');
const protractor = require('gulp-protractor').protractor;
const webdriver_update = require('gulp-protractor').webdriver_update;
const Instrumenter = require('isparta').Instrumenter;

var plugins = gulpLoadPlugins();
var config;

const clientPath = require('./bower.json').appPath || 'client';
const serverPath = 'server';
const paths = {
    client: {
        assets: `${clientPath}/assets/**/*`,
        images: `${clientPath}/assets/images/**/*`,
        scripts: [
            `${clientPath}/**/!(*.spec|*.mock).ts`,
            `!${clientPath}/bower_components/**/*`,
            `!${clientPath}/{typings,test_typings}/**/*`
        ],
        styles: [`${clientPath}/{app,components}/**/*.scss`],
        mainStyle: `${clientPath}/app/app.scss`,
        views: `${clientPath}/{app,components}/**/*.jade`,
        mainView: `${clientPath}/index.html`,
        test: [`${clientPath}/{app,components}/**/*.{spec,mock}.ts`],
        e2e: ['e2e/**/*.spec.js'],
        bower: `${clientPath}/bower_components/`
    },
    server: {
        scripts: [
          `${serverPath}/**/!(*.spec|*.integration).ts`,
          `!${serverPath}/config/local.env.sample.ts`,
          `!${serverPath}/typings/**/*`
        ],
        compiledScripts: [
            `${serverPath}/**/!(*.spec|*.integration).js`,
            `!${serverPath}/config/local.env.sample.js`,
            `!${serverPath}/typings/**/*`
        ],
        json: [`${serverPath}/**/*.json`],
        test: {
          integration: [`${serverPath}/**/*.integration.js`, 'mocha.global.js'],
          unit: [`${serverPath}/**/*.spec.js`, 'mocha.global.js']
        }
    },
    karma: 'karma.conf.js',
    dist: 'dist'
};

/********************
 * Helper functions
 ********************/

function onServerLog(log) {
    console.log(plugins.util.colors.white('[') +
        plugins.util.colors.yellow('nodemon') +
        plugins.util.colors.white('] ') +
        log.message);
}

function checkAppReady(cb) {
    var options = {
        host: 'localhost',
        port: config.port
    };
    http
        .get(options, () => cb(true))
        .on('error', () => cb(false));
}

// Call page until first success
function whenServerReady(cb) {
    var serverReady = false;
    var appReadyInterval = setInterval(() =>
        checkAppReady((ready) => {
            if (!ready || serverReady) {
                return;
            }
            clearInterval(appReadyInterval);
            serverReady = true;
            cb();
        }),
        100);
}

function sortModulesFirst(a, b) {
    var module = /\.module\.ts$/;
    var aMod = module.test(a.path);
    var bMod = module.test(b.path);
    // inject *.module.js first
    if (aMod === bMod) {
        // either both modules or both non-modules, so just sort normally
        if (a.path < b.path) {
            return -1;
        }
        if (a.path > b.path) {
            return 1;
        }
        return 0;
    } else {
        return (aMod ? -1 : 1);
    }
}

/********************
 * Reusable pipelines
 ********************/

let lintClientScripts = lazypipe()
    .pipe(plugins.tslint, require(`./${clientPath}/tslint.json`))
    .pipe(plugins.tslint.report, 'verbose');

let lintServerScripts = lazypipe()
    .pipe(plugins.tslint, require(`./${serverPath}/tslint.json`))
    .pipe(plugins.tslint.report, 'verbose');

let lintServerTestScripts = lazypipe()
    .pipe(plugins.jshint, `${serverPath}/.jshintrc-spec`)
    .pipe(plugins.jshint.reporter, 'jshint-stylish');

let styles = lazypipe()
    .pipe(plugins.sourcemaps.init)
    .pipe(plugins.sass)
    .pipe(plugins.autoprefixer, {browsers: ['last 2 versions']})
    .pipe(plugins.sourcemaps.write, '.');

let mocha = lazypipe()
    .pipe(plugins.mocha, {
        reporter: 'spec',
        timeout: 5000,
        require: [
            './mocha.conf'
        ]
    });

let istanbul = lazypipe()
    .pipe(plugins.istanbul.writeReports)
    .pipe(plugins.istanbulEnforcer, {
        thresholds: {
            global: {
                lines: 80,
                statements: 80,
                branches: 80,
                functions: 80
            }
        },
        coverageDirectory: './coverage',
        rootDirectory : ''
    });

/********************
 * Env
 ********************/

gulp.task('env:all', () => {
    let localConfig;
    try {
        localConfig = require(`./${serverPath}/config/local.env`);
    } catch (e) {
        localConfig = {};
    }
    plugins.env({
        vars: localConfig
    });
});
gulp.task('env:test', () => {
    plugins.env({
        vars: {NODE_ENV: 'test'}
    });
});
gulp.task('env:prod', () => {
    plugins.env({
        vars: {NODE_ENV: 'production'}
    });
});

/********************
 * Tasks
 ********************/

gulp.task('inject', cb => {
    runSequence(['inject:js', 'inject:css', 'inject:scss', 'inject:tsconfig'], cb);
});

gulp.task('inject:js', () => {
    return gulp.src(paths.client.mainView)
        .pipe(plugins.inject(
            gulp.src(_.union(paths.client.scripts, [`!${clientPath}/**/*.{spec,mock}.ts`, `!${clientPath}/app/app.ts`]), {read: false})
                .pipe(plugins.sort(sortModulesFirst)),
            {
                starttag: '<!-- injector:js -->',
                endtag: '<!-- endinjector -->',
                transform: (filepath) => '<script src="' + filepath.replace(`/${clientPath}/`, '').replace('.ts', '.js') + '"></script>'
            }))
        .pipe(gulp.dest(clientPath));
});

gulp.task('inject:tsconfig', (cb) => {
    runSequence(['inject:tsconfig:client', 'inject:tsconfig:server'], cb);
});

gulp.task('inject:tsconfig:client', () => {
    return gulp.src('./client/tsconfig.json')
        .pipe(plugins.inject(
            gulp.src([
                `${clientPath}/**/!(*.spec|*.mock).ts`,
                `!${clientPath}/bower_components/**/*`,
                `${clientPath}/typings/browser/**/*.d.ts`,
                `!${clientPath}/typings/main/**/*.d.ts`,
                `!${clientPath}/typings/main.d.ts`
            ], {read: false})
            .pipe(plugins.sort()),
            {
                starttag: '"files": [',
                endtag: ']',
                transform: (filepath, file, i, length) => {
                    return `"${filepath.substr(8)}"${i + 1 < length ? ',' : ''}`;
                }
            }))
        .pipe(gulp.dest('./client'));
});

gulp.task('inject:tsconfig:server', () => {
    return gulp.src('./server/tsconfig.json')
        .pipe(plugins.inject(
            gulp.src([
                `${serverPath}/**/!(*.spec|*.mock).ts`,
                `${serverPath}/typings/main/**/*.d.ts`,
                `!${serverPath}/typings/browser/**/*.d.ts`,
                `!${serverPath}/typings/browser.d.ts`
            ], {read: false})
            .pipe(plugins.sort()),
            {
                starttag: '"files": [',
                endtag: ']',
                transform: (filepath, file, i, length) => {
                    return `"${filepath.substr(8)}"${i + 1 < length ? ',' : ''}`;
                }
            }))
        .pipe(gulp.dest('./server'));
});

gulp.task('inject:css', () => {
    return gulp.src(paths.client.mainView)
        .pipe(plugins.inject(
            gulp.src(`/${clientPath}/{app,components}/**/*.css`, {read: false})
                .pipe(plugins.sort()),
            {
                starttag: '<!-- injector:css -->',
                endtag: '<!-- endinjector -->',
                transform: (filepath) => '<link rel="stylesheet" href="' + filepath.replace(`/${clientPath}/`, '').replace('/.tmp/', '') + '">'
            }))
        .pipe(gulp.dest(clientPath));
});

gulp.task('inject:scss', () => {
    return gulp.src(paths.client.mainStyle)
        .pipe(plugins.inject(
            gulp.src(_.union(paths.client.styles, ['!' + paths.client.mainStyle]), {read: false})
                .pipe(plugins.sort()),
            {
                transform: (filepath) => {
                    let newPath = filepath
                        .replace(`/${clientPath}/app/`, '')
                        .replace(`/${clientPath}/components/`, '../components/')
                        .replace(/_(.*).scss/, (match, p1, offset, string) => p1)
                        .replace('.scss', '');
                    return `@import '${newPath}';`;
                }
            }))
        .pipe(gulp.dest(`${clientPath}/app`));
});

// Install DefinitelyTyped TypeScript definition files
gulp.task('tsd', cb => {
    gulp.src(['./client/typings.json', './server/typings.json'])
        .pipe(plugins.typings())
        .end(cb);
});

gulp.task('tsd:test', cb => {
    gulp.src(['./client/typings_test.json', './server/typings_test.json'])
        .pipe(plugins.typings())
        .end(cb);
});

gulp.task('styles', () => {
    return gulp.src(paths.client.mainStyle)
        .pipe(styles())
        .pipe(gulp.dest('.tmp/app'));
});

gulp.task('copy:constant', () => {
    return gulp.src(`${clientPath}/app/app.constant.js`, { dot: true })
        .pipe(gulp.dest('.tmp'));
})

gulp.task('transpile:client', ['constant', 'copy:constant'], () => {
    let tsProject = plugins.typescript.createProject('./client/tsconfig.json');
    return tsProject.src()
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.typescript(tsProject)).js
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('.tmp'));
});

gulp.task('transpile:client:test', ['tsd:test'], () => {
    let tsTestProject = plugins.typescript.createProject('./client/tsconfig.test.json');
    return tsTestProject.src()
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.typescript(tsTestProject)).js
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('.tmp/test'));
});

gulp.task('transpile:server', () => {
    let tsProject = plugins.typescript.createProject('./server/tsconfig.json');
    return tsProject.src()
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.typescript(tsProject)).js
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('.tmp'));
});

gulp.task('lint:scripts', cb => runSequence(['lint:scripts:client', 'lint:scripts:server'], cb));

gulp.task('lint:scripts:client', () => {
    return gulp.src(_.union(
        paths.client.scripts,
        _.map(paths.client.test, blob => '!' + blob),
        [`!${clientPath}/app/app.constant.ts`]
    ))
        .pipe(lintClientScripts());
});

gulp.task('lint:scripts:server', () => {
    return gulp.src(_.union(paths.server.scripts, _.map(paths.server.test, blob => '!' + blob)))
        .pipe(lintServerScripts());
});

gulp.task('lint:scripts:clientTest', () => {
    return gulp.src(paths.client.test)
        .pipe(lintClientScripts());
});

gulp.task('lint:scripts:serverTest', () => {
    return gulp.src(paths.server.test)
        .pipe(lintServerTestScripts());
});

gulp.task('jscs', () => {
  return gulp.src(_.union(paths.client.scripts, paths.server.scripts))
      .pipe(plugins.jscs())
      .pipe(plugins.jscs.reporter());
});

gulp.task('clean:tmp', () => del(['.tmp/**/*'], {dot: true}));

gulp.task('start:client', cb => {
    whenServerReady(() => {
        open('http://localhost:' + config.port);
        cb();
    });
});

gulp.task('start:server:prod', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    config = require(`./${paths.dist}/${serverPath}/config/environment`);
    nodemon(`-w ${paths.dist}/${serverPath} ${paths.dist}/${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:server', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    config = require(`./${serverPath}/config/environment`);
    nodemon(`-w ${serverPath} ${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('watch', () => {
    var testFiles = _.union(paths.client.test, paths.server.test.unit, paths.server.test.integration);

    plugins.livereload.listen();

    plugins.watch(paths.client.styles, () => {  //['inject:scss']
        gulp.src(paths.client.mainStyle)
            .pipe(plugins.plumber())
            .pipe(styles())
            .pipe(gulp.dest('.tmp/app'))
            .pipe(plugins.livereload());
    });

    plugins.watch(paths.client.views)
        .pipe(plugins.jade())
        .pipe(gulp.dest('.tmp'))
        .pipe(plugins.plumber())
        .pipe(plugins.livereload());

    gulp.watch(paths.client.scripts, ['inject:tsconfig', 'lint:scripts:client', 'transpile:client']);

    plugins.watch(_.union(paths.server.scripts, testFiles))
        .pipe(plugins.plumber())
        .pipe(lintServerScripts())
        .pipe(plugins.livereload());

    gulp.watch('bower.json', ['wiredep:client']);
});

gulp.task('serve', cb => {
    runSequence(['clean:tmp', 'constant', 'tsd'],
        ['lint:scripts', 'inject', 'jade'],
        ['wiredep:client'],
        ['transpile:client', 'styles'],
        ['start:server', 'start:client'],
        'watch',
        cb);
});

gulp.task('serve:dist', cb => {
    runSequence(
        'build',
        'env:all',
        'env:prod',
        ['start:server:prod', 'start:client'],
        cb);
});

gulp.task('test', cb => {
    return runSequence('test:server', 'test:client', cb);
});

gulp.task('test:server', cb => {
    runSequence(
        'env:all',
        'env:test',
        'mocha:unit',
        'mocha:integration',
        'mocha:coverage',
        cb);
});

gulp.task('mocha:unit', () => {
    return gulp.src(paths.server.test.unit)
        .pipe(mocha());
});

gulp.task('mocha:integration', () => {
    return gulp.src(paths.server.test.integration)
        .pipe(mocha());
});

gulp.task('test:client', ['wiredep:test', 'constant', 'tsd:test', 'transpile:client', 'transpile:client:test'], (done) => {
    new KarmaServer({
      configFile: `${__dirname}/${paths.karma}`,
      singleRun: true
    }, done).start();
});

// inject bower components
gulp.task('wiredep:client', () => {
    return gulp.src(paths.client.mainView)
        .pipe(wiredep({
            exclude: [
                /bootstrap-sass-official/,
                /bootstrap.js/,
                /json3/,
                /es5-shim/,
                /bootstrap.css/,
                /font-awesome.css/
            ],
            ignorePath: clientPath
        }))
        .pipe(gulp.dest(`${clientPath}/`));
});

gulp.task('wiredep:test', () => {
    return gulp.src(paths.karma)
        .pipe(wiredep({
            exclude: [
                /bootstrap-sass-official/,
                /bootstrap.js/,
                '/json3/',
                '/es5-shim/',
                /bootstrap.css/,
                /font-awesome.css/
            ],
            devDependencies: true
        }))
        .pipe(gulp.dest('./'));
});

/********************
 * Build
 ********************/

//FIXME: looks like font-awesome isn't getting loaded
gulp.task('build', cb => {
    runSequence(
        [
            'clean:dist',
            'clean:tmp'
        ],
        'jade',
        'inject',
        'wiredep:client',
        'tsd',
        [
            'build:images',
            'copy:extras',
            'copy:fonts',
            'copy:assets',
            'copy:server',
            'transpile:server',
            'build:client'
        ],
        cb);
});

gulp.task('clean:dist', () => del([`${paths.dist}/!(.git*|.openshift|Procfile)**`], {dot: true}));

gulp.task('build:client', ['transpile:client', 'styles', 'html', 'constant'], () => {
    var manifest = gulp.src(`${paths.dist}/${clientPath}/assets/rev-manifest.json`);

    var appFilter = plugins.filter('**/app.js', {restore: true});
    var jsFilter = plugins.filter('**/*.js', {restore: true});
    var cssFilter = plugins.filter('**/*.css', {restore: true});
    var htmlBlock = plugins.filter(['**/*.!(html)'], {restore: true});

    return gulp.src(paths.client.mainView)
        .pipe(plugins.useref())
            .pipe(appFilter)
                .pipe(plugins.addSrc.append('.tmp/templates.js'))
                .pipe(plugins.concat('app/app.js'))
            .pipe(appFilter.restore)
            .pipe(jsFilter)
                .pipe(plugins.ngAnnotate())
                .pipe(plugins.uglify())
            .pipe(jsFilter.restore)
            .pipe(cssFilter)
                .pipe(plugins.minifyCss({
                    cache: true,
                    processImportFrom: ['!fonts.googleapis.com']
                }))
            .pipe(cssFilter.restore)
            .pipe(htmlBlock)
                .pipe(plugins.rev())
            .pipe(htmlBlock.restore)
        .pipe(plugins.revReplace({manifest}))
        .pipe(gulp.dest(`${paths.dist}/${clientPath}`));
});

gulp.task('html', function() {
    return gulp.src(`.tmp/{app,components}/**/*.html`)
        .pipe(plugins.angularTemplatecache({
            module: 'app'
        }))
        .pipe(gulp.dest('.tmp'));
});
gulp.task('jade', function() {
  gulp.src(paths.client.views)
    .pipe(plugins.jade())
    .pipe(gulp.dest('.tmp'));
});

// Creates the angular constants for me
gulp.task('constant', function() {
  let sharedConfig = require(`./${serverPath}/config/environment/shared`);
  return plugins.ngConstant({
    name: 'angulartestApp.constants',
    deps: [],
    wrap: true,
    stream: true,
    constants: { appConfig: sharedConfig }
  })
    .pipe(plugins.rename({
      basename: 'app.constant'
    }))
    .pipe(gulp.dest(`${clientPath}/app/`))
    .pipe(plugins.rename({
      extname: '.ts'
    }))
    .pipe(gulp.dest(`${clientPath}/app/`))
});

gulp.task('build:images', () => {
    return gulp.src(paths.client.images)
        .pipe(plugins.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(plugins.rev())
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets/images`))
        .pipe(plugins.rev.manifest(`${paths.dist}/${clientPath}/assets/rev-manifest.json`, {
            base: `${paths.dist}/${clientPath}/assets`,
            merge: true
        }))
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});

gulp.task('copy:extras', () => {
    return gulp.src([
        `${clientPath}/favicon.ico`,
        `${clientPath}/robots.txt`
    ], { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${clientPath}`));
});

gulp.task('copy:fonts', () => {
    return gulp.src(`${clientPath}/bower_components/{bootstrap,font-awesome}/fonts/**/*`, { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/bower_components`));
});

gulp.task('copy:assets', () => {
    return gulp.src([paths.client.assets, '!' + paths.client.images])
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});

gulp.task('copy:server', () => {
    return gulp.src([
        'package.json',
        'bower.json',
        '.bowerrc'
    ], {cwdbase: true})
        .pipe(gulp.dest(paths.dist));
});

gulp.task('coverage:pre', () => {
  return gulp.src(paths.server.scripts)
    // Covering files
    .pipe(plugins.istanbul({
        instrumenter: Instrumenter, // Use the isparta instrumenter (code coverage for ES6)
        includeUntested: true
    }))
    // Force `require` to return covered files
    .pipe(plugins.istanbul.hookRequire());
});

gulp.task('coverage:unit', () => {
    return gulp.src(paths.server.test.unit)
        .pipe(mocha())
        .pipe(istanbul())
        // Creating the reports after tests ran
});

gulp.task('coverage:integration', () => {
    return gulp.src(paths.server.test.integration)
        .pipe(mocha())
        .pipe(istanbul())
        // Creating the reports after tests ran
});

gulp.task('mocha:coverage', cb => {
  runSequence('coverage:pre',
              'env:all',
              'env:test',
              'coverage:unit',
              'coverage:integration',
              cb);
});

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

gulp.task('test:e2e', ['env:all', 'env:test', 'start:server', 'webdriver_update'], cb => {
    gulp.src(paths.client.e2e)
        .pipe(protractor({
            configFile: 'protractor.conf.js',
        })).on('error', err => {
            console.log(err)
        }).on('end', () => {
            process.exit();
        });
});
