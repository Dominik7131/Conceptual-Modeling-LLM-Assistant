# Frontend user documentation

[Here is a tutorial on how to import and export a conceptual model into and from the Dataspecer.](frontend-import-export.md)

Our frontend is a conceptual model editor extended by features of our LLM assistant. The assistant helps a human modelling expert in creating domain models.

First, we present the main features of our LLM assistant and then we provide demo links with the demonstration of how the assistant can be used.

<br/>

## Features of our LLM assistent

### 1) suggestions of classes, attributes and associations
- if a domain description is provided then the assistant's suggestions are solely based on the given domain description
    - we support only English
- the domain description can be inserted in the text box on the topbar:

    <img src="images/frontend/insert-domain-description.png" alt="drawing" width="900"/>

<br/>

- for trying out the application, one of the following domain descriptions can be chosen:

    - [data catalog](https://github.com/dataspecer/domain-modeling-benchmark/blob/main/front-end%20evaluation%20domains/data%20catalog/domain-description-01.txt)
    - [gaming](https://github.com/dataspecer/domain-modeling-benchmark/blob/main/front-end%20evaluation%20domains/gaming/domain-description-01.txt)

<br/>

- when the domain description is not provided, the assistant suggests anything it considers reasonable
    - in this case it is better to start modelling by adding a class manually with the "Add new class" button:

        <img src="images/frontend/add-new-class-manually.png" alt="drawing" width="900"/>

<br/>

- for suggesting classes by the assistant, the "Suggest classes" button can be used:

    <img src="images/frontend/suggest-classes.png" alt="drawing" width="900"/>

<br/>

- to have attributes and associations suggested by the assistant, first create a class
- then, hover the mouse over this class, click on the three dots on the right side, and select either the "Suggest attributes" or "Suggest associations" button accordingly

    <img src="images/frontend/suggest-attributes.png" alt="drawing" width="400"/>

<br/>

- the generated suggestions are shown on the sidebar on the right side of the application
- here is an example of 5 generated suggestions by using the "Suggest classes" button without a domain description:

    <img src="images/frontend/suggested-classes.png" alt="drawing" width="300"/>

    <br/>

    - the "plus" button can be used to add the corresponding suggestion to the conceptual model
    - the "edit" button can be used to first edit the corresponding suggestion and then add it to the conceptual model
    - the "like" or "dislike" button can be used to rate the corresponding suggestion

<br/>

- when editing an attribute it can be changed into an association and vice versa:

    <img src="images/frontend/change-to-association.png" alt="drawing" width="1000"/>

<br/>

- if the domain description is provided then for each suggestion is also available "highlight" button that for attributes and associations shows in which part of the domain description the assistant found the corresponding suggestion

- for example, the highlighted original text for the attribute "homepage" of the class "catalog" looks like this:
    
    <img src="images/frontend/highlight-original-text.png" alt="drawing" width="1000"/>

<br/>

- for suggesting associations in between two classes an edge can be dragged between two nodes:

    <img src="images/frontend/edge-drag.png" alt="drawing" width="600"/>

<br/>


- and then proceed by clicking on the "Suggest associations" button

    <img src="images/frontend/suggest-associations-2.png" alt="drawing" width="600"/>

<br/>

- note that an edge can be dragged only between the handles (the "black dots") of the nodes

- when the mouse is hovered over any node, the handles display either "s" or "t":

    <img src="images/frontend/handles.png" alt="drawing" width="400"/>

    - "s" stands for the source class and "t" stands for the target class of the association
    - an edge can be dragged either from "s" to "t" or from "t" to "s"

<br/>

- when editing any element the "magic wand" button can be used on the right side to let the assistant suggest the corresponding field:

    <img src="images/frontend/suggest-single-field.png" alt="drawing" width="1000"/>

<br/>

- for example, the suggested description for the attribute "homepage" of the class "catalog" looks like this:

    <img src="images/frontend/suggested-single-field.png" alt="drawing" width="1000"/>

    - the suggestion can be accepted or rejected with the buttons on the right side

<br/>

### 2) summary of the conceptual model

- the assistant can summarize any selected part of the conceptual model
- the selected domain elements are visually represented by the blue color
- the easiest way to select some part of the conceptual model is by creating a selection area with the mouse by holding shift and left mouse button

    <img src="images/frontend/selection.png" alt="drawing" width="900"/>

<br/>

- then the assistant can summarize the selected part:
    - either in an unstructured plain text by clicking on the topbar on the button "Summary: plain text"
    - or in structured descriptions by clicking on the topbar on the button "Summary: descriptions"

    <img src="images/frontend/summary-buttons.png" alt="drawing" width="900"/>

<br/>

- for example, when this part of the conceptual model is selected (the light blue color denotes the selected classes, attributes and associations):

    <img src="images/frontend/selection-aircraft.png" alt="drawing" width="1000"/>

<br/>

- this is what the button "Summary: plain text" generates:

    <img src="images/frontend/summary-plain-text.png" alt="drawing" width="1100"/>

<br/>

- and this is what the button "Summary: descriptions" generates:

    <img src="images/frontend/summary-descriptions.png" alt="drawing" width="900"/>

<br/>

- note: the assistant ignores the domain description when generating the summary

<br/>


### 3) highlighting in the domain description which parts are represented by the conceptual model

- when creating conceptual model with the help of the assistant each suggested element contains also the already mentioned original text
- when some part of the conceptual model is selected all these original texts can be highlighted in the domain description using the "Highlight original text" button on the topbar:

    <img src="images/frontend/highlight-original-text-button.png" alt="drawing" width="900"/>

<br/>

- for example, for a domain description about conference papers and this class:

    <img src="images/frontend/class-example.png" alt="drawing" width="280"/>

<br/>

- this is what the button "Highlight original text" shows:

    <img src="images/frontend/highlight-all-example.png" alt="drawing" width="800"/>

<br/>

- for example, this feature can be used to check whether the conceptual model is completely representing the given domain description
- however, note that the assistant can make mistakes and that some part of the domain description is highlighted does not necessarily mean that it is represented by the conceptual model
    - also the opposite thing applies: some non-highlighted parts of the domain description can already be represented by the conceptual model

- for simplicity, whenever the domain description changes the computed original text indexes are discarded so nothing will be highlighted
    - this means that for using this feature it is necessary to work with only one domain description without editing it in the process


### Settings

This is how the settings tab looks like:

<img src="images/frontend/settings.png" alt="drawing" width="800"/>

<br/>

As shown by the picture it is possible to:
1) ignore domain description to temporarily work without the domain description
2) change the strategy of how the domain description is filtered:
    - according to our experiments, the syntactic variation works the best however, it can be changed to force the assistant to generate different suggestions for attributes and associations



### Demos

- [video demonstrating the work with the domain description](https://youtu.be/1GPYFALsyrw)

- [video demonstrating the work without the domain description](https://youtu.be/wy60G8cuN-M)

- [video demonstrating combination of working with and without the domain description](https://youtu.be/Lw8fMqqCwPY)