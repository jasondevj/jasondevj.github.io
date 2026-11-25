---
title: "Java File Handling"
description: "A small Java program that fails to delete a file on Windows, and why unclosed streams were the reason."
pubDate: 2011-10-13
tags: [java, debugging]
originalUrl: https://web.archive.org/web/20190822133243/http://blog.jasondevj.com/2011/10/java-file-handling.html
originalSource: my old blog
syndicate: false
---

Lately I been working on a Java file manipulation project and I came across an issue which I never expected.

This is a sample code.

```java
public class FileReader {

    public static void main(String[] args) throws IOException {
        new FileReader().fileDelete();
    }

    public void fileDelete() throws IOException {

        final String fileLocation = System.getProperty("user.dir") + "/test.txt";

        File fileCreate = new File(fileLocation);
        final boolean isFileCreated = fileCreate.createNewFile();

        if (isFileCreated) {
            System.out.println("File Successfully Created");
        } else {
            System.out.println("File Creation Failed");
        }

        final BufferedWriter bufferedWriter = new BufferedWriter(new FileWriter(fileLocation));
        for (int i = 1; i <= 5; i++) {
            bufferedWriter.append("Line : " + i + "\n");
        }

        final BufferedReader bufferedReader = new BufferedReader(new java.io.FileReader(fileLocation));
        String line;
        while ((line = bufferedReader.readLine()) != null) {
            System.out.println(line);
        }

        File fileDelete = new File(fileLocation);
        final boolean isDeleteSuccess = fileDelete.delete();

        if (isDeleteSuccess) {
            System.out.println("File Deleted Successfully");
        } else {
            System.out.println("File Deletion Failed");
        }
    }
}
```

Assume the file test.txt does not exists when running the programme. Can you predict the output of this programme? If you have thought it will print

File Successfully Created Line : 1 Line : 2 Line : 3 Line : 4 Line : 5 File Deleted Successfully

If you have thought a bit more you might have predicted it will print

File Successfully Created File Deleted Successfully

You’re completely wrong at least on a Windows, both the above outputs are wrong. Actual output on windows is "File Deletion Failed". It took me some time to actually realize the issue when my programme dint work as expected. As for the part of the Line 1 .. 5 not printing that’s straight forward I dint close the bufferedWriter. The problem here is that if you read or write to a file and you don’t close the stream you cannot delete the file in windows. Even when you’re actually creating a new File object it will still not let you delete the file and to make things worse it does not give you any other explanation except for Boolean false Imagine searching for this in thousands of line. So guys whenever you’re reading or writing to streams always remember to close them.
