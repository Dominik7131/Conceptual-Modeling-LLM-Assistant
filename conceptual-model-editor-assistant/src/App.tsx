import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'
import { ReactFlowProvider } from 'reactflow';
import OverlayShow from './components/OverlayShow';
import OverlayEdit from './components/OverlayEdit';

export const enum UserChoice
{
  ENTITIES = "entities",
  ATTRIBUTES = "attributes",
  RELATIONSHIPS = "relationships",
  RELATIONSHIPS2 = "relationships2"
}

export const enum Field
{
  ID = "id",
  NAME = "name",
  DESCRIPTION = "description",
  INFERENCE = "inference",
  INFERENCE_INDEXES = "inference_indexes",
  DATA_TYPE = "dataType",
  CARDINALITY = "cardinality",
  SOURCE_ENTITY = "source",
  TARGET_ENTITY = "target"
}


declare global // TODO: Export instead of "global"
{
  // TODO: Item should be either:
  // - type Item = Entity | Attribute | Relationship
  //    - then we need to add field "type" to each object to determine the type 
  // - or abstract class with childs: Entity, Attribute, Relationship
  interface Item extends Entity, Attribute, Relationship {    }

  // type Item = Entity | Attribute | Relationship

  interface Entity
  {
    ID: number
    name: string
    description?: string
    inference: string
    inference_indexes: number[]
  }

  interface Attribute
  {
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
    ID: number
    name: string
    description?: string
    inference: string
    inference_indexes: number[]
    source?: string
    target?: string
    cardinality?: string
  }

  interface SummaryObject
  {
    entity: string
    attributes: Attribute[]
    relationships: Relationship[]
  }
}


function App()
{
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick, summaryText,
    OnClickAddNode, onAddAsRelationship, onAddAsAttribute, domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowEdit, onEditClose, onEditPlus, onEditSave,
    isLoading, suggestedItems, selectedSuggestedItem, userChoiceSuggestion, onAddEntity, onAddAttributesToNode, onAddRelationshipsToNodes, onEditSuggestion, onShowInference,
    isShowOverlayDomainDescription, onOverlayDomainDescriptionOpen, onOverlayDomainDescriptionClose, onHighlightSelectedItems, selectedNodes
  } = useConceptualModel()

  const summary = "The conceptual model includes four main entities: Student, Course, Dormitory, and Professor. The Student entity has a name attribute and can be enrolled in any number of Courses. The Course entity has a name and a number of credits attribute, and can have one or more Professors. The Dormitory entity has a price attribute, and students can be accommodated in it. The Professor entity has a name attribute. Additionally, there is a relationship between Student and Person through an 'is-a' relationship."


  return (
    <div className="appDiv">
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
      />

      <SideBar
        isLoading={isLoading}
        items={suggestedItems}
        userChoice={userChoiceSuggestion}
        onAddEntity={onAddEntity}
        onAddAttributesToNode={onAddAttributesToNode}
        onAddRelationshipsToNodes={onAddRelationshipsToNodes}
        onAddAsRelationship={onAddAsRelationship}
        onAddAsAttribute={onAddAsAttribute}
        onEditSuggestion={onEditSuggestion}
        onShowInference={onShowInference}
      />

      <ConceptualModel
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />

      <OverlayShow
        domainDescription={domainDescription}
        isShow={isShowOverlayDomainDescription}
        inferenceIndexes={inferenceIndexesMockUp}
        onClose={onOverlayDomainDescriptionClose}
      />

      <OverlayEdit
        isShow={isShowEdit}
        item={selectedSuggestedItem}
        userChoice={userChoiceSuggestion}
        isDisableSave={false}
        onClose={onEditClose}
        onPlus={onEditPlus}
        onSave={onEditSave}
      />

    </div>
  );
}

const application = () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);

export default application