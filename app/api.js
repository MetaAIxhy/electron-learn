const fs = require('fs');
const {dialog} = require('electron').remote;

let Dialog = {
    showOpenDialog() {
        return new Promise((resolve, reject)=> {
            dialog.showOpenDialog({
                    properties: ['openFile'],
                    filters: [{
                        name: 'todo Files',
                        extensions: ['txt']
                    }]
                }, (filenames)=> {
                    filenames ? resolve(filenames[0]) : reject({message: "未选择要打开的文件"});
                }
            );
        });
    },
    showSaveDialog() {
        return new Promise((resolve, reject)=> {
            dialog.showSaveDialog({
                filters: [{
                    name: 'todo Files',
                    extensions: ['txt']
                }]
            }, (filename)=> {
                filename ? resolve(filename) : reject({message: "未选择要保存的文件"});
            });
        });
    },
    showErrorMessage(message){
        dialog.showMessageBox({
            type: "info",
            buttons: [],
            message
        });
    }
};
let File = {
    exists(filename){
        return new Promise((resolve, reject)=>{
            fs.exists(filename, exists=>exists?
                resolve(filename):
                reject({message: filename+"不存在"}));
        });
    },
    open(filename) {
        return new Promise((resolve, reject)=> {
            fs.readFile(filename, "utf8", (err, data)=> {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({filename, data});
            });
        });
    },
    save(filename, data) {
        return new Promise((resolve, reject)=> {
            fs.writeFile(filename, data, (err)=> {
                if (err) reject(err);
            });
            resolve(filename);
        });
    }
}
module.exports = { Dialog, File }