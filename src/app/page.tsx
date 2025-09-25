"use client";

import { DataTable } from "@/components/data-table";
import { FileUpload } from "@/components/file-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface BookRecord {
  Title: string;
  Author: string;
  Genre: string;
  PublishedYear: number;
  ISBN: string;
  isModified?: boolean;
}

export default function CSVEditor() {
  const [data, setData] = useState<BookRecord[]>([]);
  const [originalData, setOriginalData] = useState<BookRecord[]>([]);
  const [filteredData, setFilteredData] = useState<BookRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof BookRecord>("Title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 100;

  // Get unique genres and years for filters
  const uniqueGenres = useMemo(() => {
    const genres = [...new Set(data.map((item) => item.Genre))].sort();
    return genres;
  }, [data]);

  const uniqueYears = useMemo(() => {
    const years = [...new Set(data.map((item) => item.PublishedYear))].sort(
      (a, b) => b - a,
    );
    return years;
  }, [data]);

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.Title.toLowerCase().includes(term) ||
          item.Author.toLowerCase().includes(term) ||
          item.Genre.toLowerCase().includes(term) ||
          item.ISBN.toLowerCase().includes(term),
      );
    }

    // Genre filter
    if (genreFilter !== "all") {
      filtered = filtered.filter((item) => item.Genre === genreFilter);
    }

    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.PublishedYear.toString() === yearFilter,
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchTerm, genreFilter, yearFilter, sortField, sortDirection]);

  // Apply filters when dependencies change
  useMemo(() => {
    applyFilters();
  }, [applyFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleFileUpload = useCallback(
    (csvData: BookRecord[]) => {
      setIsLoading(true);

      console.log("[v0] CSV data received:", csvData.length, "records");
      console.log("[v0] First few records:", csvData.slice(0, 3));

      // Add unique IDs and reset modification flags
      const dataWithIds = csvData.map((item, index) => ({
        ...item,
        id: `row-${index}`,
        isModified: false,
      }));

      setData(dataWithIds);
      setOriginalData(JSON.parse(JSON.stringify(dataWithIds)));
      setCurrentPage(1);
      setIsLoading(false);

      toast({
        title: "File uploaded successfully",
        description: `Loaded ${csvData.length} records`,
      });
    },
    [toast],
  );

  const handleCellEdit = useCallback(
    (rowId: string, field: keyof BookRecord, value: string | number) => {
      setData((prevData) =>
        prevData.map((item) => {
          if (item.id === rowId) {
            const originalItem = originalData.find((orig) => orig.id === rowId);
            const updatedItem = { ...item, [field]: value };

            // Check if this row has been modified
            const isModified =
              originalItem &&
              (updatedItem.Title !== originalItem.Title ||
                updatedItem.Author !== originalItem.Author ||
                updatedItem.Genre !== originalItem.Genre ||
                updatedItem.PublishedYear !== originalItem.PublishedYear ||
                updatedItem.ISBN !== originalItem.ISBN);

            return { ...updatedItem, isModified };
          }
          return item;
        }),
      );
    },
    [originalData],
  );

  const handleResetAll = useCallback(() => {
    setData(JSON.parse(JSON.stringify(originalData)));
    toast({
      title: "All changes reset",
      description: "Reverted to original uploaded data",
    });
  }, [originalData, toast]);

  const handleDownload = useCallback(() => {
    if (data.length === 0) {
      toast({
        title: "No data to download",
        description: "Please upload a CSV file first",
        variant: "destructive",
      });
      return;
    }

    // Convert data to CSV
    const headers = ["Title", "Author", "Genre", "PublishedYear", "ISBN"];
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof BookRecord];
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edited-books-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download complete",
      description: "CSV file has been downloaded",
    });
  }, [data, toast]);

  const handleBackToHome = useCallback(() => {
    setData([]);
    setOriginalData([]);
    setFilteredData([]);
    setSearchTerm("");
    setGenreFilter("all");
    setYearFilter("all");
    setSortField("Title");
    setSortDirection("asc");
    setCurrentPage(1);

    toast({
      title: "Returned to home",
      description: "All data cleared, ready for new upload",
    });
  }, [toast]);

  const modifiedCount = data.filter((item) => item.isModified).length;

  console.log("[v0] Total data:", data.length);
  console.log("[v0] Filtered data:", filteredData.length);
  console.log("[v0] Paginated data:", paginatedData.length);
  console.log("[v0] Current page:", currentPage, "Total pages:", totalPages);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {data.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToHome}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
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
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  Back to Upload
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  CSV Handler
                </h1>
                <p className="text-xs text-left">By Mahizh</p>
                <p className="text-muted-foreground mt-1">
                  Upload, edit, and manage your book collection data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
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
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                  />
                </svg>
                {data.length} records
              </Badge>
              {modifiedCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
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
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  {modifiedCount} modified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* File Upload */}
        {data.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
                Upload CSV File
              </CardTitle>
              <CardDescription>
                Upload a CSV file with book data (Title, Author, Genre,
                PublishedYear, ISBN)
                <br />
                <span className="text-xs mt-1 block">
                  💡 Tip: Run the &quot;Generate Sample Book Data&quot; script
                  first to create a test CSV file with 12,000 records
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileUpload={handleFileUpload} />
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        {data.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 absolute left-2 top-1/2 -translate-y-1/2 transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>

                    <Input
                      placeholder="Search books, authors, genres, or ISBN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={genreFilter} onValueChange={setGenreFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      {uniqueGenres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {uniqueYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResetAll}
                    disabled={modifiedCount === 0}
                    className="flex items-center gap-2 bg-transparent"
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
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    Reset All
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="flex items-center gap-2"
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
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        {data.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <DataTable
                data={paginatedData}
                onCellEdit={handleCellEdit}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={(field, direction) => {
                  setSortField(field);
                  setSortDirection(direction);
                }}
                isLoading={isLoading}
                startingRowNumber={(currentPage - 1) * itemsPerPage + 1}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                    of {filteredData.length} results
                    {filteredData.length !== data.length && (
                      <span className="ml-2 text-xs">
                        (filtered from {data.length} total)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
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
                          d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                        />
                      </svg>
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
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
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
