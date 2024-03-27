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

export const enum ItemFieldUIName
{
  ID = "ID",
  TYPE = "Ttype",
  NAME = "Name",
  DESCRIPTION = "Description",
  ORIGINAL_TEXT = "Original text",
  ORIGINAL_TEXT_INDEXES = "Original text indexes",
  DATA_TYPE = "Data type",
  CARDINALITY = "Cardinality",
  SOURCE_ENTITY = "Source entity",
  TARGET_ENTITY = "Target entity"
}

export type Item = Entity | Attribute | Relationship

export type ItemFieldsUnification = keyof Entity | keyof Attribute | keyof Relationship

interface BaseItem
{
  type : ItemType
  ID: number
  name: string
  description: string
  inference: string
  inferenceIndexes: number[]
}

export interface Entity extends BaseItem { }

export interface Attribute extends BaseItem
{
  dataType: string
  cardinality: string
}

export interface Relationship extends BaseItem
{
  source: string
  target: string
  cardinality: string
}


function App()
{
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick, summaryText,
    OnClickAddNode, domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowDialogEdit, onEditClose, onEditPlus, onEditSave,
    isLoading, suggestedItems, selectedSuggestedItem, editedSuggestedItem, userChoiceSuggestion, onEditSuggestion, onShowInference,
    isShowDialogDomainDescription, onDialogDomainDescriptionClose, onHighlightSelectedItems, selectedNodes, sourceEntity, tooltips, onAddItem,
    regeneratedItem, onClearRegeneratedItem, isLoadingEdit, isLoadingSummary1, fieldToLoad, onItemEdit, onConfirmRegeneratedText
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
        onClose={onDialogDomainDescriptionClose}
        itemName={selectedSuggestedItem.name}
        selectedEntityName={sourceEntity}
        userChoiceSuggestion={userChoiceSuggestion}
        tooltips={tooltips}
      />

      <DialogEditItem
        item={selectedSuggestedItem}
        editedItem={editedSuggestedItem}
        regeneratedItem={regeneratedItem}
        isLoading={isLoadingEdit}
        fieldToLoad={fieldToLoad}
        isOpened={isShowDialogEdit}
        isDisableSave={false}
        onClose={onEditClose}
        onPlus={onEditPlus}
        onSave={onEditSave}
        onAddItem={onAddItem}
        onClearSuggestion={onClearRegeneratedItem}
        onItemEdit={onItemEdit}
        onConfirmRegeneratedText={onConfirmRegeneratedText}
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