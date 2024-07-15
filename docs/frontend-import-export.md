# Frontend import and export tutorial

- the conceptual model can be imported or exported in [this JSON format](https://schemas.dataspecer.com/adapters/simplified-semantic-model.v1.0.schema.json)

- on the topbar click on the "Import & Export" tab:

    <img src="images/frontend/import-export.png" alt="drawing" width="800"/>

- "Import from JSON" button lets you load a conceptual model from file in the mentioned JSON format from your device

- "Export from JSON" button saves the conceptual model in the mentioned JSON format in your device


<br/>

## Import conceptual model from Dataspecer
- open [Dataspecer package manager](https://tool.dataspecer.com/manager/)
- find the conceptual model you want to import
- copy the model ID as shown in the picture:

    <img src="images/frontend/import-from-dataspecer.png" alt="drawing" width="700"/>

<br/>

- in our frontend click on the "Import from Dataspecer" button:

    <img src="images/frontend/import-from-dataspecer-button.png" alt="drawing" width="800"/>

<br/>

- paste the corresponding model ID and click on the green "Import" button:

    <img src="images/frontend/import-dialog.png" alt="drawing" width="1000"/>

<br/>

- now the corresponding conceptual model is successfully loaded into our frontend:

    <img src="images/frontend/imported-model.png" alt="drawing" width="1000"/>

<br/>

## Export conceptual model into Dataspecer

- to export your conceptual model into Dataspecer click on the "Export into Dataspecer" button:

    <img src="images/frontend/export-into-dataspecer-button.png" alt="drawing" width="800"/>

<br/>

- in the dialog paste the ID of the model you want to rewrite and click on the green "Export" button

    <img src="images/frontend/paste-new-model-ID.png" alt="drawing" width="800"/>

<br/>

#### Get a new model ID

- to get a new model ID from the Dataspecer click on the "New package" button in the [package manager](https://tool.dataspecer.com/manager/):

    <img src="images/frontend/new-package-button.png" alt="drawing" width="800"/>

<br/>

- create a new directory and click on the "Save changes" button:

    <img src="images/frontend/create-new-directory-2.png" alt="drawing" width="500"/>

<br/>

- find your directory in the manager and click on the "plus" button:

    <img src="images/frontend/add-semantic-model.png" alt="drawing" width="800"/>

<br/>

- click on the "Semantic model" buton

    <img src="images/frontend/add-semantic-model-2.png" alt="drawing" width="300"/>

<br/>

- the new model ID was created so copy this new model ID

    <img src="images/frontend/get-new-model-ID.png" alt="drawing" width="800"/>

<br/>

- now in our frontend click on the "Export into Dataspecer" button

    <img src="images/frontend/export-into-dataspecer-button.png" alt="drawing" width="800"/>

<br/>

- paste the new model ID and click on the green "Export" button and we are done

    <img src="images/frontend/paste-new-model-ID.png" alt="drawing" width="800"/>


<br/>


## Open the same conceptual model but in a different Dataspecer tool

- our conceptual model with `ID=0151407c-6c28-440e-b056-19e4eff56e98` looks like this:

    <img src="images/frontend/imported-model.png" alt="drawing" width="1000"/>

<br/>

- now our goal is to open the same conceptual model but in a different Dataspecer tool

- for example in our directory in the [Dataspecer package manager](https://tool.dataspecer.com/manager/) we can add "visual model" like this:

    <img src="images/frontend/add-visual-model.png" alt="drawing" width="800"/>

    <img src="images/frontend/add-visual-model-2.png" alt="drawing" width="300"/>

<br/>

- click on the "Open" button:

    <img src="images/frontend/open-in-cme.png" alt="drawing" width="800"/>

<br/>

- this opens the conceptual model in the Dataspecer Conceptual Model Editor (CME) tool

- make the classes of the conceptual model visible by clicking on the "sunglasses" buttons

    <img src="images/frontend/cme.png" alt="drawing" width="400"/>

<br/>

- now we successfully opened the same conceptual model as in our frontend but in a different Dataspecer tool

    <img src="images/frontend/cme-2.png" alt="drawing" width="1000"/>