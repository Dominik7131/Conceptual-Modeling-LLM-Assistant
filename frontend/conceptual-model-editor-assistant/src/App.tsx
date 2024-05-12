import ConceptualModel from './components/ConceptualModel/ConceptualModel';
import Topbar from './components/Topbar/Topbar'
import SideBar from './components/Sidebar/Sidebar';
import { ReactFlowProvider } from 'reactflow';
import HighlightDialog from './components/DialogDomainDescription';
import DialogCreateEdge from './components/DialogCreateEdge';
import { RecoilRoot } from 'recoil';
import DialogEditItem from './components/DialogEditItem/DialogEditItem';


function App()
{
  return (
    <RecoilRoot>
      <Topbar/>

      <ReactFlowProvider>
        <ConceptualModel/>
      </ReactFlowProvider>


      <SideBar/>

      <HighlightDialog/>

      <DialogEditItem/>

      <DialogCreateEdge/>
    </RecoilRoot>
  );
}


export default App;