//
// Completely based on auto-reload-brunch:
// https://github.com/brunch/auto-reload-brunch/
//
(function() {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = (window.brunch || {});
  var ar = br['auto-reload'] = (br['auto-reload'] || {});
  if (!WebSocket || ar.disabled) return;

  var cacheBuster = function(url){
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') +'cacheBuster=' + date;
  };

  var reloaders = {
    page: function(){
      window.location.reload(true);
    },

    html: function(data) {
      var index = data.path.match(/index.(html|php)$/);
      if (
        data.path == window.location.pathname ||
        (index && data.path.replace(index[0], "") == window.location.pathname)
      ) {
        var head = document.getElementsByTagName("head")[0],
            body = document.getElementsByTagName("body")[0];

        head.innerHTML = data.html.match(/<head>([\s\S]*?)<\/head>/im)[1];
        body.innerHTML = data.html.match(/<body>([\s\S]*?)<\/body>/im)[1];
      }
    },

    stylesheet: function(){
      [].slice
        .call(document.querySelectorAll('link[rel="stylesheet"]'))
        .filter(function(link){
          return (link != null && link.href != null);
        })
        .forEach(function(link) {
          link.href = cacheBuster(link.href);
        });

      // hack to force page repaint in Chrome
      var el=document.body;
      el.style.display='none';
      el.offsetHeight;
      el.style.display='block';
    }
  };

  var port = ar.port || window.location.port;
  var host = br.server || window.location.hostname;

  var connect = function(){
    var connection = new WebSocket('ws://' + host + ':' + port);
    connection.onmessage = function(event){
      if (ar.disabled) return;
      var message = JSON.parse(event.data);
      var reloader = reloaders[message.type] || reloaders.page;
      reloader(message);
    };
    connection.onerror = function(){
      if (connection.readyState) connection.close();
    };
    connection.onclose = function(){
      window.setTimeout(connect, 1000);
    };
  };
  connect();
})(window);
