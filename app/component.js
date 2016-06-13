const Vue = require('./res/util/vue/dist/vue.js');
const divEdit = {
    data() {
        return {
            editing: false,
            editCache: ""
        }
    },
    template: "#div-edit",
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

const uiPaging = {
    props:{
        all: {
            type: Number,
            required: true
        },
        limit: {
            type: Number,
            default: 5
        },
        offset: {
            type: Number,
            default: 0
        }
    },
    template: "#ui-paging",
    computed: {
        pageNum(){
            return ((o, l)=>Math.ceil((o+1)/l))(this.offset, this.limit);
        },
        page(){
            let res = [], max = 5,  per = this.limit, all = this.all;;
            let n = Math.max(1, this.pageNum - max + 1);
            while( n * per < all + per && max-- ) res.push(n++);
            return res;
        },
        canLast(){
            return this.pageNum > 1;
        },
        canNext(){
            return this.pageNum*this.limit<this.all;
        }
    },
    watch: {
        all(all){
            if(this.offset >= all) this.last() ;
        }
    },
    methods: {
        last(){
            if(this.canLast) this.offset -= this.limit;
        },
        setPage(num){
            this.offset = (num-1)*this.limit;
        },
        next(){
            if(this.canNext) this.offset += this.limit;
        }

    }
}

module.exports = { divEdit, spanTime, uiPaging }