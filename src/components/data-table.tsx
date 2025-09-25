"use client";

import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface BookRecord {
  id: string;
  Title: string;
  Author: string;
  Genre: string;
  PublishedYear: number;
  ISBN: string;
  isModified?: boolean;
}

interface DataTableProps {
  data: BookRecord[];
  onCellEdit: (
    rowId: string,
    field: keyof BookRecord,
    value: string | number,
  ) => void;
  sortField: keyof BookRecord;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof BookRecord, direction: "asc" | "desc") => void;
  isLoading?: boolean;
  startingRowNumber?: number;
}

interface EditingCell {
  rowId: string;
  field: keyof BookRecord;
}

const genres = [
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Fantasy",
  "Biography",
  "History",
  "Self-Help",
  "Business",
  "Technology",
  "Health",
  "Travel",
  "Cooking",
  "Art",
  "Philosophy",
  "Psychology",
  "Education",
  "Children",
  "Young Adult",
  "Horror",
  "Thriller",
  "Poetry",
  "Drama",
];

export function DataTable({
  data,
  onCellEdit,
  sortField,
  sortDirection,
  onSort,
  isLoading,
  startingRowNumber = 1,
}: DataTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleSort = useCallback(
    (field: keyof BookRecord) => {
      if (field == sortField) {
        onSort(field, sortDirection === "asc" ? "desc" : "asc");
      } else {
        onSort(field, "asc");
      }
    },
    [sortField, sortDirection, onSort],
  );

  const startEdit = useCallback(
    (rowId: string, field: keyof BookRecord, currentValue: string | number) => {
      setEditingCell({ rowId, field });
      setEditValue(currentValue.toString());
    },
    [],
  );

  const saveEdit = useCallback(() => {
    if (!editingCell) return;

    let value: string | number = editValue;
    if (editingCell.field === "PublishedYear") {
      const year = Number.parseInt(editValue);
      if (!isNaN(year)) {
        value = year;
      }
    }
    onCellEdit(editingCell.rowId, editingCell.field, value);
    setEditingCell(null);
    setEditValue("");
  }, [editingCell, editValue, onCellEdit]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue("");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        saveEdit();
      } else if (e.key === "Escape") {
        cancelEdit();
      }
    },
    [saveEdit, cancelEdit],
  );

  const SortButton = ({
    field,
    children,
  }: {
    field: keyof BookRecord;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-2 font-semibold justify-start hover:bg-muted/50"
    >
      {children}
      {sortField === field &&
        (sortDirection == "asc" ? (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 ml-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
            />
          </svg>
        ) : (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 ml-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"
            />
          </svg>
        ))}
    </Button>
  );

  const EditableCell = ({
    record,
    field,
    value,
  }: {
    record: BookRecord;
    field: keyof BookRecord;
    value: string | number;
  }) => {
    const isEditing =
      editingCell?.rowId === record.id && editingCell?.field === field;
    const isModified = record.isModified;

    if (isEditing) {
      if (field === "Genre") {
        return (
          <div className="flex items-center gap-1">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="ghost"
              onClick={saveEdit}
              className="h-6 w-6 p-0"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
              className="h-6 w-6 p-0"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-xs"
            type={field === "PublishedYear" ? "number" : "text"}
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={saveEdit}
            className="h-6 w-6 p-0"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={cancelEdit}
            className="h-6 w-6 p-0"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      );
    }

    return (
      <div
        className={`group flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-muted-foreground/50 ${
          isModified ? "bg-green-600/60" : ""
        } `}
        onClick={() => startEdit(record.id, field, value)}
      >
        <span
          className={`text-sm ${isModified ? "font-medium text-green-50" : ""}`}
        >
          {value}
        </span>
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 opacity-0 group-hover:opacity-50 transition-opacity"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
          />
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader className="">
          <TableRow>
            <TableHead className="text-left p-2 w-12">#</TableHead>
            <TableHead className="text-left p-2 min-w-[200px]">Title</TableHead>
            <TableHead className="text-left p-2 min-w-[150px]">
              Author
            </TableHead>
            <TableHead className="text-left p-2 min-w-[120px]">Genre</TableHead>
            <TableHead className="text-left p-2 w-24">Year</TableHead>
            <TableHead className="text-left p-2 min-w-[140px]">ISBN</TableHead>
            <TableHead className="text-left p-2 w-20">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, i) => (
            <TableRow
              key={i}
              className={`hover:bg-muted/25 transition-colors ${record.isModified ? "bg-green-50/50" : ""}`}
            >
              <TableCell className="p-2 text-sm text-muted-foreground">
                {startingRowNumber + i}
              </TableCell>
              <TableCell className="p-0">
                <EditableCell
                  record={record}
                  field="Title"
                  value={record.Title}
                />
              </TableCell>
              <TableCell className="p-0">
                <EditableCell
                  record={record}
                  field="Author"
                  value={record.Author}
                />
              </TableCell>
              <TableCell className="p-0">
                <EditableCell
                  record={record}
                  field="Genre"
                  value={record.Genre}
                />
              </TableCell>
              <TableCell className="p-0">
                <EditableCell
                  record={record}
                  field="PublishedYear"
                  value={record.PublishedYear}
                />
              </TableCell>
              <TableCell className="p-0">
                <EditableCell
                  record={record}
                  field="ISBN"
                  value={record.ISBN}
                />
              </TableCell>
              <TableCell className="p-2">
                {record.isModified && (
                  <div className="outline outline-green-600 text-xs px-3 py-1">
                    Modified
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No data to display
        </div>
      )}
    </div>
  );
}
