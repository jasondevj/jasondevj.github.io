---
title: "Where to Put Named Queries in JPA?"
description: "Annotations, inline strings or XML mapping files: the trade-offs of each place to define JPQL queries, and why XML is often overlooked."
pubDate: 2010-09-08
tags: [java, jpa]
originalUrl: https://web.archive.org/web/20140129061400/http://blog.jasondevj.com:80/2010/09/where-to-put-named-queries-in-jpa.html
originalSource: my old blog
syndicate: false
---

JPA provides multiple ways to obtain entities. There is a very simple programmatic API that allows us to get an entity by ID, there’s a more elaborate one called the Criteria API and then there’s a query language called JPQL (Java Persistence Query Language).

JPQL is an object oriented query language that is based on the simplicity of SQL, but works directly on objects and their properties. The problem with such a language that’s used inside another language (Java) is where to store the query definition. Traditionally there have been 2 solutions:

1. Store the definitions in annotations on some entity.
2. Construct strings holding the definitions inline in your Java code.

The first solution is called a Named Query in JPA, it looks like this:

```java
@NamedQueries(value={
   @NamedQuery(
      name = "Website.getWebsiteByUserId",
      query="select website from Website website where website.userId = :userId")
   @NamedQuery(...)
})
@Entity
public class Website { ... }
```

The advantages of this method are twofold: JPA checks your query is valid at startup time (no runtime surprises) and the query definition is parsed only once and re-used afterwards. As an extra bonus, it also strongly encourages to used named parameters. The disadvantage however is that its location is just plain awkward. The entity is typically not the location where we wish to store this kind of logic. It gets even more awkward when the query is about multiple entities, yet you have to choose a single one to store the query definition on. Instead, a DAO, Service or whatever code is used to interact with the entity manager is a much more logical place to store a query definition. Unfortunately, @NamedQuery only works on entities. Neither Enterprise beans nor any other kind of managed bean in Java EE supports them.

This thus brings us to the second solution, which looks like this:

```java
public foo() {
    // some code
    Website website = entityManager.createQuery(
      "select website from Website website where website.userId = :userId", Website.class)
      .setParameter("userId", userId)
      .getSingleResult();
}
```

This is arguably a much better location, though still not ideal. If the query is long, we have to concatenate strings which makes the query hard to read and hard to maintain. It has the major disadvantage that the query is only checked at runtime and has to be re-parsed over and over again. There are some limited opportunities for reusing a Query object obtained by createQuery(), but since this object is only valid as long as the persistence context in which it was created is still active, those opportunities are really rather limited. Additionally, this style of query definition can make it tempting for developers to build their queries dynamically, giving rise to some nasty potential injection holes.

So having the choice between those two, which one do we choose? Actually, it appears there is a third solution, which is for some reason quite often overlooked by many people:

3. Store the query text in XML (mapping) files.

In addition to annotations, JPA (and pretty much every API in Java EE that uses annotations) allows you to define the same thing or occasionally a little more in XML. Of course we don’t want one huge XML file with all our queries, but as it turns out JPA simply allows us to use as many files as we need and organize them in whatever way we want. We could for example put all queries related to some entity in one file anyway, or put all financial queries in one file and all core queries in another file, etc. The mechanism is actually quite similar to using multiple faces-config.xml files in JSF. The XML based solution looks as follows.

**persistence.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://java.sun.com/xml/ns/persistence"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://java.sun.com/xml/ns/persistence http://java.sun.com/xml/ns/persistence/persistence_1_0.xsd"
    version="1.0">

    <persistence-unit name="somePU">
        <jta-data-source>java:/someDS</jta-data-source>

        <!-- Named JPQL queries per entity, but any other organization is possible  -->
        <mapping-file>META-INF/jpql/Website.xml</mapping-file>
        <mapping-file>META-INF/jpql/User.xml</mapping-file>
        </persistence-unit>
</persistence>
```

**Website.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<entity-mappings version="1.0" xmlns="http://java.sun.com/xml/ns/persistence/orm"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://java.sun.com/xml/ns/persistence/orm http://java.sun.com/xml/ns/persistence/orm_1_0.xsd "
>
    <named-query name="Website.getByUserId">
        <query>
            SELECT
                website
            FROM
                Website website
            WHERE
                website.userId = :userId
        </query>
    </named-query>

    <named-query name="Website.foobar">
        <query>
            ...
        </query>
    </named-query>
</entity-mappings>
```

Finally, using such query definitions in code is exactly the same as if they would have been defined using annotations, i.e. by calling entityManager.createNamedQuery().

Each XML file can contain as few or as many queries as you like. It might make sense to put a really complicated and huge query in one file, but to group several smaller related queries in another file. Do note that query names are part of a global namespace and are not automatically put in any namespace based on the file they are defined in. In the example above queries are pre-fixed with “Website.”, which happens to be the name of the entity but you can choose anything you want here. In the example META-INF/jpql was used as the directory to store queries, but any location on the class path including storing queries in jars will do.

As mentioned, for some reason this XML method seem to be often overlooked by many people. I’ve personally met multiple persons who build themselves a management system for storing JPQL queries in files, loading them, substituting parameters, etc while such a mechanism is in fact readily available in JPA (and has been since JPA 1.0!). Of course, the home grown systems don’t have the startup-time validation of queries nor do they do any pre-parsing and pre-compilation of queries.
