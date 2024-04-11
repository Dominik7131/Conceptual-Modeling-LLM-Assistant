import ConceptualModel from './components/ConceptualModel';
import Topbar from './components/Topbar'
import SideBar from './components/Sidebar';
import { ReactFlowProvider } from 'reactflow';
import HighlightDialog from './components/DialogDomainDescription';
import DialogEditItem from './components/DialogEditItem';
import DialogCreateEdge from './components/DialogCreateEdge';
import { RecoilRoot } from 'recoil';


function App()
{
  return (
    <>
      <Topbar/>

      <ConceptualModel/>

      <SideBar/>

      <HighlightDialog/>

      <DialogEditItem/>

      <DialogCreateEdge/>
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