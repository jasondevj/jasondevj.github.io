---
title: "Telco-Based SMS and MMS Applications Using Java and .NET"
description: "AppZone, the telco app store Etisalat Sri Lanka launched with hSenid Mobile, and how developers could send SMS and MMS from Java or .NET."
pubDate: 2011-02-01
tags: [telco, java, sms]
originalUrl: https://web.archive.org/web/20140129061837/http://blog.jasondevj.com:80/2011/02/telco-based-sms-and-mms-application.html
originalSource: my old blog
syndicate: false
---

AppZone is the Worlds first ever Telco based mobile application appstore launched by Etisalat Sri Lanka partnered with hSenid Mobile. This platform allows the users to browse the mobile applications and also gives the opportunity for application developers to create, test and sell their own unique applications. It helps developers to create application using Java , .NET or any other programming language (which supports HTTP) they prefer, to send a receive SMS and MMS to mobile phones. Which gives the opportunity for developers to get recursive revenue which is not available in downloadable application for mobile handsets.

Sample code:

```java
public class SimpleSmsMt {
    public static void main(String[] args) {
        try {
            MchoiceAventuraSmsSender sender = new MchoiceAventuraSmsSender(
                    new URL("http://appzone.server:8899/"), "SMS_6063", "test");
            // send message to a single destination
            String message = "hi im jason";
            String address = "+94969696969";
            sender.sendMessage(message, address);
        } catch (Throwable e) {
            e.printStackTrace(System.err);
        }
    }
}
```

Use the API's to create your applications and services. The downloads you need are here, as well as the documentation and the community to speed things up. [http://appzone.lk/devzone.html](http://appzone.lk/devzone.html)

If you have created the application its easy as to drop a mail to go live.

Drop a mail to support@appzone.lk to get your account details or if you want any clarification.
