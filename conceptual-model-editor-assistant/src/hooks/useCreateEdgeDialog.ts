import { useSetRecoilState } from "recoil"
import { isShowCreateEdgeDialog } from "../atoms"

const useCreateEdgeDialog = () =>
{
    const setIsOpened = useSetRecoilState(isShowCreateEdgeDialog)

    const onClose = (): void =>
    {
        setIsOpened(_ => false)
    }

    return { onClose }
}

export default useCreateEdgeDialog