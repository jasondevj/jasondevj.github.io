---
title: "Are You a Senior or a Junior Software Engineer?"
description: "An urgent fix to a legacy batch job, walked through step by step, to show how experience changes the way you read code."
pubDate: 2014-03-27
tags: [engineering-culture, java]
originalUrl: https://web.archive.org/web/20140401074151/http://blog.jasondevj.com:80/2014/03/are-you-senior-or-junior-software.html
originalSource: my old blog
syndicate: false
---

This is a not a test, it’s just for you to understand how with experience your programming mind changes.

Background, couple of days ago I had to make an urgent fix on one of our legacy system, so I checkout the code and started looking at it. I did not have a local deployment and did not have any time to test it locally had to make the change and test it on staging server and deploy it.

After I finished the changes I could not stop wondering how many places I could have gone wrong on the fix and messed up everything, I’m sure if I was just starting to programme I would have messed it up.

I will take you through the code and the changes and every time before going to the next section spend some time and try to analyze the code to find any issues.

Old code, Problem was on every element on the list we were doing a time consuming task.

```java
public void doUpdate(List list) {

    for (int i = 0; i < list.size(); i++) {
        String sql = (String) list.get(i);
         int count = doSomethingTimeConsuming(sql);
        System.out.println(count);
    }
}
```

Solution : I was able to find a alternative method which takes a String[] as parameter which can do the job in a batch, the method requires none Null and none Null element array

```java
public void doUpdate(List list) {

    String[] array = new String[100];

    for (int i = 0; i < list.size(); i++) {

        String sql = (String) list.get(i);
        array[i % 100] = sql;

         if (i % 100 == 0) {
             int count = doSomethingTimeConsuming(array);
             System.out.println(count);
         }
    }
}
```

Before looking down, spend some time and analyze the code

```java
public void doUpdate(List list) {

    String[] array = new String[100];

    for (int i = 0; i < list.size(); i++) {

        String sql = (String) list.get(i);
        array[i % 100] = sql;

         if (i % 100 == 0) {
             int count = doSomethingTimeConsuming(array);
             System.out.println(count);
         }
    }
    // wright all the unwritten content
    doSomethingTimeConsuming(array);
}
```

Were you able to identify the above issue?, okay lets continue to the next step, before going down spend some time and analyze the code even better

```java
public void doUpdate(List list) {

    String[] array = new String[100];

    for (int i = 0; i < list.size(); i++) {

        String sql = (String) list.get(i);
        array[i % 100] = sql;

         if (i % 100 == 0) {
             int count = doSomethingTimeConsuming(array);
             System.out.println(count);
         }
    }
    // wright all the unwritten content
    final int remainder = list.size() % 100;
    final String[] dest = new String[remainder];
    //avoid doing the task on already completed elements
    System.arraycopy(array, 0, dest, 0, remainder);
    doSomethingTimeConsuming(dest);
}
```

Did you get why we needed to do that?, OK again, before clicking on next analyze the code for more improvements.

```java
public void doUpdate(List list) {

    if (list.isEmpty())
        return;

    String[] array = new String[100];

    for (int i = 0; i < list.size(); i++) {

        String sql = (String) list.get(i);
        array[i % 100] = sql;

         if (i % 100 == 0) {
             int count = doSomethingTimeConsuming(array);
             System.out.println(count);
         }
    }
    // wright all the unwritten content
    final int remainder = list.size() % 100;
    final String[] dest = new String[remainder];
    //avoid doing the task on already completed elements
    System.arraycopy(array, 0, dest, 0, remainder);
    doSomethingTimeConsuming(dest);
}
```

Someone might have even done the below code, but it depends on the system performance and the overhead of introducing a List will bring in.

```java
public void doUpdate(List list) {

    if (list.isEmpty())
        return;

    final int batchSize = 100;
    List tmpList = new ArrayList(batchSize + 1);
    for (int i = 0; i < list.size(); i++) {

        String sql = (String) list.get(i);
        tmpList.add(sql);

         if (i % batchSize == 0) {
             int count = doSomethingTimeConsuming((String[]) tmpList.toArray());
             System.out.println(count);
         }
    }
    int count = doSomethingTimeConsuming((String[]) tmpList.toArray(new Object[list.size() % batchSize]));
    System.out.println(count);
}
```

Likewise I’m sure everyone with experience would think about all the usecases before even compiling the code.
