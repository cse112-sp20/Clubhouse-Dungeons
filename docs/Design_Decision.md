# Design Decisions

## Table of Contents

1.  Chrome Extension vs Code Extension
2.  Using a database to keep a separate copy of Clubhouse stories
3.  Login with User API Key
4.  Full Leaderboard vs Top 3 Warriors
5.  Testing Framework: Jest vs Mocha
6.  Puppeteer


## 1. Chrome Extension vs Code Extension

Thoughts that lead us to thinking about developing a Chrome extension:
    We wanted to be able to have access to the tool no matter where on the web you are. With a Chrome extension 
    you are able to access the tool from your web browser without having to go to a specific website to access it.

Argument for Chrome extension:

	Developers can’t get away from having a browser open during their work hours - they will most likely have 
    documentation and requirements open as well as any research they may be doing. A Chrome extension is easily 
    accessible regardless of the page a user is on, so our extension will allow users to view a gamified burndown 
    chart at any time without having to go directly to Clubhouse.
     

Argument against Chrome extension:

    One of the many goals of this class and this project was to reduce the number of applications that developers 
    “live in” during their work hours. By creating a Chrome extension that essentially mirrors our Clubhouse data 
    in a gamified way, we don’t reach the goal of reducing the number of apps - we could already view our Clubhouse 
    data in Chrome. 

Thoughts that lead us to thinking about developing a VS Code extensions:

    When you are working on the heart of your project you are most likely in your IDE. One of the most popular IDE’s 
    is VS Code. In order to stay focused on the task at hand, an extension for VS Code would allow the user to stay 
    within their IDE.

Argument for VS Code extension:

    Fewer apps you need to be in
    Already in the IDE while working
    Information we are giving (ie burndown chart) is NOT visible in vs code so you already have to open a browser

Argument against VS Code extension:

    Technologies required (ie webviews) seemed to be out of scope for the project
    Needed to consider time limitations
    Browsers are generally open anyways so it’s not a huge loss to have to move from ide to browser

Final decision:

    Chrome extension
    We chose a Chrome extension because...
    Time considerations (seemed like less of a learning curve)
    Didn’t see huge benefit of including data in IDE when users have to use a browser and an IDE anyways


## 2.  Using a database to keep a separate copy of Clubhouse stories

Thoughts that lead us to thinking about using a database to keep a separate copy of Clubhouse stories, etc:

    The way that clubhouse’s api is set up would allow us to grab data but we wanted it formatted in a way that 
    is most useful for our project.

Argument for:

    Keeping our own db would allow us to filter out unnecessary clubhouse data from the api calls and keep only the 
    data we need.
    Allows for quicker client-side data access.

Argument against:

    It’s redundant, we can just filter the results in code rather than complete another roundtrip to a db.


Notes: May still use a DB for could have gamification features.


Final decision:

    We opted against a database copy of Clubhouse data because the benefit of having filtered data that still required 
    a network request to retrieve didn’t outweigh the performance cost of having that additional request


## 3.  Login with User API Key
Thoughts that lead us to choose to log in with the user’s API key:

    The user’s api key is unique to them, so it will pull all of their personal clubhouse data as well as the projects 
    they are a member of 

Argument for:

    Set up data for us (developers)
    Didn’t have to deal with namespace matching if we were taking raw user input.
    Easier to implement the API calls with the users API token already saved.
    Can save the API key to chrome sync storage and never have to login again or deal with authentication.

Argument against:

    Effort on the side of the user to go and grab their API key and input it.
    Not conventional, users may be expecting to login with their normal clubhouse credentials.

Final decision: 

	We chose to use an API key login since it is easier to implement, and allows the user to stay signed in 
    indefinitely across all chrome browsers where they are logged in. It is a simple one time use login 
    until the user logs out.


## 4.  Full Leaderboard vs Top 3 Warriors

Thoughts that lead us to thinking about developing a full leaderboard:

    We wanted our users to have a sense of who on the team is doing a lot of work and who isn’t. It also adds an 
    element of multiplayer that would improve gamification. We want the extension to provide a sense of community 
    with team members and this allows for it.

Argument for full leaderboard:

    Encourages competition between team members.

Argument against full leaderboard:

    Might make people at the bottom of the leaderboard feel bad.
	Losses meaning: No one cares who is in 17th place.

Thoughts that lead us to thinking about developing a Top 3 List:

    A top 3 list praises the team's top performers without making others feel like they aren’t as good and most people
    only care about who’s on top anyways.

Argument for Top 3 List:

    Causes the feature to be more positive, singling out team members for praise, and not focusing on team members 
    with few points. 
    Better looking UI design; simpler.

Argument against Top 3 List:

    Maybe the 4th place engineer should get some recognition too.
    If a team is very large then the top 3 might be too few.

Final decision:

    Top 3 List
    We chose a Top 3 List because it encourages people to try to do their best so they can be singled out in front of 
    the team in a positive light. 
    A leaderboard system would be less encouraging and cause low ranked team members to feel bad.


## 5.  Testing Framework: Jest vs Mocha

Thoughts that lead us to thinking about developing a Jest: 

    Instructor recommendation
    Popular testing framework

Argument for Jest:

    Simple and intuitive to use
    Very versatile, simple to install

Argument against Jest:

    Not nearly as customizable or deep as Mocha
    Cannot integration test on its own - needs Puppeteer integration

Notes for Jest: I really like their company picture. Its kinda cute.

Thoughts that lead us to thinking about developing a Mocha:

    We’ve used it in a previous project and it is recognized as a well used industry standard.

Argument for Mocha:

    Very popular and well recommended across websites 
    Well documented

Argument against Mocha:

    All the customizability may be too much - analysis paralysis
    Larger and a bit more intimidating learning curve compared to Jest.

Final decision:

    Jest
    We chose Jest because of a certain mix of wanting to try new technologies (Jest, Puppeteer) and the novelty of 
    the simplicity of its tests.  While testing with both frameworks we were surprised by how certain things in Jest 
    just works. Despite needing to also use puppeteer with it, it ended up still being intuitive.

## 6. Why Puppeteer?

    Puppeteer provides a simple framework that automates end to end testing for our extension.  We were able to use 
    it to automatically install our extension into a fresh Chromium browser, log in, and interact with various 
    features throughthe same UI that the end user would be exposed to.  This is important to test so that we can be 
    sure that we can be sure that the end user experience functions properly.  Using puppeteer to do this, however,
    allows us to integrate these tests into our testing pipeline rather than just manually testing features 
    every time. 
