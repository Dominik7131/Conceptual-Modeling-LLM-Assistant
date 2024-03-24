import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'
import { ReactFlowProvider } from 'reactflow';
import OverlayShow from './components/OverlayShow';
import OverlayEdit from './components/DialogEditItem';
import useLayoutSize from './hooks/useLayoutSize';


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
  INFERENCE_INDEXES = "inference indexes",
  DATA_TYPE = "data type",
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
    description?: string
    inference: string
    inference_indexes: number[]
  }

  interface Attribute
  {
    type : ItemType
    ID: number
    name: string
    description?: string
    inference: string
    inference_indexes: number[]
    dataType?: string
    cardinality?: string
  }
  
  interface Relationship
  {
    type : ItemType
    ID: number
    name: string
    description?: string
    inference: string
    inference_indexes: number[]
    source: string
    target: string
    cardinality?: string
  }
}


function App()
{
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick, summaryText,
    OnClickAddNode, onAddAsRelationship, onAddAsAttribute, domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowEdit, onEditClose, onEditPlus, onEditSave,
    isLoading, suggestedItems, selectedSuggestedItem, userChoiceSuggestion, onAddEntity, onAddAttributesToNode, onAddRelationshipsToNodes, onEditSuggestion, onShowInference,
    isShowOverlayDomainDescription, onOverlayDomainDescriptionOpen, onOverlayDomainDescriptionClose, onHighlightSelectedItems, selectedNodes, sourceEntity, tooltips, onAddItem
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
        isShowSummary1={true}
        isShowSummary2={true}
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

      <OverlayShow
        domainDescription={domainDescription}
        isOpened={isShowOverlayDomainDescription}
        inferenceIndexes={inferenceIndexesMockUp}
        onClose={onOverlayDomainDescriptionClose}
        itemName={selectedSuggestedItem.name}
        selectedEntityName={sourceEntity}
        userChoiceSuggestion={userChoiceSuggestion}
        tooltips={tooltips}
      />

      <OverlayEdit
        isOpened={isShowEdit}
        item={selectedSuggestedItem}
        isDisableSave={false}
        onClose={onEditClose}
        onPlus={onEditPlus}
        onSave={onEditSave}
        onAddItem={onAddItem}
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