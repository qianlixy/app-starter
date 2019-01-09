!(function(w, mos, s) {
  if (w.AppStarter) {
    return;
  }

  var startTime = 2000;

  var mobileOS = typeof(mos) === 'function' ? mos : function(userAgent) {
    if (userAgent.indexOf('Android') > -1 || userAgent.indexOf('Adr') > -1) {
      return 'android';
    } else if (!!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
      return 'ios';
    } else {
      return 'unknown';
    }
  };

  function getSettings(selector) {
    var element = typeof(selector) === 'string' ? w.document.findElementById(selector) : selector;
    return {
      ios: {
        start: element.getAttribute('as:ios-start'),
        download: element.getAttribute('as:ios-download')
      },
      android: {
        start: element.getAttribute('as:android-start'),
        download: element.getAttribute('as:android-download')
      }
    }
  }

  var starter = {
    ios: function(settings) {
      var last = Date.now();
      w.location.href = settings.start;
      setTimeout(function() {
        if (Date.now() - last < startTime) {
          w.open(settings.download);
        }
      }, startTime);
    },
    android: function(settings) {
      w.location.href = settings.start;
      setTimeout(function() {
        w.open(settings.download);
      }, startTime);
    },
    unknown: function(settings) {

    }
  }

  if (typeof(s) === 'object') {
    for(var key in s) {
      starter[key] = s;
    }
  }

  var os = mobileOS(w.navigator.userAgent);

  var AppStarter = {
    start: function(selector) {
      this.startUrls(getSettings(selector));
    },
    startUrls: function(settings) {
      starter[os].call(null, settings[os]);
    }
  }

  w.AppStarter = AppStarter;

})(window, customMobileOS, customStarter);
