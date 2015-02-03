TcpClient = function(settings) {
    this.notificationId = 0;
    this.queryId=0;
    this.settings = settings;
    var that = this;
    document.addEventListener("notify",function(ev) {
        that.notify(ev.detail.type, ev.detail.value, ev.detail.args);
    });
}

TcpClient.prototype = {
    connect: function() {
        var that = this;
        this.socket = new WebSocket(this.settings.getUri());
        this.socket.onopen = function() {
            that._onOpenCallback();
        };
        this.socket.onmessage = function(msg) {
            that._onMessageCallback(msg);
        };
        this.socket.onclose = function() {
            that._onCloseCallback();
        };
        this.socket.onerror = function(event) {
            that._onErrorCallback(event);
        };
    },
    notify: function(type, value, args) {
        var argsString = "";
        if(args != undefined) {
            for(var key in args) {
                argsString+=" "+key+"='"+args[key]+"'";
            }
        }
        var socketString ="<action type='"+type+"'";
        if(argsString.length) {
            socketString+=argsString;
        }
        socketString+=">";
        if(value != undefined) {
            socketString+=value;
        }
        socketString+="</action>";
        this.socket.send(socketString);
    },
    incrementQueryId: function() {
        this.queryId++;
    },
    _onOpenCallback : function() {
        //Hide the socket connect window
        clearTimeout(this.timeout);
        $(".splashscreen").hide();
        this.notify("getStatus");
        this.notify("getCatalogList")
    },
    _onMessageCallback : function(msg) {
        xml = $($.parseXML(msg.data));
        eventName = xml.children().get(0).nodeName;
        RemoteEvent.create(eventName, xml)
    },
    _onCloseCallback : function() {
        //Show the socket connect window
        $(".splashscreen").show();
        var that = this;
        this.timeout = setTimeout(function(){
            tcpClient = that.connect();
        },3000);
    },
    _onErrorCallback : function(event) {
    }
    
}