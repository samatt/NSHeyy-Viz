var Vue = require('vue');
var $ = require('jQuery');
var pbj = require('./scripts/pbj');


var app = new Vue({
  el: '#app',
  ready:function(){ pbj();}
});
