---
title: "Testing SimpleFormController with Spring MVC"
description: "Building a Spring MVC SimpleFormController test-first with spring-test, mocked HTTP requests and EasyMock, one red bar at a time."
pubDate: 2009-09-07
tags: [java, spring, testing]
originalUrl: https://web.archive.org/web/20190722183141/http://blog.jasondevj.com/2009/09/testing-simpleformcontroller-with_07.html
originalSource: my old blog
syndicate: false
---

In this article, I will show how one can develop “test-first” using Spring-webMVC and spring-test. I therefore assume you know the basics of [spring-mvc](http://static.springframework.org/spring/docs/2.5.x/reference/mvc.html). My example will be around some Person management system. First, assume we have a Person object :

```java
public class Person {
   private Long id;
   private String firstName;
   private String lastName;

   public Person(String firstName, String lastName) {
       this.firstName = firstName;
       this.lastName = lastName;
   }

   public Long getId() {
       return id;
   }

   private void setId(Long id) {
       this.id = id;
   }

   public String getFirstName() {
       return firstName;
   }

   public void setFirstName(String firstName) {
       this.firstName = firstName;
   }

   public String getLastName() {
       return lastName;
   }

   public void setLastName(String lastName) {
       this.lastName = lastName;
   }
}
```

And a service interface allowing basic [CRUD](http://en.wikipedia.org/wiki/Create%2C_read%2C_update_and_delete) operations for a person :

```java
public interface PersonService {
   public List read(Person p);
   public void save(Person p);
   public void delete(Person p);
}
```

We want a web interface that allow the user to save a new Person or to modify an existing person. For this I’ll use a [SimpleFormController](http://static.springframework.org/spring/docs/2.5.x/api/index.html?org/springframework/web/portlet/mvc/SimpleFormController.html). It will be responsible for presenting the form, calling the person’s service `save(Person),` and forwarding the user to a success page (when the person has correctly been saved).

This controller will be configured in a context file like this :

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans-2.5.xsd">

   <bean name="/editPerson" class="myProject.web.EditPersonController">
       <property name="commandClass" value="myProject.Person"/>
       <property name="formView" value="personForm"/>
       <property name="successView" value="personSaved"/>
   </bean>

</beans>
```

To have our test being able to load a context, we’ll use the jUnit’s [@RunWith](http://junit.sourceforge.net/javadoc/org/junit/runner/RunWith.html) annotation, and to make our test load our specific context we’ll use the Spring’s [@ContextConfiguration](http://static.springframework.org/spring/docs/2.5.x/api/org/springframework/test/context/ContextConfiguration.html) annotation. For more details on Spring’s test API, see the [chapter 13](http://static.springframework.org/spring/docs/2.5.x/reference/testing.html#testcontext-framework) of the Spring framework documentation.

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations={"/myProject/EditPersonControllerTest-context.xml"})
public class EditPersonControllerTest {
   <strong>@Autowired</strong>
   <strong>EditPersonController controller;</strong>

   /**
    * Tests the creation of a new Person.
    **/
   @Test
   public void testCreate() {

   }
}
```

The @Autowired annotation will do “by-type” bean injection. This means that since our context contains a single bean of type myProject.web.EditPersonController, that bean (the one we named “/editPerson”) will be injected in field “controller” at runtime, before the test methods are called. But for now, the test just doesn’t compile because we haven’t created the EditPersonController class. Let’s create this controller :

```java
import org.springframework.web.servlet.mvc.SimpleFormController;

public class EditPersonController extends SimpleFormController {
}
```

It does nothing for the moment, except allowing the test to compile.

To test this newly created controller, we need a HttpServletRequest and a HttpServletResponse object. These objects will be passed to the controller’s handleRequest method. Our test is, of course, not using a servlet engine that is able to create these objects for us, so we have to mock them. Here comes the use of the Spring’s [MockHttpServletRequest](http://static.springframework.org/spring/docs/2.5.x/api/org/springframework/mock/web/MockHttpServletRequest.html) and [MockHttpServletResponse](http://static.springframework.org/spring/docs/2.5.x/api/org/springframework/mock/web/MockHttpServletResponse.html) classes. With these objects, we can easily simulate a HTTP request that will be forwarded to our controller. We can then verify if a “GET” HTTP call will make our controller send the person form :

```java
/**
* Tests the creation of a new Person.
**/
@Test
public void testCreate() {
   MockHttpServletRequest request = new MockHttpServletRequest();
   request.setMethod("GET");
   ModelAndView mv = controller.handleRequest(request, new MockHttpServletResponse());
   assertEquals(controller.getFormView(), mv.getViewName());
}
```

The [ModelAndView](http://static.springframework.org/spring/docs/2.5.x/api/org/springframework/web/portlet/ModelAndView.html) object is used to determine which view the controller chose to send to the user.

Instead of doing :

*`assertEquals(controller.getFormView(), mv.getViewName());`*

We could have done :

*`import static org.springframework.test.web.ModelAndViewAssert.*;[...]assertViewName(mv, controller.getFormView());``[...]`*

Now the user is provided a form with two input fields. One for the “firstname” and one for the “lastname”. He fills those fields and submit the form. The controller is then called with the “fistname” and “lastname” posted by the user. It must normally save the person and return the “successView” which we named “personSaved” (see the XML context defined previously). Let’s now add this behavior to our test :

```java
import static org.springframework.test.web.ModelAndViewAssert.*;

...

/**
* Tests the creation of a new Person.
**/
@Test
public void testCreate() {
   MockHttpServletRequest request = new MockHttpServletRequest();
   request.setMethod("GET");
   ModelAndView mv = controller.handleRequest(request, new MockHttpServletResponse());
   assertEquals(controller.getFormView(), mv.getViewName());

   request = new MockHttpServletRequest();
   request.setMethod("POST");
   request.setParameter("firstName", "Richard");
   request.setParameter("lastname", "Barabé");
   mv = controller.handleRequest(request, new MockHttpServletResponse());
   assertViewName(mv, controller.getSuccessView());
}
```

So far we’ve tested that while creating a new Person, the user first asks the Person form (with an HTTP GET call), then submits that form (with an HTTP POST call that details person’s information) and is redirected to a success page when finished. We can say we tested the navigation part of the “create new Person” use case.

But, did the controller really saved the Person ? In other words : Did the controller called the PersonService’s `save(Person p)` method ? To test this, I will use [EasyMock](http://www.easymock.org/) to mock a PersonService, tell EasyMock I want this PersonService’s `save(Person p)` method to be called once with the correct person, and then I will pass that PersonService mock to the controller. Once done, my test will know if the controller really called the PersonService adequately. Here is the code of the test :

```java
import static org.easymock.EasyMock.*;

...

/**
* Tests the creation of a new Person.
**/
@Test
public void testCreate() {
   MockHttpServletRequest request = new MockHttpServletRequest();
   request.setMethod("GET");
   ModelAndView mv = controller.handleRequest(request, new MockHttpServletResponse());
   assertEquals("personForm", mv.getViewName());

   request = new MockHttpServletRequest();
   request.setMethod("POST");
   request.setParameter("firstName", "Richard");
   request.setParameter("lastname", "Barabé");
   // Create the service's imitation
   PersonService serviceMock = createMock(PersonService.class);
   controller.setPersonService(serviceMock);
   // The save method should be called with "Richard Barabé"
   serviceMock.save(new Person("Richard", "Barabé"));
   // The save method should be called only once
   expectLastCall().once();
   // Finished telling easymock how my service should be used.
   replay(serviceMock);

   mv = controller.handleRequest(request, new MockHttpServletResponse());
   assertViewName(mv, "personSaved");

   // Verify that the service have been used as we expect
   // (method save called once with "Richard Barabé")
   verify(serviceMock);
}
```

For this to compile, I need to add a PersonService field and its getter/setter in the controller :

```java
import org.springframework.web.servlet.mvc.SimpleFormController;
import myProject.PersonService;
public class EditPersonController extends SimpleFormController {
   private PersonService service;

   public void setPersonService(PersonService service) {
       this.service = service
   }

   public PersonService getPersonService() {
       return this.service;
   }
}
```

Now the test asserts the service has been called correctly. As we run it, we can see it fails with the following message :

```
java.lang.AssertionError:
 Expectation failure on verify:
   save(myProject.Person@1f2cea2): expected: 1, actual: 0
 at org.easymock.internal.MocksControl.verify(MocksControl.java:82)
 at org.easymock.EasyMock.verify(EasyMock.java:1410)
       ...
```

This just means our controller didn’t call the service’s save method as expected. Let’s make our controller do it’s job by adding the expected call :

```java
import org.springframework.web.servlet.mvc.SimpleFormController;
import myProject.PersonService;
public class EditPersonController extends SimpleFormController {
   private PersonService service;

   protected doSubmitAction(Object o) {
       this.service.save((Person) o)
   }

   public void setPersonService(PersonService service) {
       this.service = service
   }

   public PersonService getPersonService() {
       return this.service;
   }
}
```

Running the test now should succeed. But, unfortunately, the bar is red again. For time consideration, I’ll leave aside the investigation and go right to the solution : we did not override the equals and hashcode methods of the Person class. Our controller that received the form submission did create a new Person, setting its first and last name. It then passed this new object to the doFormSubmitAction(Object) that called our mock passing the new person. But we told EasyMock we expected our service to be called with another Person object. Default implementation of the equals method in object makes the following statement **false** :

*(new Person(”Richard”,”Barabé”)).equals(new Person(”Richard”,”Barabé”))*

So let’s implement those hashCode and equals methods (I use Eclipse to generate this “boiler plate” code) :

```java
public class Person {
   private Long id;
   private String firstName;
   private String lastName;

   public Person(String firstName, String lastName) {
       this.firstName = firstName;
       this.lastName = lastName;
   }

   public Long getId() {
       return id;
   }

   private void setId(Long id) {
       this.id = id;
   }

   public String getFirstName() {
       return firstName;
   }

   public void setFirstName(String firstName) {
       this.firstName = firstName;
   }

   public String getLastName() {
       return lastName;
   }

   public void setLastName(String lastName) {
       this.lastName = lastName;
   }

   @Override
   public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result
            + ((firstName == null) ? 0 : firstName.hashCode());
    result = prime * result
            + ((lastName == null) ? 0 : lastName.hashCode());
    return result;
   }

   @Override
   public boolean equals(Object obj) {
    if (this == obj)
        return true;
    if (obj == null)
        return false;
    if (getClass() != obj.getClass())
        return false;
    final Person other = (Person) obj;
    if (firstName == null) {
        if (other.firstName != null)
            return false;
    } else if (!firstName.equals(other.firstName))
        return false;
    if (lastName == null) {
        if (other.lastName != null)
            return false;
    } else if (!lastName.equals(other.lastName))
        return false;
       return true;
   }
}
```

Now the code behaves correctly when we have two persons with the same fistName and lastName. And that green bar is back again.

There we are, we have successfully developped and tested our controller. This article is to be continued, and next time we’ll go over the Validator and View implementation.
