const Vue = require('./res/util/vue/dist/vue.js');
const fs = require('fs');
const {dialog} = require('electron').remote;

var App = {
    data: {
        todo: {
            lists: [],
            input: ""
        },
        menu: {
            filename: ""
        },
        history: {
            lists: []
        }
    },
    modules:{},
    command: {
        todo_add(text){
            App.data.todo.lists.push({
                text: text,
                time: App.api.time.getTimeString()
            });
            App.data.todo.input = "";
        },
        todo_del(item){
            App.data.todo.lists.$remove(item);
        },
        todo_load(data){
            App.data.todo.lists = data;
        },
        menu_openfile(filename){
            var getFilename = filename?
                (new Promise((resolve)=>resolve([filename]))):
                App.api.dialog.showOpenDialog();
            getFilename.then(filenames=> App.api.file.open(filenames))
                .then(({filename, data})=> App.api.todo.load(filename, data))
                .then(filename=> {
                    App.vm.menu.filename = filename;
                    App.api.history.log({
                        action: "menu_openfile",
                        success: true,
                        data: { filename }
                    })
                })
                .catch(err=> {
                    App.api.history.log({
                        action: "menu_openfile",
                        success: false,
                        data: { message: err.message}
                    });
                });
        },
        menu_savefile(filename){
            var getFilename= filename?
                (new Promise((resolve, reject)=>{resolve(filename)})):
                App.api.dialog.showSaveDialog();
            getFilename.then(filename=> App.api.file.save(filename, JSON.stringify(App.data.todo.lists)))
                .then((filename)=> {
                    App.vm.menu.filename = filename;
                    App.api.history.log({
                        action: "menu_savefile",
                        success: true,
                        data: { filename }
                    })
                })
                .catch(err=> {
                    App.api.history.log({
                        action: "menu_savefile",
                        success: false,
                        data: { message: err.message}
                    });
                });
        }
    },
    api: {
        time: {
            getTimeString: ()=>(new Date()).toLocaleString()
        },
        history: {
            log({action,success, data }){
                App.data.history.lists.push({
                    action, success, data,
                    time: App.api.time.getTimeString()
                });
            }
        },
        todo: {
            load: function (filename, json) {
                return new Promise((resolve, reject)=>{
                    var data;
                    try{
                        data= JSON.parse(json);
                    }catch (err){
                        reject(err);
                    }
                    App.data.todo.lists = data;
                    resolve(filename);
                });
            }
        },
        dialog: {
            showOpenDialog() {
                return new Promise((resolve, reject)=>{
                    dialog.showOpenDialog({
                            properties: ['openFile'],
                            filters: [{
                                name: 'todo Files',
                                extensions: ['txt']
                            }]}, (filenames)=>{
                            filenames?resolve(filenames):reject({message: "未选择要打开的文件"});
                        }
                    );
                });
            },
            showSaveDialog() {
                return new Promise((resolve, reject)=>{
                    dialog.showSaveDialog({
                        filters: [{
                            name: 'todo Files',
                            extensions: ['txt']
                        }]
                    }, (filename)=>{
                        filename?resolve(filename):reject({message:"未选择要保存的文件"});
                    });
                });
            }
        },
        file: {
            open(filenames) {
                return new Promise((resolve, reject)=> {
                    fs.readFile(filenames[0], "utf8", (err, data)=>{
                        if(err){
                            reject(err);
                            return;
                        }
                        resolve({
                            filename: filenames[0],
                            data: data
                        });
                    });
                });
            },
            save(filename, data){
                return new Promise((resolve, reject)=> {
                    fs.writeFile(filename, data, (err)=>{
                        if(err) reject(err);
                    });
                    resolve(filename);
                });
            }
        }
    },
    init: function () {
        App.vm = new Vue({
            el: "body",
            data: App.data,
            methods: App.command
        });
        window.myApp = App;
    }
};

App.init();
