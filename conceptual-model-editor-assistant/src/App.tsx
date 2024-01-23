import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'

import { ReactFlowProvider } from 'reactflow';


declare global
{
  type Attribute = {
    name: string
    description: string
    inference: string
    data_type: string
  }
  
  type Relationship = {
    name: string
    description: string
    inference: string
    source_entity: string
    target_entity: string
  }

  type SummaryObject = {
    entity: string
    attributes: Attribute[]
    relationships: Relationship[]
  }
}


function App()
{
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, handleIgnoreDomainDescriptionChange, onPlusButtonClick, onSummaryButtonClick,
    summaryData, capitalizeString, domainDescription, setDomainDescription, inferenceIndexes,
    suggestedAttributes, suggestedRelationships, addAttributesToNode, addRelationshipsToNodes
  } = useConceptualModel()

  return (
    <div className="appDiv">
      <Topbar
        handleIgnoreDomainDescriptionChange={handleIgnoreDomainDescriptionChange}
        onPlusButtonClick={onPlusButtonClick}
        onSummaryButtonClick={onSummaryButtonClick}
        summaryData={summaryData}
        capitalizeString={capitalizeString}
        domainDescription={domainDescription}
        setDomainDescription={setDomainDescription}
        inferenceIndexes={inferenceIndexes}
      />

      <SideBar
        attributes={suggestedAttributes}
        relationships={suggestedRelationships}
        addAttributesToNode={addAttributesToNode}
        addRelationshipsToNodes={addRelationshipsToNodes}
      />

      <ConceptualModel
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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