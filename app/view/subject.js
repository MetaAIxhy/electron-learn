const { divEdit, spanTime, uiPaging } = require('../component.js');
const viewSubject  = {
    data(){
        return {
            offset: 0,
            limit: 5,
            asc: true
        }
    },
    props:{
        subject: {
            type: Object,
            required: true
        }
    },
    computed: {
        list(){
            return this.asc?
                this.subject.todos.slice(this.offset, this.offset+this.limit):
                this.subject.todos.slice(0).reverse().slice(this.offset, this.offset+this.limit);
        }
    },
    methods: {
      changeSort(){
          this.asc = !this.asc;
      }
    },
    template: "#view-subject",
    components: {
        'div-edit': divEdit,
        'ui-paging': uiPaging,
    },
}

module.exports = { viewSubject }