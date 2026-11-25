---
title: "What Is Java Memory Leakage?"
description: "How Java objects stay reachable and leak memory, how heap size differs from RSS, and the profilers I used to track leaks down."
pubDate: 2009-09-15
tags: [java, jvm, debugging]
originalUrl: https://web.archive.org/web/20190701111715/http://blog.jasondevj.com:80/2009/09/what-is-java-memory-leakage.html
originalSource: my old blog
syndicate: false
---

In java all the object are freed automatically by Garbage Collector when object are not in use. but some situation Garbage Collector unable free an object. because when an object reference is stored in anther object Garbage Collector can't free that object.

example:

```java
Vector store = new Vector();
String notGarbageCollectedObject =new String("StringObject");
store.add(notGarbageCollecteObject);
```

until you will remove ( store.remove(notGarbageCollectedObject )) the String object reference (notGarbageCollectedObject ) from vector Garbage Collector not deallocates that object. this causes memory leakage.

There are three main behaviors in java application when there is a memory leakage.

1. If your application is leaking memory over time, eventually you are going to get a `java.lang.OutOfMemoryError` exception.
2. Application heap usage will grow continuously (not application size).
3. Application will terminate automatically.

RSS value is different to heap space.

Java heap is the heap size allocated to JVM applications which takes care of the new objects being created. If the objects being created exceed the heap size, it will throw an error saying memoryOutofBound. Default heap size is 63mb. It can be modified using command -Xms32m -Xmx512m (minimum 32mb maximum 512mb).

Java uses shared libraries, thread space and other resources to execute. RSS is the amount of resident memory which can change without the application using more or less memory (it how much has been put into physical memory).

find heap size using following java API.

```java
Runtime runtime = Runtime.getRuntime();
long maxMemory = runtime.maxMemory();
long allocatedMemory = runtime.totalMemory();
long freeMemory = runtime.freeMemory();
System.out.println("allocated memory: " + (allocatedMemory / 1024) / 1024 + "MB");
System.out.println("max memory: " + (maxMemory / 1024) / 1024 + "MB");
System.out.println("total free memory: " + ((freeMemory + (maxMemory - allocatedMemory)) / 1024) / 1024 + "MB");
```

Output:

free memory: 39MB allocated memory: 81MB max memory: 508MB total free memory: 466MB .

how to find java memory leakage?

by using memory profiler you can find memory leakage

Memory profilers:

- [JMP (Java Memory Profiler)](http://www.khelekore.org/jmp/), a free profiler from Khelekore
- [JProfiler](http://www.ej-technologies.com/products/jprofiler/overview.html)
- [YourKit](http://www.yourkit.com/)
- [HPjmeter](http://h20392.www2.hp.com/portal/swdepot/displayProductInfo.do?productNumber=HPUXJAVAHOME)

java 1.6 it self has tool find memory usage .
