import Vue from 'vue';
import annotationMixin from './mixin';
import HTTP from './http';

Vue.use(require('vue-shortkey'));


const vm = new Vue({ // eslint-disable-line no-unused-vars
  el: '#mail-app',

  delimiters: ['[[', ']]'],

  directives: {
    'todo-focus': (el, binding) => {
      if (binding.value) {
        el.focus();
      }
    },
  },

  mixins: [annotationMixin],

  data: {
    newTodo: '',
    editedTodo: null,
  },

  methods: {
    addTodo() {
      const value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }

      const docId = this.docs[this.pageNumber].id;
      const payload = {
        text: value,
      };
      HTTP.post(`docs/${docId}/annotations`, payload).then((response) => {
        this.annotations[this.pageNumber].push(response.data);
      });

      this.newTodo = '';
    },

    removeTodo(todo) {
      const docId = this.docs[this.pageNumber].id;
      HTTP.delete(`docs/${docId}/annotations/${todo.id}`).then(() => {
        const index = this.annotations[this.pageNumber].indexOf(todo);
        this.annotations[this.pageNumber].splice(index, 1);
      });
    },

    editTodo(todo) {
      this.beforeEditCache = todo.text;
      this.editedTodo = todo;
    },

    doneEdit(todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.text = todo.text.trim();
      if (!todo.text) {
        this.removeTodo(todo);
      }
      const docId = this.docs[this.pageNumber].id;
      HTTP.put(`docs/${docId}/annotations/${todo.id}`, todo).then((response) => {
        console.log(response); // eslint-disable-line no-console
      });
    },

    cancelEdit(todo) {
      this.editedTodo = null;
      todo.text = this.beforeEditCache;
    },

    async submit() {
      const state = this.getState();
      this.url = `docs?q=${this.searchQuery}&seq2seq_annotations__isnull=${state}&offset=${this.offset}`;
      await this.search();
      this.pageNumber = 0;
    },
  },
});
