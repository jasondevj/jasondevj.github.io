---
title: "Hibernate Annotation for a Map Enum Type"
description: "Mapping a java.util.Map with an enum key and a String value using Hibernate annotations, and the ClassCastException I worked around."
pubDate: 2009-11-26
tags: [java, hibernate]
originalUrl: https://web.archive.org/web/20190701111739/http://blog.jasondevj.com:80/2009/11/hibernate-annotation-for-map-enum-type.html
originalSource: my old blog
syndicate: false
---

[Hibernate Annotations](http://annotations.hibernate.org/) are so great, especially together with the [Hibernate Tools](http://tools.hibernate.org/) that allows to generate the whole database (sql table definitions) from your annotated beans. Right now I mapped the first time a `java.util.Map` with some `enum` type as key and a primitive type as value (`java.lang.String`). The mapping looks like the following:

```java
public class Test {
    @CollectionOfElements
    @JoinTable(name = "my_table")
    @Cascade(value = org.hibernate.annotations.CascadeType.DELETE_ORPHAN)
    @Enumerated(value = EnumType.STRING)
    @org.hibernate.annotations.MapKey(columns = {@Column(name = "my_enum")})
    @Column(name = "my_value", length = 4000)
    public Map getMappedValues() {
        return _mappedValues;
    }

}
```

What I was not able to do was to define the type of the value (String) as hibernate type `text`. This gave the correct table/column definition at build time (hibernate tools), but a `ClassCastException` at runtime, saying that `MyEnumType` is not compatible to hibernate’s type `text`. So I used the `length` of the `@Column` annotation as a temporary workaround - I’ll dig into this now or later
