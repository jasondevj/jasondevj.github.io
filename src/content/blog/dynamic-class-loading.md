---
title: "Dynamic Class Loading"
description: "Static loading with Java's new operator versus dynamic loading with Class.forName, and the exceptions each one throws when a class is missing."
pubDate: 2010-05-16
tags: [java, jvm]
originalUrl: https://web.archive.org/web/20130907130311/http://blog.jasondevj.com:80/2010/05/dynamic-class-loading.html
originalSource: my old blog
syndicate: false
---

## Static loading

Classes are statically loaded with Java's `new` operator.

```java
class MyClass {
    public static void main(String args[]) {
        Car c = new Car();
    }
}
```

A `NoClassDefFoundException` is thrown if a class is referenced with Java's `new` operator (i.e. static loading) but the runtime system cannot find the referenced class.

## Dynamic loading

Dynamic loading is a technique for programmatically invoking the functions of a class loader at run time. Let us look at how to load classes dynamically.

```java
Class.forName(String className); // static method which returns a Class
```

The above static method returns the class object associated with the class name. The string `className` can be supplied dynamically at run time. Unlike the static loading, the dynamic loading will decide whether to load the class `Car` or the class `Jeep` at runtime based on a properties file and/or other runtime conditions. Once the class is dynamically loaded the following method returns an instance of the loaded class. It's just like creating a class object with no arguments.

```java
class.newInstance(); // a non-static method, which creates an instance of a class (i.e. creates an object)
```

```java
Jeep myJeep = null;
// myClassName should be read from a .properties file or a Constants class.
// Stay away from hard coding values in your program.
String myClassName = "au.com.Jeep";
Class vehicleClass = Class.forName(myClassName);
myJeep = (Jeep) vehicleClass.newInstance();
myJeep.setFuelCapacity(50);
```

A `ClassNotFoundException` is thrown when an application tries to load in a class through its string name using the following methods but no definition for the class with the specified name could be found:

- the `forName(..)` method in class `Class`
- the `findSystemClass(..)` method in class `ClassLoader`
- the `loadClass(..)` method in class `ClassLoader`
