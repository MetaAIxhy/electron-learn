const divEdit = {
    data() {
        return {
            editing: false,
            editCache: ""
        }
    },
    template: `
                       <div @click="edit()" style="cursor: pointer;">
                           <textarea class="form-control"
                            v-show="editing"
                           	v-focus="editing"
                           	v-model="content"
                            @blur="editDone()"
                            @keyup.enter="editDone()"
                            @keyup.esc="editCancel()">
                           </textarea>
                           <p v-else v-text="content"></p>
                       </div>`,
    props: {
        content: {
            type: String
        }
    },
    methods: {
        edit(){
            this.editing = true;
            this.editCache = this.content;
        },
        editCancel(){
            this.editing = false;
            this.content = this.editCache;
        },
        editDone(){
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