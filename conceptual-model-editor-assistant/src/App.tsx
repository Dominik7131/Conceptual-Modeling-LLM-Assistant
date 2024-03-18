import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'
import Overlay from './components/Overlay';

import { ReactFlowProvider } from 'reactflow';


declare global // TODO: Export instead of "global"
{
  interface Entity
  {
    name: string
    description?: string
    inference: string
    inference_indexes: number[]
  }

  interface Attribute
  {
    name: string
    description?: string
    inference: string
    inference_indexes: number[]
    dataType?: string
    cardinality?: string
  }
  
  interface Relationship
  {
    name: string
    description?: string
    inference: string
    inference_indexes: number[]
    source: string
    target: string
    cardinality: string
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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick,
    OnClickAddNode, onAddAsAssociation, onAddAsAttribute, domainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowOverlay, onOverlayClose, isShowEdit, onEditClose, onEditPlus,
    isLoading, suggestedEntities, suggestedAttributes, suggestedRelationships, suggestedItem, onAddEntity, onAddAttributesToNode, onAddRelationshipsToNodes, onEditSuggestion, onShowInference
  } = useConceptualModel()

  return (
    <div className="appDiv">
      <Topbar
        onIgnoreDomainDescriptionChange={onIgnoreDomainDescriptionChange}
        onImportButtonClick={onImportButtonClick}
        onPlusButtonClick={onPlusButtonClick}
        onSummaryButtonClick={onSummaryButtonClick}
        OnClickAddNode={OnClickAddNode}
        domainDescription={domainDescription}
        onDomainDescriptionChange={onDomainDescriptionChange}
      />

      <SideBar
        isLoading={isLoading}
        entities={suggestedEntities}
        attributes={suggestedAttributes}
        relationships={suggestedRelationships}
        onAddEntity={onAddEntity}
        onAddAttributesToNode={onAddAttributesToNode}
        onAddRelationshipsToNodes={onAddRelationshipsToNodes}
        onAddAsAssociation={onAddAsAssociation}
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

      <Overlay
      domainDescription={domainDescription}
      isShowOverlay={isShowOverlay}
      onOverlayClose={onOverlayClose}
      isShowEdit={isShowEdit}
      onEditClose={onEditClose}
      onEditPlus={onEditPlus}
      suggestedItem={suggestedItem}
      inferenceIndexes={inferenceIndexesMockUp}
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