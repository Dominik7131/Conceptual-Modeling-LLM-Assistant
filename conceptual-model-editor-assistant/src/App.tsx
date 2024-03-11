import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'
import Overlay from './components/Overlay';

import { ReactFlowProvider } from 'reactflow';


declare global
{
  type Entity = {
    name: string
    inference: string
    inference_indexes: number[]
  }

  type Attribute = {
    name: string
    description: string
    inference: string
    inference_indexes: number[]
    dataType: string
  }
  
  type Relationship = {
    name: string
    description: string
    inference: string
    inference_indexes: number[]
    source: string
    target: string
    cardinality: string
  }

  type SummaryObject = {
    entity: string
    attributes: Attribute[]
    relationships: Relationship[]
  }
}


function App()
{
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, handleIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick,
    summaryData, capitalizeString, nodeToAddName, setNodeToAddName, OnClickAddNode, domainDescription, setDomainDescription, inferenceIndexes, inferenceIndexesMockUp, isShowOverlay, setIsShowOverlay, isShowEdit, setIsShowEdit,
    isLoading, suggestedEntities, suggestedAttributes, suggestedRelationships, suggestedItem, addEntity, addAttributesToNode, addRelationshipsToNodes, editSuggestion, showInference
  } = useConceptualModel()

  return (
    <div className="appDiv">
      <Topbar
        handleIgnoreDomainDescriptionChange={handleIgnoreDomainDescriptionChange}
        onImportButtonClick={onImportButtonClick}
        onPlusButtonClick={onPlusButtonClick}
        onSummaryButtonClick={onSummaryButtonClick}
        summaryData={summaryData}
        capitalizeString={capitalizeString}
        nodeToAddName={nodeToAddName}
        setNodeToAddName={setNodeToAddName}
        OnClickAddNode={OnClickAddNode}
        domainDescription={domainDescription}
        setDomainDescription={setDomainDescription}
        inferenceIndexes={inferenceIndexes}
      />

      <SideBar
        isLoading={isLoading}
        entities={suggestedEntities}
        attributes={suggestedAttributes}
        relationships={suggestedRelationships}
        addEntity={addEntity}
        addAttributesToNode={addAttributesToNode}
        addRelationshipsToNodes={addRelationshipsToNodes}
        editSuggestion={editSuggestion}
        showInference={showInference}
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
      setIsShowOverlay={setIsShowOverlay}
      isShowEdit={isShowEdit}
      setIsShowEdit={setIsShowEdit}
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