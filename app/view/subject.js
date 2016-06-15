const { divEdit, spanTime, uiPaging, mDropdown } = require('../component.js');
const viewSubject  = {
    data(){
        return {
            offset: 0,
            limit: 5,
            asc: false
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
        'm-dropdown': mDropdown
    },
}

module.exports = { viewSubject }