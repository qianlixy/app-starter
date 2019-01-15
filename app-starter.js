!(function(w) {
  if (AppStarter) {
    return;
  }

  var AppStarter = {
    IOS: 'ios',
    ANDROID: 'android',
    _startTime: 3000
  }

  var iosVersion = function(ua) {
    var version = ua.toLowerCase().match(/cpu iphone os (.*?) like mac os/);
    return version ? parseInt(version[1].replace(/_/g, ".")) : -1;
  }

  AppStarter._os = function(userAgent) {
    if (userAgent.indexOf('Android') > -1 || userAgent.indexOf('Adr') > -1) {
      return 'android';
    } else if (!!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
      return 9 === iosVersion(userAgent) ? 'ios9' : 'ios';
    } else {
      return 'unknown';
    }
  };

  AppStarter._settings = function(selector) {
    var element = typeof(selector) === 'string' ? w.document.findElementById(selector) : selector;
    var settings = {};
    settings[AppStarter.IOS] = {
      start: element.getAttribute('as:ios-start') || element.getAttribute('as:start'),
      download: element.getAttribute('as:ios-download') || element.getAttribute('as:download')
    };
    settings[AppStarter.ANDROID] = {
      start: element.getAttribute('as:android-start') || element.getAttribute('as:start'),
      download: element.getAttribute('as:android-download') || element.getAttribute('as:download')
    }
    return settings;
  }

  AppStarter.start = function(selector) {
    this.startUrls(this._settings(selector));
  }

  AppStarter.startUrls = function(settings) {
    this._starter[this._os(w.navigator.userAgent)].call(this._starter, settings);
  }

  var IframeUtil = {
    create: function(url) {
      var ifr = w.document.createElement('iframe');
      ifr.src = url;
      ifr.style.display = 'none';
      w.document.body.appendChild(ifr);
      return ifr;
    },
    remove: function(ifr) {
      w.document.body.removeChild(ifr);
    }
  }

  var starter = {
    _state: {
      enabled: false,
      timeoutId: 0,
      listen: function() {
        var _this = this;
        if (_this.enabled) {
          return;
        }
        w.document.addEventListener('visibilitychange', function() {
          if (w.document.visibilityState === 'hidden') {
            clearTimeout(_this.timeoutId);
          }
        });
        _this.enabled = true;
      }
    }
  }

  starter['ios'] = function(settings) {
    var last = Date.now();
    this._state.timeoutId = setTimeout(function() {
      var now = Date.now();
      console.log(now -last);
      if (now - last < AppStarter._startTime + 200) {
        if (settings.download) {
          w.location.href = settings.download;
        }
      }
    }, AppStarter._startTime);
    this._state.listen();
    w.location.href = settings.start;
  }
  
  starter['ios9'] = function(settings) {
    var last = Date.now();
    w.location = settings.start;
    setTimeout(function() {
      if (Date.now() - last < AppStarter._startTime + 300) {
        if (settings.download) {
          w.open(settings.download);
        }
      }
    }, AppStarter._startTime);
  }

  starter['android'] = function(settings) {
    var ifr = IframeUtil.create(settings.start);
    var s = setTimeout(function() {
      IframeUtil.remove(ifr);
      if (settings.download) {
        w.open(settings.download);
      }
    }, AppStarter._startTime);
    w.document.addEventListener('visibilitychange', function(e) {
      if (e.hidden) {
        clearTimeout(s);
        IframeUtil.remove(ifr);
      }
    });
  }

  starter['unknown'] = function() {
    if (AppStarter.onUnknown) {
      AppStarter.onUnknown();
    }
  }

  AppStarter._starter = starter;
  w.AppStarter = AppStarter;

})(window);
