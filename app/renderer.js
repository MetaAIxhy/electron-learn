const Vue = require('./res/util/vue/dist/vue.js');
const fs = require('fs');
const {dialog} = require('electron').remote;

class Todo{
    constructor(content, time){
        this.content = content;
        this.time = time || (new Date()).toLocaleString();
    }
}

class Subject{
    constructor(name){
        this.name = name;
        this.input = "";
        this.todos = [];
    }
    add(text){
        return this.todos.push(new Todo(text));
    }
    del(item){
        this.todos.$remove(item);
    }
    load(json) {
       return this.lists = JSON.parse(json);
    }
    empty(){
        return this.todos = [];
    }
    get(){
      return this.subject;
    }
}

class Project {
    constructor(){
        this.path = "";
        this.subjects = {
            input: "",
            lists: []
        }
    }
    addSubject(name){
        let subject = new Subject(name);
        this.subjects.lists.push(subject);
        return subject;
    }
    empty(){
        return this.subjects.lists = [];
    }
    update(filename, json){
        let project = JSON.parse(json);
        this.empty();
        project.subjects.lists.map(subject=>{
            Promise.resolve(this.addSubject(subject.name))
            .then(s=> subject.todos.map(todo=>s.add(todo.content, todo.time)))
        });
        return this.path = filename;
    }
    load(json){
        if(App.config.debug) console.log(json);
        let data = JSON.parse(json);
        for(let key in  data){
            App.data[key] = data[key];
        }
    }
    getJSON(){
        return JSON.stringify({subjects: this.subjects})
    }

}
//
class History {
  constructor(){
    this.lists = [];
  }
  empty(){
    this.lists = [];
  }
  log({action,success, data }){
    App.vm.history.lists.push({
      action, success, data,
      time: (new Date()).toLocaleString()
    });
  }
}

class State {
  constructor(){
    this.name = "";
    this.path = "";
  }
}

let App = {
    config: {
        debug: true,
        lastProject: "app/last.project"
    },
    data: {},
    modules: {},
    event: {
        history_empty() {
            App.vm.history.lists = [];
        },
        todo_add(subject) {
            subject.add(subject.input);
            subject.input = "";
        },
        todo_del(subject, todo) {
            subject.del(todo);
        },
        todo_empty(subject) {
            subject.empty();
        },
        todo_load(data) {
            App.data.todo.lists = data;
        },
        subject_add(project) {
            let {subjects} = project;
            project.addSubject(subjects.input);
            subjects.input = "";
        },
        project_open(project, filename) {
            return Promise.resolve(filename ? filename : App.api.dialog.showOpenDialog())
                .then(filename=> App.api.file.open(filename))
                .then(({filename, data})=> project.update(filename, data))
                .then(filename=>{
                    App.api.file.save(App.config.lastProject, filename);
                    return filename;
                })
                .then(filename=> App.vm.history.log({
                    action: "project_open",
                    success: true,
                    data: {filename}
                }))
                .catch(error=> {
                    App.vm.history.log({
                        action: "project_open",
                        success: false,
                        data: {error}
                    });
                });
        },
        project_save(project, filename) {
            Promise.resolve(filename ? filename : App.api.dialog.showSaveDialog())
                .then(filename=> App.api.file.save(filename, project.getJSON()))
                .then((filename)=> {
                    App.vm.history.log({
                        action: "project_save",
                        success: true,
                        data: {filename}
                    })
                })
                .catch(error=> {
                    App.vm.history.log({
                        action: "project_save",
                        success: false,
                        data: {error}
                    });
                });
        },
        project_init(project){
            Promise.resolve(App.config.lastProject)
                .then(cf=>App.api.file.exists(cf))
                .then(cf=>App.api.file.open(cf))
                .then(({filename, data})=>App.event.project_open(project, data))
                .then(filename=>App.vm.history.log({
                    action: 'menu_initProject',
                    success: true,
                    data: {filename}
                }))
                .catch(error=>App.vm.history.log({
                    action: "menu_initProject",
                    success: false,
                    data: {error}
                }))
            ;
        }
    },
    api: {
        dialog: {
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
        },
        file: {
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
    },
    view(app, data, event) {
        return new Promise((resolve)=>{
            window.myApp = app;
            app.vm = new Vue({
                el: "body",
                data: data,
                methods: event
            });
            resolve(data);
        });
    },
    init() {
        Promise.resolve(this)
            .then(app=>({
                app,
                data:{
                    project: new Project(),
                    history: new History()
                }
            }))
            .then(({app, data})=>App.view(app, data, app.event))
            .then(data=>App.event.project_init(data.project))
            .catch(err=>App.api.dialog.showErrorMessage(err.message))
        ;
    }
};

App.init();
