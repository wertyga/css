const path = require('path');
const fs = require('fs');
const sass = require('node-sass');
const loadersUtils = require('loader-utils');

function mkDirRecursive(storePath) {
    let currentPath = '';

    storePath.split('/').filter(item => !!item || !/[\.|:]/.test(item))
        .forEach(localPath => {
            currentPath = path.join(currentPath, localPath);
            try {
                fs.statSync(currentPath);
            } catch(e) {
                if(e.code === 'ENOENT') {
                    fs.mkdirSync(currentPath);
                }
            }
        });
};

function importReplace(source) {
    const importStr = source.match(/'~.+'/);
    let resultStr = source;
    importStr && importStr.forEach(item => {
        const replacement = item.replace(/\'/g, '');
        resultStr = resultStr
            .replace(replacement, path.join(process.cwd(), replacement.replace('~', '')))
            .replace(/\\/g, '/');
    });
    return resultStr;
};

function extractCss(source = '') {
    console.log(this);
    this.cacheable && this.cacheable();
    const { getOptions } = loadersUtils;
    const { storePath, filename } = getOptions(this);
    const fullPath = `${storePath}/${filename}`;
    mkDirRecursive(storePath);
    const data = importReplace(source);

    const result = sass.renderSync({
        data
    });

    // fs.writeFileSync(fullPath, result.css);
    return result.css;
};


module.exports = extractCss;
