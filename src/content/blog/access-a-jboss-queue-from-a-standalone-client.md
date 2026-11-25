---
title: "How to Access a JBoss Queue with a Standalone Client"
description: "Setting up a JBoss Messaging queue and talking to it from a standalone JMS client: JNDI context, producer, and message listener."
pubDate: 2011-02-26
tags: [java, jboss, jms]
originalUrl: https://web.archive.org/web/20190822142527/http://blog.jasondevj.com/2011/02/how-to-access-jboss-queue-with.html
originalSource: my old blog
syndicate: false
---

In this post I'm going to talk about how to access a JBoss queue using a standalone client. I'm not going to talk about the basic details of creating a queue that you can find in JBoss documents.

There is two steps to this

1. Setup the JBoss queue
2. Setup the standalone client

Lets start with the JBoss queue, lets create a normal queue

```
<mbean <name="jboss.messaging.destination:service=Queue, name=Queue1" code="org.jboss.jms.server.destination.QueueService">
  <attribute name="JNDIName">queue/Queue1</attribute>
  <depends optional-attribute-name="ServerPeer">jboss.messaging:service=ServerPeer</depends>
  <depends>jboss.messaging:service=PostOffice</depends>
</mbean>
```

Now lets setup the remote client. Make sure the JBoss necessary libraries are in the classpath.

```java
public static Context getInitialContext( ) throws javax.naming.NamingException {
   Properties p = new Properties( );
   p.put(Context.INITIAL_CONTEXT_FACTORY, "org.jnp.interfaces.NamingContextFactory");
   p.put(Context.URL_PKG_PREFIXES," org.jboss.naming:org.jnp.interfaces");
   p.put(Context.PROVIDER_URL, "jnp://127.0.0.1:1099");
   return new InitialContext(p);
  }
```

now lets setup the queue

```
String queueName = "queue/Queue1";
Context ic = null;
ConnectionFactory cf = null;
Connection connection =  null;
QueueSession queueSession;

connectionFactory = (ConnectionFactory) ctx.lookup("/ConnectionFactory");
conn = connectionFactory.createQueueConnection();

queueSession = conn.createQueueSession(false, Session.AUTO_ACKNOWLEDGE);
queue = (Queue) ctx.lookup(queueName);
MessageProducer queuePublisher = queueSession.createProducer(queue);
```

You can change the JNDI name of connection factory or you can create your own.

Now lets setup a listener.

```
MessageConsumer consumer = queueSession.createConsumer(queue);
conn.start();
consumer.setMessageListener(this);
```

You can test the connection by sending simple message

```java
TextMessage message = queueSession.createTextMessage("Hello Sourabh Girdhar");
publisher.send(message);

To receive messages you will need to implement MessageListener interface and override the onMessage()
public void onMessage(Message msg) {
 TextMessage message = (TextMessage) msg;
 String text = null;
 try{
  text = message.getText();
  System.out.println("Message received - " + text);
 }catch (JMSException jme){
  jme.printStackTrace();
 }
   }
```
