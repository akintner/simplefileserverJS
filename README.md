Imagine a small, local organization that wants to host its own version of TedTalks. A great way to fellow citizens to broaden their horizons and get the community to interact. Meetings would be free to attend, friendly, and low-key. 

This is a small code package that would allow anyone to propose a talk, add commentary to a talk, and generally discuss amongst themselves without a central organizer. There is a server, written for Node.js, as well as a client, written for the browser. The server will store system data and provide it up to the client; it will also provide the HTML and javascript files that implement the client-side system. 

The server keeps a list of talks proposed for the next meeting, where each talk has a presenter name, a title, brief summary, and a list of commentary associated with it. Any user may propose a new talk, delete a talk (I realize this is non-optimal longer term), or comment on an existing talk. Each time a change is made, the server tells the client about it in order to show a truly live version of the current talks on the docket. Whenever a talk is proposed or changed, anyone accessing the page will immediately see it reflected. This latter bit is the challenge and implements long-polling. 
