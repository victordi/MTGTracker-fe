import React, {ReactElement} from "react";
import {Box, Paper, Typography} from "@mui/material";
import {DragDropContext, Draggable, Droppable, DropResult} from "@hello-pangea/dnd";

interface DraggableOrderingBoxProps {
  label: string;
  elements: DraggableOrderingElement[];
  setElements: React.Dispatch<React.SetStateAction<DraggableOrderingElement[]>>;
  Extra: () => ReactElement;
}

export interface DraggableOrderingElement {
  id: number;
  name: string;
}

export const DraggableOrderingBox = ({label, elements, setElements, Extra}: DraggableOrderingBoxProps): ReactElement => {
  const onDragStart = () => {
    document.body.style.overflow = "hidden";
  };

  const onDragEnd = (result: DropResult) => {
    document.body.style.overflow = "auto";
    if (!result.destination) return;

    const newOrder = [...elements];
    const [movedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, movedItem);

    setElements(newOrder);
  };

  return (
    <Box
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h5" color="primary">{label}</Typography>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="{label}-id">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                maxWidth: "600px",
                padding: 2,
                borderRadius: "8px",
                boxShadow: 2
              }}
            >
              {elements.map((element, idx) => (
                <Draggable key={element.id} draggableId={String(element.id)} index={idx}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        height: "60px", // Bigger touch area
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        cursor: "grab",
                        backgroundColor: "#e0e0e0",
                      }}
                    >
                      {element.name}
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
      <br/>

      <Extra/>
    </Box>
  );
}