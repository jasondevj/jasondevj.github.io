---
name: hotpotato
summary: A high-performance, throughput-oriented HTTP client library for Java, built on Netty. I contributed client management features.
repo: https://github.com/jasondevj/hotpotato
language: Java
started: 2011
lastActive: 2011
stars: 6
license: Apache-2.0
role: contributor
featured: true
highlights:
  - title: Built on Netty
    text: "An asynchronous HTTP client designed for heavy server-side concurrency."
  - title: One client, many threads
    text: "Share one instance across threads with no extra synchronisation, and connections are reused."
  - title: My part
    text: "In 2011 I added client managers and support for managing several clients together."
---

hotpotato (or "hptt", from the common misspelling of http) is a Java HTTP client library built for speed and low resource use on the server side, with support for HTTP/1.1 pipelining. It was created by **Bruno de Carvalho**. My repository is a copy of the project that I worked on in 2011.

## What the library does

It's built on Netty and designed for heavy concurrency. Many threads can share one client instance without external synchronisation, and connections are reused wherever possible to cut connection set-up time. It offers two APIs:

- **HttpClient**, for full control over each request, in synchronous or asynchronous mode.
- **HttpSession**, which handles redirects, proxies, Basic and Digest authentication, and optional cookie storage for you.

```java
HttpClient client = new DefaultHttpClient();
client.init();

HttpRequest request = new DefaultHttpRequest(HttpVersion.HTTP_1_1, HttpMethod.GET, "/");
HttpRequestFuture<String> future = client.execute("example.com", 80, request, new BodyAsStringProcessor());
future.awaitUninterruptibly();

if (future.isSuccessfulResponse()) {
    System.out.println(future.getProcessedResult());
}

client.terminate();
```

## My contributions

Between February and May 2011 I added:

- **Client managers**, for creating and managing several HTTP clients together, with a sample client manager
- **Multiple-client management**, plus follow-up refactoring
- hotpotato in the project's performance comparisons
- a null check on the host URI

The library is licensed under the Apache License 2.0.
