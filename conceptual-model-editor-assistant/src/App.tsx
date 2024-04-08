import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import useConceptualModel from './hooks/useConceptualModel'
import { ReactFlowProvider } from 'reactflow';
import useLayoutSize from './hooks/useLayoutSize';
import DialogDomainDescription from './components/DialogDomainDescription';
import DialogEditItem from './components/DialogEditItem';
import DialogCreateEdge from './components/DialogCreateEdge';
import { Relationship } from './interfaces';


function App()
{
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onIgnoreDomainDescriptionChange, onImportButtonClick, onSuggestItems, onSummaryButtonClick, summaryText,
    domainDescription, isIgnoreDomainDescription, onDomainDescriptionChange, inferenceIndexesMockUp, isShowDialogEdit, onEditClose, onEditPlus, onEditSave,
    isLoadingSuggestedItems, suggestedItems, selectedSuggestedItem, editedSuggestedItem, onEditSuggestion, onHighlightSingleItem,
    isShowDialogDomainDescription, onDialogDomainDescriptionClose, onHighlightSelectedItems, selectedNodes, tooltips, onAddItem,
    regeneratedItem, onClearRegeneratedItem, isLoadingEdit, isLoadingSummary1, isLoadingSummaryDescriptions, fieldToLoad, onItemEdit, onConfirmRegeneratedText, onSummaryDescriptionsClick,
    summaryDescriptions, isSuggestedItem, onEditRemove, nodeTypes, onAddNewEntity, isDisableSave, isDisableChange, onDialogCreateEdgeClose,
    isShowCreateEdgeDialog, onAddNewRelationship, onChangeItemType
  } = useConceptualModel()

  const { isSidebarOpen, sideBarWidthPercentage, onToggleSideBarCollapse } = useLayoutSize()


  return (
    <>
      <Topbar
        onIgnoreDomainDescriptionChange={onIgnoreDomainDescriptionChange}
        isIgnoreDomainDescription={isIgnoreDomainDescription}
        onImportButtonClick={onImportButtonClick}
        onSuggestItems={onSuggestItems}
        onSummaryButtonClick={onSummaryButtonClick}
        domainDescription={domainDescription}
        onDomainDescriptionChange={onDomainDescriptionChange}
        onHighlightSelectedItems={onHighlightSelectedItems}
        summary={summaryText}
        isLoadingSummary1={isLoadingSummary1}
        isLoadingSummaryDescriptions={isLoadingSummaryDescriptions}
        onSummaryDescriptionsClick={onSummaryDescriptionsClick}
        summaryDescriptions={summaryDescriptions}
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
        isLoading={isLoadingSuggestedItems}
        items={suggestedItems}
        onAddItem={onAddItem}
        onEditSuggestion={onEditSuggestion}
        onHighlightSingleItem={onHighlightSingleItem}
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
        isDisableSave={isDisableSave}
        isDisableChange={isDisableChange}
        onChangeItemType={onChangeItemType}
      />

      <DialogCreateEdge
        isOpened={isShowCreateEdgeDialog}
        onClose={onDialogCreateEdgeClose}
        onAddNewRelationship={onAddNewRelationship}
        relationship={selectedSuggestedItem as Relationship}
        onSuggestItems={onSuggestItems}
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