import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'
import { ReactFlowProvider } from 'reactflow';
import useLayoutSize from './hooks/useLayoutSize';
import DialogDomainDescription from './components/DialogDomainDescription';
import DialogEditItem from './components/DialogEditItem';


function App()
{
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onPlusButtonClick, onSummaryButtonClick, summaryText,
    OnClickAddNode, domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowDialogEdit, onEditClose, onEditPlus, onEditSave,
    isLoadingSuggestedItems, suggestedItems, selectedSuggestedItem, editedSuggestedItem, userChoiceSuggestion, onEditSuggestion, onShowInference,
    isShowDialogDomainDescription, onDialogDomainDescriptionClose, onHighlightSelectedItems, selectedNodes, sourceEntity, tooltips, onAddItem,
    regeneratedItem, onClearRegeneratedItem, isLoadingEdit, isLoadingSummary1, isLoadingSummaryDescriptions, fieldToLoad, onItemEdit, onConfirmRegeneratedText, onSummaryDescriptionsClick,
    summaryDescriptions, isSuggestedItem, onEditRemove, nodeTypes
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
        isLoadingSummaryDescriptions={isLoadingSummaryDescriptions}
        onSummaryDescriptionsClick={onSummaryDescriptionsClick}
        summaryDescriptions={summaryDescriptions}
        sidebarWidthPercentage={sideBarWidthPercentage}
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
        isLoading={isLoadingSuggestedItems}
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
        isSuggestedItem={isSuggestedItem}
        onClose={onEditClose}
        onPlus={onEditPlus}
        onSave={onEditSave}
        onAddItem={onAddItem}
        onClearSuggestion={onClearRegeneratedItem}
        onItemEdit={onItemEdit}
        onConfirmRegeneratedText={onConfirmRegeneratedText}
        onRemove={onEditRemove}
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