var Vue = require('vue');
var $ = require('jQuery');
var app = require('./scripts/app');


var viz = new Vue({
  el: '#app',
  ready:function(){
    app();
  },
});
