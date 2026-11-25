---
title: "Some of the New Features in JDK 8"
description: "A tour of JDK 8 before release: PermGen replaced by Metaspace, lambdas and method references, parallel sorting, and more."
pubDate: 2013-07-10
tags: [java, jdk]
originalUrl: https://web.archive.org/web/20130904220515/http://blog.jasondevj.com:80/2013/07/some-of-new-features-in-jdk-8.html
originalSource: my old blog
syndicate: false
---

Oracle has really pushed for JDK 8 release, trying to keep to their word of releasing it within two years. We are currently at M7 (b94) which was released on **2013/06/13** I think its right about time to talk a bit on some of the interesting new features which are available.

- Remove the Permanent Generation
- Lambda expressions
- Parallel Array Sorting
- New Date & Time API
- Define a standard API for Base64 encoding and decoding
- New Javascript engine.

## Remove the PermGen

The PermGen (Permanent Generation) space has been completely removed and replaced by a new space called **Metaspace** .

The consequences of the PermGen removal is that the PermSize and MaxPermSize JVM arguments will be ignored with warning messages if present when starting the JVM

However that doesn't mean you won't have to worry about the class metadata memory footprint and it does not eliminate class and Classloader memory leaks (if there any). Most allocations for the class metadata are now allocated out of native memory. By default class metadata allocation is limited by the amount of available native memory.

I really think this is a bad idea, currently if do have a memory leak in PermGen we end up only crashing the JVM and we can easily restart the JVM but if we end up filling the native memory we might end up crashing the server, but a new flag is available (MaxMetaspaceSize), allowing you to limit the amount of native memory used for class Metadata. The Metaspace will dynamically re-size depending on the application demand at runtime. There is obviously some garbage collection involved but I don't think that there is much to worry about here unless you have a problem of Classloader memory leak. We just need to wait and see what are the new problems this is going to introduces.

## Lambda expressions

This is something I was really looking forward to for couple of years now, I think this would be the Scala killer

Lets get something straight here, Lambda does not let you do something new which cannot be done in JDK 7 &lt; it just gives you a better (less lines) way to represent a block of code. Until JDK 8, the way to achieve processing of a method via another method is to pass an object. which is similar to a callback method or pass an anonyms override object.

```java
action.execute(new Runnable() {
    @Override
    public void handle(Event event) {
        System.out.println("Hi There !!");
    }
});
```

The issue with callbacks is that it leads to verbose code. Like you would write 5 lines of code when the real job is in 1 of these 5 lines.

With JDK 8 you will have something similar to the following :

```java
action.execute(
    event -> System.out.println("Hi There !!")
);
```

You can do method referencing, meaning you can pass a method as an argument to another method. Method references work differently between static and non static methods.

```java
public class Utils implements Comparable<MyObject> {

    public static int compareByLength(String in, String out){
        return in.length() - out.length();
    }

    @Override
    public int compareTo(MyObject obj) {
        return 1
    }
}

public class RunThis {

    public static void main(String[] ar) {
        String[] args = new String[] {"Microsoft: Rocks", "Linux: Wow", "Apple: Sucks"}

        Arrays.sort(args, Utils::compareByLength);
        Utils util = new Utils();
        Arrays.sort(args, util::compareTo);
    }
}
```

There are many other things to discuss about lambda, but that’s for another post.

## Parallel array sorting

[Arrays#parallelSort](http://openjdk.java.net/jeps/103) this was introduced newly in JDK8

Arrays#parallelSort uses Fork/Join framework introduced in Java 7 which assigns the sorting tasks to multiple threads available in a pool and joins them in the end

Following methods are available :

```
parallelSort(byte[] a)
parallelSort(byte[] a, int fromIndex, int toIndex)
parallelSort(char[] a)
parallelSort(char[] a, int fromIndex, int toIndex)
parallelSort(double[] a)
parallelSort(double[] a, int fromIndex, int toIndex)
parallelSort(float[] a)
parallelSort(float[] a, int fromIndex, int toIndex)
parallelSort(int[] a)
parallelSort(int[] a, int fromIndex, int toIndex)
parallelSort(long[] a)
parallelSort(long[] a, int fromIndex, int toIndex)
parallelSort(short[] a)
parallelSort(short[] a, int fromIndex, int toIndex)
parallelSort(T[] a)
parallelSort(T[] a, Comparator<? super T> c)
parallelSort(T[] a, int fromIndex, int toIndex)
parallelSort(T[] a, int fromIndex, int toIndex, Comparator<? super T> c)
```

## New Date & Time API

Nothing much to talk about here, but only the fact most of the current features available in JodaTime API is available natively in JDK8

## Define a standard API for Base64 encoding and decoding

Again nothing much here everything available Base64 library (part of apache commons) So this feature is simply to implement a standard API for Base64 and to avoid people to have to use unsupported classes such as sun.misc.BASE64Encoder and sun.misc.BASE64Decoder.

## New JavaScript engine

JDK 8 will juice JavaScript performance on the Java Virtual Machine using Project Nashorn, a Javascript engine that will use the JVM libraries and will replace the existing Rhino engine. Design and implement a new lightweight, high-performance implementation of JavaScript, and integrate it into the JDK. The new engine will be made available to Java applications via the existing `javax.script` API, and also more generally via a new command-line tool.
