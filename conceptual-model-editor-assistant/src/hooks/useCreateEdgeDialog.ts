import { useSetRecoilState } from "recoil"
import { isShowCreateEdgeDialogState } from "../atoms"


const useCreateEdgeDialog = () =>
{
    const setIsOpened = useSetRecoilState(isShowCreateEdgeDialogState)

    const onClose = (): void =>
    {
        setIsOpened(_ => false)
    }

    return { onClose }
}

export default useCreateEdgeDialog