jQuery - Hotspot
===

A [jQuery](http://www.jquery.com) plugin for creating *Hotspots* in an HTML element. This plugin operates in two modes, `admin` and `display`. The **admin mode** enables user to create hotspots on desired HTML elements. The **display mode** is used for only displaying the hotspots to the end user. The design of the hotspot created are fully customizable. User can add their own CSS class to style the hotspots.

### [View Demo](http://aniruddhanath.github.io/jquery-hotspot/)

Note: Ensures responsiveness with the latest update.

The Setup
---------

```
npm install jquery-hotspot
```

Include `jquery.hotspot.js` at the bottom of the HTML page before the closing body tag. Wrap the HTML element for which the hotspot is to be obtained with another element. Also include the `jquery.hotspot.css` file to go with some of the default design decisions.
```
<div id="theElement">
  <img src="theImage.jpg" />
</div>
```
The plugin instance will be called with `theElement`.
> **Note:** The CSS property, *position* for this element should be kept as *relative*.
```
#theElement {
  position: relative;
}
```


Usage - Display mode
--------------------

The data associated with the hotspots can be passed in directly to the plugin. The data can also be fetched from a backend server by enabling `ajax` option.

There are three options given for hotspot-interactivity - hover, click and none.
- **hover** : The data associated with the hotspot will show up on *hovering* over spot.
- **click** : The data associated will show up on *clicking* the spot.
- **none** : The data will be static and would not be affected by any events.

### Basic call with known coordinates:
```
$('#theElement').hotspot({
  data: [
    { "x":18, "y":38, "Title":"The Title","Message":"Create the Message here" },
    { "x":43, "y":40, "Title":"jQuery Hotspot","Message":"This jQuery Plugin lets you create hotspot to any HTML element." }
  ],
  tag: 'img', //optional (default is img)
  interactivity: "hover", // options : click, none (default is hover)
  hotspotClass: 'Hotspot'
});
```
The `data` object above can be populated with any number of properties and can be designed with appropriate CSS. The `tag` variable passed to the plugin determines the type of HTML tag for which the hotspot is obtained. The `hotspotClass` is class of the hotspots created. One can change the look of the  hotspot by applying some CSS to this class.

### Fetching data via AJAX call
```
$("#theElement").hotspot({
  ajax: true, // Switching on the ajax
  ajaxOptions: {
    url: '/hotspots',
    type: 'GET',
    ...
  },
  interactivity: "hover" // options : click, none (default is hover)
});
```
The data coming from the server-side is expected to be JSON encoded. The object `ajaxOptions` can be utilized to change the http headers, etc.


Usage - Admin mode
--------------------
### Standard call
```
$("#theElement").hotspot({
  mode: "admin", // Switching to admin mode
  ajax: true, // Turn on ajax
  ajaxOptions: {
    url: '/hotspots',
    type: 'POST',
    ...
  },
  interactivity: "hover" // options : click, none (default is hover)
});
```
`ajax` and `ajaxOptions` are required here so that the hotspot that are being created in the admin mode get stored in the server. However if someone turn off the ajax, then the hotspots data gets stored in the browser's LocalStorage.

Key Features 
------------

1. Any number of *messages/nodes* can be stuffed in a single hotspot. To do so the `schema` parameter is passed to the plugin. By default there are two nodes (Title and Message)

```
$("#theElement").hotspot({
  mode: "admin", // Switching to admin mode
  ajax: true, // Turn on ajax
  ajaxOptions: {
    url: '/hotspots',
    type: 'POST',
    ...
  },
  schema: [
    {
      'property': 'Time',
      'default': '5:40am'
    },
    {
      'property': 'Date',
      'default': '12/11/2018'
    },
    {
      'property': 'Place',
      'default': 'Siberia'
    },
  ]
});
```
The `default` property in the `schema` object above will be overwritten everytime a new hotspot is created.

2. The plugin also provides some basic functions that can be invoked after certain events in the process of creation of hotspots.

```
$("#theElement").hotspot({
  mode: "admin", // Switching to admin mode
  ajax: true, // Turn on ajax
  ajaxOptions: {
    url: '/hotspots',
    type: 'POST',
    ...
  },
  afterSave: function(err, data) {
    // hotspots `data` in json format can be stored
    //  & passed in `display` mode for the image
  },
  afterRemove: function(err, message) {
    // `message` from the plugin
  },
  afterSend: function(error, message) {
    // check if any `error` has occurred
  }
});
```
These functions can be utilized to keep track of the flow of hotspot creation.

3. The plugin can be used with any number of HTML elements in a page. However to do so, the `LS_Variable` passed to the plugin should be named uniquely for every instance. This helps plugin to avoid conflicts and while using HTML5 LocalStorage. 

HTML : 
```
<div id="theElement-a">
  <img src="theImage-a.jpg" />
</div>
<div id="theElement-b">
  <img src="theImage-b.jpg" />
</div>
```

JavaScript :

```
$("#theElement-a").hotspot({
  mode: "admin",
  ...
  LS_Variable: "HotspotPlugin-a"
});

$("#theElement-b").hotspot({
  mode: "admin",
    ...
  LS_Variable: "HotspotPlugin-b"
});
```

For better clarity the examples folder can be checked


Fetch data via AJAX Request
------------

Include jquery and hotspot plugin in the html code.

```
<script type="text/javascript">
$.ajax({url: "mytest.aspx/GetHotSpotData", success: function (result) {
  $("#HotspotPlugin_image").hotspot({
    data: result,
    interactivity: "click",
  });
}});
</script>
```

Also make sure `result` passed as `data` in the plugin should be an array of objects.
```
[
  { "x":18, "y":29, "Title":"The Title","Message":"Create the Message here" },
  { "x":14, "y":40, "Title":"jQuery Hotspot","Message":"This jQuery Plugin lets you create hotspot to any HTML element." }
]
```
