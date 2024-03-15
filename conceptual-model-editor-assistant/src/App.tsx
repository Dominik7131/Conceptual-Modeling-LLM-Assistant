import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'
import Overlay from './components/Overlay';

import { ReactFlowProvider } from 'reactflow';


declare global
{
  type Entity =
  {
    name: string
    inference: string
    inference_indexes: number[]
  }

  type Attribute =
  {
    name: string
    description: string
    inference: string
    inference_indexes: number[]
    dataType: string
  }
  
  type Relationship =
  {
    name: string
    description: string
    inference: string
    inference_indexes: number[]
    source: string
    target: string
    cardinality: string
  }

  type SummaryObject =
  {
    entity: string
    attributes: Attribute[]
    relationships: Relationship[]
  }
}


function App()
{
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick,
    OnClickAddNode, domainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowOverlay, onOverlayClose, isShowEdit, onEditClose,
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