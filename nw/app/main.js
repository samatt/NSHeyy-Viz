var Vue = require('vue');
var $ = require('jQuery');
var app = require('./scripts/app');
// var colorbrewer = require('./scripts/colorBrewer');


var app = new Vue({
  el: '#app',
  components: {
    // a: require('./components/component-a/index'),
    // b: require('./components/component-b/index')
  },
  data: {
    title: 'Hello Node Webkit, Browserify and Vue.js!'
  },
  ready:function(){
    // console.log("Im in ready with "+ $(window).width() + " : " + $(window).height()  );
    // console.log(colorbrewer);
    app();
  },
});
