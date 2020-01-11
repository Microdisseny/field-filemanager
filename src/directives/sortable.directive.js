import Vue from 'vue'

import Sortable from 'sortablejs'

// Initialize the annoying-background directive.
const sortableDirective = {
  bind (el, binding, vnode) {
    Sortable.create(el, binding.value)
  }
}

Vue.directive('mysortable', sortableDirective)

export default sortableDirective
