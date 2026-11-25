---
title: "Clojure and Vaadin"
description: "A minimal example of writing a Vaadin web application in Clojure, from the servlet to a macro for building windows."
pubDate: 2011-05-11
tags: [clojure, vaadin]
originalUrl: https://web.archive.org/web/20190822142143/http://blog.jasondevj.com/2011/05/clojure-and-vaddin.html
originalSource: my old blog
syndicate: false
---

I been working on Clojure and Vaadin for some time now and I think It's right about time I write a blog on how to do it. This is a really simple example for someone to get start on.

First thing that we need to do to get things started is to create a servlet clojure file which will load the Vaadin application.

```clojure
(ns example.vaadin-servlet
  (:gen-class
    :extends com.vaadin.terminal.gwt.server.AbstractApplicationServlet
    :name example.VaadinServlet))

(defn ^Class -getApplicationClass [this]
  example.VApp)

(defn ^hms.appstore.ui.main.VApp -getNewApplication [this request]
  (example.VApp.))
```

This will be the servlet that you will add into the web.xml keep in mind the java class name will be example.VaadinServlet.

Next is to create the Vaadin Application which would look something this.

```clojure
(ns example.vapp
  (:gen-class
    :extends com.vaadin.Application
    :name example.VApp
    :init cjinit))

(defn -cjinit []
  [[] (ref {})])

(defmacro window [name caption container & body]
  `(let [caption# ~caption
         container# ~container
         ~name (com.vaadin.ui.Window. caption# container#)
         ~(symbol (str name "-" "container")) container#]
    ~@body))

(defn -init [this]
  (println "=== Initiating Vaadin Application ==")
  (let [comps (transient {})]
    (window w "Clojure Vaadin Application" (com.vaadin.ui.VerticalLayout)
      (.setSizeUndefined w-container)
      (.setMainWindow this w)
      (let [layout (com.vaadin.ui.VerticalLayout.)])
      (.addComponent w-container layout)
      (.addComponent layout (com.vaadin.ui.Label. "Test Message")))))
```

Thats all. I have used a macro for the window can do without that as well.
