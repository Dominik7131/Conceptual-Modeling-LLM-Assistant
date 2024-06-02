# Frontend development documentation

The frontend is developed with:
- [Node.js](https://nodejs.org/en) version 21.5.0
- [React](https://react.dev/) version 18.2.0
- [Typescript](https://www.typescriptlang.org/) version 4.9.5

<br/>


## Main used libraries
- [React Flow](https://reactflow.dev/) for displaying conceptual model
- [Recoil](https://recoiljs.org/) for state management
- [Material UI](https://mui.com/) for UI design

<br/>

## Dependencies
[Here is a complete list of our dependecies and their versions](../frontend/conceptual-model-editor-assistant/package.json).

<br/>


## Code structure

- [atoms](../frontend/conceptual-model-editor-assistant/src/atoms/): contains [Recoil states](https://recoiljs.org/docs/basic-tutorial/atoms/)
- [components](../frontend/conceptual-model-editor-assistant/src/components/): contains all the building blocks of the application, the main components are:
    - [ConceptualModel](../frontend/conceptual-model-editor-assistant/src/components/ConceptualModel/) for working with the conceptual model
    - [Topbar](../frontend/conceptual-model-editor-assistant/src/components/Topbar/) and [Sidebar](../frontend/conceptual-model-editor-assistant/src/components/Sidebar/) mainly for showing to the user the suggestions from the LLM assistant
- [definitions](../frontend/conceptual-model-editor-assistant/src/definitions/): contains definitions of the constant variables, interfaces, enums and custom types, the most important scripts are:
    - [fetch.ts](../frontend/conceptual-model-editor-assistant/src/definitions/fetch.ts): defines the interfaces for communicating with the LLM assistant server based on the [API endpoints documentation](api-endpoints.md)
    - [urls.ts](../frontend/conceptual-model-editor-assistant/src/definitions/urls.ts): defines the URLs used for communicating with the LLM assistant server
- [hooks](../frontend/conceptual-model-editor-assistant/src/hooks/): contains custom hooks mainly for fetching the data from the LLM assistant server
- [utils](../frontend/conceptual-model-editor-assistant/src/utils/): contains functions usually used by more than one component


<br/>

## Import and export format
We are importing and exporting the conceptual model in [this JSON format](https://schemas.dataspecer.com/adapters/simplified-semantic-model.v1.0.schema.json).


<br/>

## Saving rated assistant suggestions
- when user wants to generate some suggestion, first all parameters set on the frontend are saved to remember based on which configuration each suggestion was generated
- the user can rate with "like" or "dislike" any generated class, attribute, association and any generated summary
- if the user accepts any generated field we interpret it as rating the suggestion with a "like"
- when any element is rated, it is sent to the LLM assistant server and saved in the persistent storage on the backend with the necessary parameters needed to know how the corresponding suggestion was generated
