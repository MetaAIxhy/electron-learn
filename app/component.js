const Vue = require('./res/util/vue/dist/vue.js');
const divEdit = {
    data() {
        return {
            editing: false,
            editCache: ""
        }
    },
    template: `
                       <div @click="edit()" style="cursor: pointer;">
                           <input v-show="single && editing" class="form-control"
                           	v-focus="editing"
                           	v-model="content"
                            @blur="done()"
                            @keyup.esc="done()"/>
                           <textarea v-show="!single && editing" class="form-control"
                           	v-focus="editing"
                           	v-model="content"
                            @blur="done()"
                            @keyup.esc="done()">
                           </textarea>
                           <span v-if="!editing" v-text="content"></span>
                       </div>`,
    props: {
        content: {
            type: String
        },
        single: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        edit(){
            this.editing = true;
            this.editCache = this.content;
        },
        cancel(){
            this.editing = false;
            this.content = this.editcache;
        },
        done(){
            this.editing = false;
        }
    },
    directives: {
        'focus': function (value) {
            if (!value) {
                return;
            }
            var el = this.el;
            Vue.nextTick(function () {
                el.focus();
            });
        }
    }
}

const spanTime = {
    data(){
        return {
            timeText: ""
        }
    },
    template: "<span v-text='timeText'></span>",
    methods: {
      update(){
          this.timeText = (new Date()).toLocaleString();
      }
    },
    ready(){
        this.timeText = (new Date()).toLocaleString();
        window.setInterval(this.update, 1000);
    }
}
module.exports = { divEdit, spanTime }