import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'
import { ReactFlowProvider } from 'reactflow';
import useLayoutSize from './hooks/useLayoutSize';
import DialogDomainDescription from './components/DialogDomainDescription';
import DialogEditItem from './components/DialogEditItem';


export const enum UserChoice
{
  ENTITIES = "entities",
  ATTRIBUTES = "attributes",
  RELATIONSHIPS = "relationships",
  RELATIONSHIPS2 = "relationships2"
}

export const enum ItemType
{
  ENTITY = "entity",
  ATTRIBUTE = "attribute",
  RELATIONSHIP = "relationship"
}

export const enum Field
{
  ID = "ID",
  TYPE = "type",
  NAME = "name",
  DESCRIPTION = "description",
  INFERENCE = "inference",
  INFERENCE_INDEXES = "inferenceIndexes",
  DATA_TYPE = "dataType",
  CARDINALITY = "cardinality",
  SOURCE_ENTITY = "source",
  TARGET_ENTITY = "target"
}

declare global // TODO: Export instead of "global"
{
  type Item = Entity | Attribute | Relationship

  interface Entity
  {
    type : ItemType
    ID: number
    name: string
    description: string
    inference: string
    inferenceIndexes: number[]
  }

  interface Attribute
  {
    type : ItemType
    ID: number
    name: string
    description: string
    inference: string
    inferenceIndexes: number[]
    dataType?: string
    cardinality?: string
  }
  
  interface Relationship
  {
    type : ItemType
    ID: number
    name: string
    description: string
    inference: string
    inferenceIndexes: number[]
    source: string
    target: string
    cardinality?: string
  }
}


function App()
{
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick, summaryText,
    OnClickAddNode, domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowDialogEdit, onEditClose, onEditPlus, onEditSave,
    isLoading, suggestedItems, selectedSuggestedItem, userChoiceSuggestion, onEditSuggestion, onShowInference,
    isShowDialogDomainDescription, onOverlayDomainDescriptionOpen, onOverlayDomainDescriptionClose, onHighlightSelectedItems, selectedNodes, sourceEntity, tooltips, onAddItem,
    regeneratedItem, OnClearRegeneratedItem, isLoadingEdit, isLoadingSummary1, fieldToLoad
  } = useConceptualModel()

  const { isSidebarOpen, sideBarWidthPercentage, onToggleSideBarCollapse } = useLayoutSize()


  return (
    <>
      <Topbar
        onIgnoreDomainDescriptionChange={onIgnoreDomainDescriptionChange}
        isIgnoreDomainDescription={isIgnoreDomainDescription}
        onImportButtonClick={onImportButtonClick}
        onPlusButtonClick={onPlusButtonClick}
        onSummaryButtonClick={onSummaryButtonClick}
        OnClickAddNode={OnClickAddNode}
        domainDescription={domainDescription}
        onDomainDescriptionChange={onDomainDescriptionChange}
        onHighlightSelectedItems={onHighlightSelectedItems}
        summary={summaryText}
        isLoadingSummary1={isLoadingSummary1}
        selectedNodes={selectedNodes}
        sidebarWidthPercentage={sideBarWidthPercentage}
      />

      <ConceptualModel
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        sidebarWidthPercentage={sideBarWidthPercentage}
      />

      <SideBar
        isLoading={isLoading}
        items={suggestedItems}
        onAddItem={onAddItem}
        onEditSuggestion={onEditSuggestion}
        onShowInference={onShowInference}
        sidebarWidthPercentage={sideBarWidthPercentage}
        isSidebarOpen={isSidebarOpen}
        onToggleSideBarCollapse={onToggleSideBarCollapse}
      />

      <DialogDomainDescription
        domainDescription={domainDescription}
        isOpened={isShowDialogDomainDescription}
        inferenceIndexes={inferenceIndexesMockUp}
        onClose={onOverlayDomainDescriptionClose}
        itemName={selectedSuggestedItem.name}
        selectedEntityName={sourceEntity}
        userChoiceSuggestion={userChoiceSuggestion}
        tooltips={tooltips}
      />

      <DialogEditItem
        item={selectedSuggestedItem}
        regeneratedItem={regeneratedItem}
        isLoading={isLoadingEdit}
        fieldToLoad={fieldToLoad}
        isOpened={isShowDialogEdit}
        isDisableSave={false}
        onClose={onEditClose}
        onPlus={onEditPlus}
        onSave={onEditSave}
        onAddItem={onAddItem}
        OnClearSuggestion={OnClearRegeneratedItem}
      />

    </>
  );
}

const application = () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);

export default application