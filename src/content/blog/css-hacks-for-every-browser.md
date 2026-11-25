---
title: "CSS Hacks for Every Browser"
description: "A reference of selector and attribute hacks for targeting specific versions of IE, Firefox, Chrome, Safari and Opera from inside a stylesheet."
pubDate: 2011-09-02
tags: [css, vaadin]
originalUrl: https://web.archive.org/web/20190822133152/http://blog.jasondevj.com/2011/09/css-hacks-for-every-browser.html
originalSource: my old blog
syndicate: false
---

There are many CSS hacks that I have come across while developing web applications, mostly used one is the IE's conditional comments to apply classes to the body tag but there are some situation where you will want to add conditional CSS within the stylesheet, specially if your working with Vaadin

The following is a documentation of browser specific CSS style attribute I've seen. These CSS will help you better make specific changes to IE, Firefox, Chrome, Safari and Opera from within the CSS.

```css
/* Selector Hacks **/

/* IE6 and below */
* html #uno  { color: blue }

/* IE7 */
*:first-child+html #dos { color: blue }

/* IE7, FF, Saf, Opera  */
html>body #tres { color: blue }

/* IE8, FF, Saf, Opera (Everything but IE 6,7) */
html>/**/body #cuatro { color: blue }

/* Opera 9.27 and below, safari 2 */
html:first-child #cinco { color: blue }

/* Safari 2-3 */
html[xmlns*=""] body:last-child #seis { color: blue }

/* safari 3+, chrome 1+, opera9+, ff 3.5+ */
body:nth-of-type(1) #siete { color: blue }

/* safari 3+, chrome 1+, opera9+, ff 3.5+ */
body:first-of-type #ocho {  color: blue }

/* saf3+, chrome1+ */
@media screen and (-webkit-min-device-pixel-ratio:0) {
 #diez  { color: blue  }
}

/* iPhone / mobile webkit */
@media screen and (max-device-width: 480px) {
 #veintiseis { color: blue  }
}

/* Safari 2 - 3.1 */
html[xmlns*=""]:root #trece  { color: blue  }

/* Safari 2 - 3.1, Opera 9.25 */
*|html[xmlns*=""] #catorce { color: blue  }

/* Everything but IE6-8 */
:root *> #quince { color: blue  }

/* IE7 */
*+html #dieciocho {  color: blue }

/* Firefox only. 1+ */
#veinticuatro,  x:-moz-any-link  { color: blue }

/* Firefox 3.0+ */
#veinticinco,  x:-moz-any-link, x:default  { color: blue  }

/* FF 3.5+ */
body:not(:-moz-handler-blocked) #cuarenta { color: blue; }

/* Attribute Hacks **/

/* IE6 */
#once { _color: blue }

/* IE6, IE7 */
#doce { *color: blue; /* or #color: blue */ }

/* Everything but IE6 */
#diecisiete { color/**/: blue }

/* IE6, IE7, IE8 */
#diecinueve { color: blue\9; }

/* IE7, IE8 */
#veinte { color/*\**/: blue\9; }

/* IE6, IE7 -- acts as an !important */
#veintesiete { color: blue !ie; } /* string after ! can be anything */

/* IE8, IE9 */
#anotherone  {color: blue\0/;} /* must go at the END of all rules */
```
