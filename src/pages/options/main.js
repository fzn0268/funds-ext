import Vue from 'vue'
import Options from './Options'

Vue.config.productionTip = false

new Vue({
  render: h => h(Options),
}).$mount('#app')