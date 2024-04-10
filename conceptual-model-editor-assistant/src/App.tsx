import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'
import { ReactFlowProvider } from 'reactflow';
import useLayoutSize from './hooks/useLayoutSize';
import HighlightDialog from './components/DialogDomainDescription';
import DialogEditItem from './components/DialogEditItem';
import DialogCreateEdge from './components/DialogCreateEdge';
import { Relationship } from './interfaces';
import { RecoilRoot } from 'recoil';


function App()
{
  const { nodes, edges, nodeTypes, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onSuggestItems, onSummaryButtonClick,
    onDomainDescriptionChange, onEditClose, onEditPlus, onEditSave, onEditSuggestion, onHighlightSingleItem,
    onHighlightSelectedItems, onAddItem, onClearRegeneratedItem, onItemEdit, onConfirmRegeneratedText,
    onSummaryDescriptionsClick,onEditRemove, onAddNewEntity, onDialogCreateEdgeClose,
    onAddNewRelationship, onChangeItemType
  } = useConceptualModel()

  const { sideBarWidthPercentage, onToggleSideBarCollapse } = useLayoutSize()


  return (
    <>
      <Topbar
        onIgnoreDomainDescriptionChange={onIgnoreDomainDescriptionChange}
        onImportButtonClick={onImportButtonClick}
        onSuggestItems={onSuggestItems}
        onSummaryButtonClick={onSummaryButtonClick}
        onDomainDescriptionChange={onDomainDescriptionChange}
        onHighlightSelectedItems={onHighlightSelectedItems}
        onSummaryDescriptionsClick={onSummaryDescriptionsClick}
        sidebarWidthPercentage={sideBarWidthPercentage}
        onAddNewEntity={onAddNewEntity}
      />

      <ConceptualModel
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        sidebarWidthPercentage={sideBarWidthPercentage}
      />

      <SideBar
        onAddItem={onAddItem}
        onEditSuggestion={onEditSuggestion}
        onHighlightSingleItem={onHighlightSingleItem}
        sidebarWidthPercentage={sideBarWidthPercentage}
        onToggleSideBarCollapse={onToggleSideBarCollapse}
      />

      <HighlightDialog/>

      <DialogEditItem
        onClose={onEditClose}
        onPlus={onEditPlus}
        onSave={onEditSave}
        onAddItem={onAddItem}
        onClearSuggestion={onClearRegeneratedItem}
        onItemEdit={onItemEdit}
        onConfirmRegeneratedText={onConfirmRegeneratedText}
        onRemove={onEditRemove}
        onChangeItemType={onChangeItemType}
      />

      <DialogCreateEdge
        onClose={onDialogCreateEdgeClose}
        onAddNewRelationship={onAddNewRelationship}
        onSuggestItems={onSuggestItems}
      />
      </>
  );
}

const application = () => (
  <ReactFlowProvider>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </ReactFlowProvider>
);

export default application