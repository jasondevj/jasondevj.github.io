---
name: javaee5-jboss-maven-archetype
summary: A Maven archetype for bootstrapping Java EE 5 applications on JBoss.
repo: https://github.com/jasondevj/javaee5-jboss-maven-archetype
language: Java
started: 2011
lastActive: 2012
stars: 4
license: Apache-2.0
highlights:
  - title: Skip the set-up
    text: "Generates a ready-to-build Java EE 5 project."
  - title: Made for JBoss
    text: "The generated project targets the JBoss application server."
  - title: Two commands
    text: "Install the archetype once, then generate as many projects as you need."
---

A Maven archetype that generates a ready-to-build Java EE 5 project for the JBoss application server, so a new project skips the usual set-up.

## Install the archetype

```bash
mvn clean install
mvn install:install-file -Dfile=./target/javaee5-jboss-maven-archetype-1.0.jar \
  -DgroupId=javaee5-jboss-maven -DartifactId=javaee5-jboss-maven-archetype \
  -Dversion=1.0 -Dpackaging=jar -DgeneratePom=true
```

## Generate a project

```bash
mvn archetype:generate -B \
  -DarchetypeGroupId=javaee5-jboss-maven-archetype \
  -DarchetypeArtifactId=javaee5-jboss-maven-archetype \
  -DarchetypeVersion=1.0 \
  -DgroupId=<your group> -DartifactId=<your artifactId>
```
