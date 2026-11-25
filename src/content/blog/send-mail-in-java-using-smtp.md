---
title: "Send Mail in Java Using SMTP"
description: "A reusable JavaMail class that sends authenticated SMTP mail on a background thread, so the caller never blocks."
pubDate: 2010-03-02
tags: [java, email]
originalUrl: https://web.archive.org/web/20190722185217/http://blog.jasondevj.com/2010/03/send-mail-in-java-using-smtp.html
originalSource: my old blog
syndicate: false
---

I was trying to send a mail from my JSP page. I had tried every way to make that code work. Later I found that I have to set Mail Authentication, which lead me to solution. Here is my SendMail cass, which you can implement in any Java application to send mail. I have used a new Thread to send the mail, unless you do this the Thread which the mail sender was called will wait until the mail is sent due to this reason the whole program might halt for awhile

```java
import javax.mail.*;
import javax.mail.internet.*;
import java.util.*;

public class MailSender {

    private String email = "you@example.com";
    private String password = "";
    private String host = "smtp.gmail.com";
    private String port = "465";
    private String from = "you@example.com"; // if needed this can be used to set the from e-mail address
    private String toAddresses = "alice@example.com,bob@example.com";
    private String ccAddresses = "carol@example.com,dave@example.com";
    private String bccAddresses = "";

    public void sendEmail(final String subject, final String message) {
        new Thread() {
            public void run() {
                sendMail(email, password, host, port, "true",
                "true", true, "javax.net.ssl.SSLSocketFactory", "false", toAddresses, ccAddresses, bccAddresses,
                subject, message);
            }
        }.start();
    }

    public synchronized boolean sendMail(String userName, String passWord, String host, String port, String starttls,
    String auth, boolean debug, String socketFactoryClass, String fallback,
    String to,
    String cc, String bcc, String subject, String text) {
        Properties props = new Properties();
        props.put("mail.smtp.user", userName);
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", port);
        props.put("mail.smtp.starttls.enable", starttls);
        props.put("mail.smtp.auth", auth);
        props.put("mail.smtp.debug", Boolean.toString(debug));
        props.put("mail.smtp.socketFactory.port", port);
        props.put("mail.smtp.socketFactory.class", socketFactoryClass);
        props.put("mail.smtp.socketFactory.fallback", fallback);

        try {
            Session session = Session.getDefaultInstance(props, null);
            session.setDebug(debug);
            MimeMessage msg = new MimeMessage(session);
            msg.setText(text);
            msg.setSubject(subject);
            msg.setFrom(new InternetAddress(from));
            for (String aTo : to.split(",")) {
                msg.addRecipient(Message.RecipientType.TO, new InternetAddress(aTo));
            }
            if (!cc.equals("")) {
                for (String aCc : cc.split(",")) {
                    msg.addRecipient(Message.RecipientType.CC, new InternetAddress(aCc));
                }
            }
            if (!bcc.equals("")) {
                for (String aBcc : bcc.split(",")) {
                    msg.addRecipient(Message.RecipientType.BCC, new InternetAddress(aBcc));
                }
            }
            msg.saveChanges();
            Transport transport = session.getTransport("smtp");
            transport.connect(host, userName, passWord);
            transport.sendMessage(msg, msg.getAllRecipients());
            transport.close();
            return true;
        }
        catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}

class GenerateMailTest {
    public static void main(String[] args) {
        final MailSender sender = new MailSender();
        sender.sendEmail("This is a test", "This is the content of test mail");
    }
}
```
