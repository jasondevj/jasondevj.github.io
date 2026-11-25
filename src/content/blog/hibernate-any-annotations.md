---
title: "How to Use Hibernate @Any Annotations"
description: "Mapping one association to unrelated entity types with Hibernate's @Any and @AnyMetaDef, using a library of books, DVDs and VHS tapes."
pubDate: 2009-11-25
tags: [java, hibernate]
originalUrl: https://web.archive.org/web/20150320002806/http://blog.jasondevj.com:80/2009/11/how-to-use-hibernate-any-annotations.html
originalSource: my old blog
syndicate: false
---

For example let's assume three different applications which manage a media library - the first application manages books borrowing, the second one DVDs, and the third VHSs. The applications have nothing in common. Now we want to develop a new application that manages all three media types and reuses the exiting Book, DVD, and VHS entities. Since Book, DVD, and VHS classes came from different applications they don't have any ancestor entity - the common ancestor is java.lang.Object. Still we would like to have one Borrow entity which can refer to any of the possible media type. To solve this type of references we can use the any mapping. this mapping always includes more than one column: one column includes the type of the entity the current mapped property refers to and the other includes the identity of the entity, for example if we refer to a book it the first column will include a marker for the Book entity type and the second one will include the id of the specific book.

```java
@Entity
@Table(name = "BORROW")
public class Borrow{

    @Id
    @GeneratedValue
    private Long id;

    @Any(metaColumn = @Column(name = "ITEM_TYPE"))
    @AnyMetaDef(idType = "long", metaType = "string",
        metaValues = {
            @MetaValue(targetEntity = Book.class, value = "B"),
            @MetaValue(targetEntity = VHS.class, value = "V"),
            @MetaValue(targetEntity = DVD.class, value = "D")
        })
    @JoinColumn(name="ITEM_ID")
    private Object item;

    .......
    public Object getItem() {
        return item;
    }

    public void setItem(Object item) {
        this.item = item;
    }

}
```
