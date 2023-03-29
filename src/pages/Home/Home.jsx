import React, { useEffect, useState } from "react";
import images from "../../images/images";
import { Avatar } from "@mui/material";
import { deepOrange, blue, green } from "@mui/material/colors";

import { v4 as uuidv4 } from "uuid";
import "./home.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export default function Home() {
  let { lockIcon, moreIcon } = images;
  const [editingRowId, setEditingRowId] = useState(null);
  const [newRowName, setNewRowName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [columns, setColumns] = useState([
    {
      id: uuidv4(),
      title: "Columna 1",
      rows: [
        { id: uuidv4().toString(), text: "Fila 1", imageUrl: "" },
        { id: uuidv4().toString(), text: "Fila 2", imageUrl: "" },
      ],
    },
    {
      id: uuidv4().toString(),
      title: "Columna 2",
      rows: [],
    },
    {
      id: uuidv4().toString(),
      title: "Columna 3",
      rows: [],
    },
  ]);

  const addColumn = () => {
    const newColumn = {
      id: uuidv4().toString(),
      title: `Columna ${columns.length + 1}`,
      rows: [],
    };
    setColumns([...columns, newColumn]);
  };

  const addRow = (columnId) => {
    const newColumns = columns.map((column) => {
      if (column.id === columnId) {
        const newRows = [
          ...column.rows,
          { id: uuidv4().toString(), text: "Nueva fila" },
        ];
        return { ...column, rows: newRows };
      }
      return column;
    });
    setColumns(newColumns);
  };

  const removeRow = (columnId, rowId) => {
    const newColumns = columns.map((column) => {
      if (column.id === columnId) {
        const newRows = column.rows.filter((row) => row.id !== rowId);
        return { ...column, rows: newRows };
      }
      return column;
    });
    setColumns(newColumns);
  };

  const removeColumn = (columnId) => {
    const newColumns = columns.filter((column) => column.id !== columnId);
    setColumns(newColumns);
  };

  const handleDragOver = (event, columnId) => {
    event.preventDefault();
  };

  const handleDragStart = (event, columnId, rowId) => {
    event.dataTransfer.setData("text/plain", rowId);
    event.dataTransfer.setData("text/col-id", columnId);
  };

  const handleDrop = (event, targetColumnId) => {
    event.preventDefault();
    const rowId = event.dataTransfer.getData("text/plain");
    const sourceColumnId = event.dataTransfer.getData("text/col-id");

    const draggedColumn = columns.find(
      (column) => column.id === sourceColumnId
    );
    const draggedItem = draggedColumn.rows.find((row) => row.id === rowId);

    if (sourceColumnId === targetColumnId) {
      return;
    }

    const newColumns = columns.map((column) => {
      if (column.id === targetColumnId) {
        const newRows = [
          ...column.rows,
          { id: draggedItem.id, text: draggedItem.text },
        ];
        return { ...column, rows: newRows };
      } else if (column.id === sourceColumnId) {
        const newRows = column.rows.filter((row) => row.id !== rowId);
        return { ...column, rows: newRows };
      }
      return column;
    });

    setColumns(newColumns);
  };

  console.log(columns);

  const handleSaveRowName = (columnId, rowId, newName) => {
    const newColumns = columns.map((column) => {
      if (column.id === columnId) {
        const newRows = column.rows.map((row) => {
          if (row.id === rowId) {
            return { ...row, text: newName };
          } else {
            return row;
          }
        });
        return { ...column, rows: newRows };
      } else {
        return column;
      }
    });
    setColumns(newColumns);
  };

  const handleMenuClick = (event, columnId, rowId) => {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${columnId}-${rowId}`);
    menu.style.display = menu.style.display === "block" ? "none" : "block";
    const buttonRect = event.target.getBoundingClientRect();
    menu.style.top = buttonRect.bottom + "px";
    menu.style.left = buttonRect.left + "px";
  };

  return (
    <>
      <div className=" dflex jcontentSpaceBet bCWhite mt2 minHeight5 alingItems p1">
        <div className="dflex gap15 p1 alingItems">
          <div className="mc-buttonPrivate">
            <img
              src={lockIcon}
              className="mc-buttonPrivateAppsIcon"
              alt="appicons"
            />
            <p className="mc-buttonPrivateAppsIcon-p">Private</p>
          </div>

          <Avatar
            sx={{ bgcolor: blue[500], width: 27, height: 27 }}
            variant="rounded"
          >
            M
          </Avatar>
          <Avatar
            sx={{ bgcolor: green[500], width: 27, height: 27 }}
            variant="rounded"
          >
            J
          </Avatar>
          <Avatar sx={{ width: 27, height: 27 }} variant="rounded">
            G
          </Avatar>
          <Avatar sx={{ width: 27, height: 27 }} variant="rounded">
            A
          </Avatar>
          <Avatar
            sx={{ bgcolor: deepOrange[500], width: 27, height: 27 }}
            variant="rounded"
            className="showMenuAvatar"
          >
            +
          </Avatar>
        </div>
        <div className="mc-buttonPrivate m1">
          <img
            src={moreIcon}
            className="mc-buttonPrivateAppsIcon"
            alt="appicons"
          />
          <p className="mc-buttonPrivateAppsIcon-p">Show Menu</p>
        </div>
      </div>
      <div className="container">
        <div className="columns-container">
          {columns.map((column) => (
            <div
              key={column.id}
              className="column"
              onDrop={(event) => handleDrop(event, column.id)}
              onDragOver={(event) => handleDragOver(event)}
            >
              <div className="column-header">
                <h2>{column.title}</h2>
                <button onClick={() => removeColumn(column.id)}>
                  Eliminar columna
                </button>
              </div>
              {showModal ? (
                <div className="modal">
                  <h3>{`Nombre: ${selectedRow.text} Id: ${selectedRow.id} `}</h3>
                  <button onClick={() => setShowModal(false)}>Cerrar</button>
                </div>
              ) : null}
              {column.rows.map((row) => (
                <div
                  key={row.id}
                  className="row"
                  draggable
                  onDragStart={(event) =>
                    handleDragStart(event, column.id, row.id)
                  }
                  onClick={() => {
                    setSelectedRow(row);
                    setShowModal(true);
                  }}
                >
                  {editingRowId === row.id ? (
                    <>
                      <input
                        value={newRowName}
                        onChange={(event) => {
                          setNewRowName(event.target.value);
                        }}
                        onClick={(e)=>e.stopPropagation()}
                      />
                      <div className="dflex gap10 mr10">
                        <button
                          onClick={(e) => {
                            handleSaveRowName(column.id, row.id, newRowName);
                            setEditingRowId(null);
                            e.stopPropagation();
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            setEditingRowId(null);
                            e.stopPropagation();
                          }}
                        >
                          ✘
                        </button>
                      </div>{" "}
                    </>
                  ) : (
                    <>
                      <p className="row-text">{row.text}</p>
                      <button
                        className="menu-button"
                        onClick={(event) =>
                          handleMenuClick(event, column.id, row.id)
                        }
                      >
                        <img src={moreIcon} alt="options" />
                      </button>
                      <div
                        id={`menu-${column.id}-${row.id}`}
                        className="dropdown-menu"
                      >
                        <ul>
                          <li
                            onClick={(e) => {
                              setEditingRowId(row.id);
                              setNewRowName(row.text);
                              e.stopPropagation();
                            }}
                          >
                            Editar
                          </li>
                          <li>Compartir</li>
                          <li>Exportar</li>
                        </ul>
                      </div>
                      <button
                        className="remove-row"
                        onClick={() => removeRow(column.id, row.id)}
                      >
                        Eliminar fila
                      </button>{" "}
                    </>
                  )}
                </div>
              ))}
              <button onClick={() => addRow(column.id)}>Agregar fila</button>
            </div>
          ))}
        </div>
        <button onClick={addColumn} className="button-agregarColumna">
          Agregar otra lista<span>+</span>
        </button>
      </div>
    </>
  );
}
