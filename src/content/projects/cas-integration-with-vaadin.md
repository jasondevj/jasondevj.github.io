---
name: cas-integration-with-vaadin
summary: Single sign-on for Vaadin applications using CAS and Spring Security, with role filtering.
repo: https://github.com/jasondevj/cas-integration-with-vaadin
language: Java
started: 2011
lastActive: 2012
stars: 6
license: Apache-2.0
highlights:
  - title: Single sign-on
    text: "Vaadin applications sign users in through CAS."
  - title: Configured once
    text: "All the CAS filters live in a shared core module built on Spring Security."
  - title: Easy to adopt
    text: "An app only needs cas.properties, spring-security.xml and the core dependency."
---

A Spring Security wrapper that lets Vaadin applications authenticate users through CAS (Central Authentication Service), so they get proper single sign-on and role-based access.

## How it fits together

All the CAS filters are configured in the **core** module. A Vaadin application only needs:

- a `cas.properties` file with the CAS configuration,
- a `spring-security.xml` that sets the filter URL and the user data source (a database or a plain XML file),
- the core module as a dependency.

## Trying it out

The repository includes a sample application. Click **do something** while signed out and you're redirected to CAS to sign in, which demonstrates the SSO flow.

There's also a JSP login at `/jsp/login`, but it's only for demonstration and doesn't take part in SSO.
