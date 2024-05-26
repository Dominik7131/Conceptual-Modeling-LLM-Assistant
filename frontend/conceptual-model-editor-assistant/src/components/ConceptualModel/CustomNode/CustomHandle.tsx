import { Typography } from "@mui/material"
import { Handle, Position } from "reactflow"
import { NodeHandleID, NodeHandleType, PRIMARY_COLOR } from "../../../interfaces/interfaces"
import { BLACK_COLOR } from "../../../utils/utility"


interface Props
{
    id: NodeHandleID
    type: NodeHandleType
    handleOffset: number
    isSelected: boolean
    position: Position
    isHovered: boolean
}


const CustomHandle: React.FC<Props> = ({ id, type, handleOffset, isSelected, position, isHovered }): JSX.Element =>
{
    const sourceHandleText = "s"
    const targetHandleText = "t"
    const fontSize = "13px"
    const color = isSelected ? PRIMARY_COLOR : BLACK_COLOR
    const offset = `-${handleOffset}px`

    const handleText = type === NodeHandleType.SOURCE ? sourceHandleText : targetHandleText


    return (
        <Handle
            id={id}
            type={type}
            position={position}
            style={{ [position]: offset, background: color }}>
        
            {
                isHovered &&
                <Typography
                    fontSize={fontSize}
                    color={color}>
                    { handleText }
                </Typography>
            }

        </Handle>
    )
}

export default CustomHandle