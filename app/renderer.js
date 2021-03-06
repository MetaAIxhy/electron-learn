const Vue = require('./res/util/vue/dist/vue.js');
const { Dialog, File, Storage } = require('./api.js');
const { divEdit, spanTime, uiPaging } = require('./component.js');
const { viewSubject } = require('./view/subject.js');

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
        this.row = [
            {
                key: 'content',
                name: '内容',
                show: true
            },{
                key: 'time',
                name: '时间',
                show: true
            },{
                key: 'opt',
                name: '操作',
                show: true
            }],
        this.active = true;
    }
    rowSelect(index){
        this.row[index].show = !this.row[index].show ;
    }
    select(){
        this.active = !this.active;
    }
    update(subject){
        this.active=subject.active;
        this.row = subject.row;
        subject.todos.map(todo=>this.add(todo.content, todo.time))
    }
    add(text, time){
        if(!text){
            text = this.input;
            this.input = "";
        }
        let todo = new Todo(text, time);
        this.todos.push(todo);
        return todo;
    }
    del(item){
        this.todos.$remove(item);
    }
    empty(){
        return this.todos = [];
    }
    get(){
      return this.subject;
    }
}

class History {
    constructor(){
        this.logs = [];
        this.logText = "";
    }
    empty(){
        this.logs = [];
    }
    log({action,success, data }){
        let time = (new Date()).toLocaleString();
        this.logs.push({ action, success, data, time });
        console.log(action, success, data);
        this.logText = action + (success?" 成功 ":" 失败 ") + time;
    }
}

class Project {
    constructor(config){
        this.path = "";
        this.history = new History();
        this.input = "";
        this.historyPath = config.historyPath;
        this.subjects = [];
    }
    addSubject(name){
        if(!name){
            name = this.input;
            this.input = "";
        }
        let subject = new Subject(name);
        this.subjects.push(subject);
        return subject;
    }
    delSubject(subject){
        this.subjects.$remove(subject);
    }
    getJSON(){
        return JSON.stringify({subjects: this.subjects})
    }
    empty(){
        return this.subjects = [];
    }
    update(filename, project){
        console.log(filename, project);
        this.empty();
        project.subjects.map(subject=>this.addSubject(subject.name).update(subject));
        return this.path = filename;
    }
    save(filename){
        Promise.resolve(filename ? filename : Dialog.showSaveDialog())
            .then(filename=> File.save(filename, this.getJSON()))
            .then((filename)=> {
                this.history.log({
                    action: "project-save",
                    success: true,
                    data: {filename}
                })
            })
            .catch(error=> {
                this.history.log({
                    action: "project-save",
                    success: false,
                    data: {error}
                });
            });
    }
    open(filename){
        return Promise.resolve(filename ? filename : Dialog.showOpenDialog())
            .then(filename=> File.open(filename))
            .then(({filename, data})=> this.update(filename, JSON.parse(data)))
            .then(filename=>{
                //use relative path
                File.save(this.historyPath, File.relativePath(filename));
                return filename;
            })
            .then(filename=> this.history.log({
                action: "project-open",
                success: true,
                data: {filename}
            }))
            .catch(error=> {
                this.history.log({
                    action: "project-open",
                    success: false,
                    data: {error}
                });
            });
    }
    new(){
        this.empty();
        this.path = "";
    }
    loadFile(){
        Promise.resolve(this.historyPath)
            .then(cf=>File.exists(cf))
            .then(cf=>File.open(cf))
            .then(({filename, data})=>this.open(data))
            .then(filename=>this.history.log({
                action: 'project-load',
                success: true,
                data: {filename}
            }))
            .catch(error=>this.history.log({
                action: "project-load",
                success: false,
                data: {error}
            }))
        ;
    }
    loadStorage(){
        console.log(Storage.fetch());
        Promise.resolve(Storage.fetch())
            .then(({filename, data})=> this.update(filename, data))
            .then(filename=>{
                //use relative path
                File.save(this.historyPath, File.relativePath(filename));
                return filename;
            })
            .then(filename=> this.history.log({
                action: "project-open",
                success: true,
                data: {filename}
            }))
            .catch(error=> {
                this.history.log({
                    action: "project-open",
                    success: false,
                    data: {error}
                });
            });
    }
}

let project  = new Project({historyPath: "app/last.project"});
let vm = new Vue({
    el: 'body',
    data: {
        project: project
    },
    components: {
        'div-edit': divEdit,
        'span-time': spanTime,
        'ui-paging': uiPaging,
        'view-subject': viewSubject
    },
    watch: {
        project: {
            handler: function (project) {
                Storage.save({
                    filename: project.path,
                    data:{
                        subjects: project.subjects
                    }});
            },
            deep: true
        }
    }
});
project.loadStorage();
//project.loadFile();

//debug
window.myApp = {vm}
