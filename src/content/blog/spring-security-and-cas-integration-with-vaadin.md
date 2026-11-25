---
title: "Spring Security and CAS Integration with Vaadin"
description: "How I added CAS single sign-on to Vaadin applications with a Spring Security wrapper, and the open-source sample that came out of it."
pubDate: 2011-05-17
tags: [java, spring, vaadin, sso]
originalUrl: https://web.archive.org/web/20190822134345/http://blog.jasondevj.com/2011/05/spring-security-and-cas-integration.html
originalSource: my old blog
syndicate: false
---

We have been working with Vaadin for some time now. We have done multiple websites and admin applications. There was a customer who requested a SSO (Single Sign On) to be added to one of the new website we are creating. So we thought its not that big of a deal; we just needed to add Spring security and then do the CAS filter and we are all done. Well the solution is striaght forward but don't even try to search this on the web, there is not even one fully integrated working solution out there, so what I did was I sat down and did a Vaadin wrapper with spring security integrated. I have used Spring 3.0.5 so all spring security tags are written for that.

This is how it looked like in the end

```java
public class SampleVaadinApplication extends VaadinApplication {

    private UriFragmentUtility fragmentUtility;
    private VerticalLayout layout;

    @Override
    public void init() {
        final Window mainWindow = new Window("Vaadin Cas Sample");
        fragmentUtility = new UriFragmentUtility();
        mainWindow.setSizeFull();
        mainWindow.addComponent(fragmentUtility);
        layout = new VerticalLayout();
        mainWindow.addComponent(layout);
        setMainWindow(mainWindow);
    }
}
public void buttonClick(Button.ClickEvent event) {
     final String path = getURL().getPath();
     if (!hasAnyRole("ROLE_DEFAULT_ACCESS")) {
        getMainWindow().open(new ExternalResource(path + "do-something/"));
     } else {
        fragmentUtility.setFragment("do-something");
     }
 }
```

web.xml you just need to add this to be the wrapper (and of cos the spring tags ;) ).

```xml
<servlet>
    <servlet-name>vaadin-loader-with-cas</servlet-name>
    <servlet-class>hailu.vaadin.authentication.core.VaadinApplicationServlet</servlet-class>
    <init-param>
        <param-name>application</param-name>
        <param-value>hailu.vaadin.authentication.sample.SampleVaadinApplication</param-value>
    </init-param>
</servlet>

<servlet-mapping>
    <servlet-name>vaadin-loader-with-cas</servlet-name>
    <url-pattern>/*</url-pattern>
</servlet-mapping>
```

I have hosted it in git you can have a look at the sample to get your self up and running. [https://github.com/jasondevj/cas-integration-with-vaadin](https://github.com/jasondevj/cas-integration-with-vaadin)
