import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'

import { ReactFlowProvider } from 'reactflow';
import OverlayShow from './components/OverlayShow';
import OverlayEdit from './components/OverlayEdit';


declare global // TODO: Export instead of "global"
{
  interface Item extends Entity, Attribute, Relationship {    }

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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick,
    OnClickAddNode, onAddAsRelationship, onAddAsAttribute, domainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowOverlay, onOverlayClose, isShowEdit, onEditClose, onEditPlus, onEditSave,
    isLoading, suggestedItems, selectedSuggestedItem, userChoiceSuggestion, onAddEntity, onAddAttributesToNode, onAddRelationshipsToNodes, onEditSuggestion, onShowInference,
    isShowOverlayDomainDescription, onOverlayDomainDescriptionOpen, onOverlayDomainDescriptionClose
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