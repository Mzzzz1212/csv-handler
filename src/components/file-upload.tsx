"use client";

import { useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface BookRecord {
  id: string;
  Title: string;
  Author: string;
  Genre: string;
  PublishedYear: number;
  ISBN: string;
}

interface FileUploadProps {
  onFileUpload: (data: BookRecord[]) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const firstNames = [
    "James",
    "Mary",
    "John",
    "Patricia",
    "Robert",
    "Jennifer",
    "Michael",
    "Linda",
    "William",
    "Elizabeth",
    "David",
    "Barbara",
    "Richard",
    "Susan",
    "Joseph",
    "Jessica",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
    "Walker",
    "Young",
    "Allen",
    "King",
    "Wright",
    "Scott",
    "Torres",
    "Nguyen",
    "Hill",
    "Flores",
    "Green",
    "Adams",
    "Nelson",
    "Baker",
    "Hall",
    "Rivera",
    "Campbell",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
    "Walker",
    "Young",
    "Allen",
    "King",
    "Wright",
    "Scott",
    "Torres",
    "Nguyen",
    "Hill",
    "Flores",
    "Green",
    "Adams",
    "Nelson",
    "Baker",
    "Hall",
    "Rivera",
    "Campbell",
  ];

  const titleWords = [
    "The",
    "A",
    "An",
    "Secret",
    "Hidden",
    "Lost",
    "Last",
    "First",
    "Great",
    "Dark",
    "Light",
    "Shadow",
    "Golden",
    "Silver",
    "Red",
    "Blue",
    "Green",
    "Black",
    "White",
    "Ancient",
    "Modern",
    "Future",
    "Past",
    "Journey",
    "Adventure",
    "Mystery",
    "Story",
    "Tale",
    "Legend",
    "Chronicles",
    "Saga",
    "Quest",
    "Dream",
    "Vision",
    "Hope",
    "Love",
    "Heart",
    "Soul",
    "Mind",
    "Spirit",
    "Life",
    "Death",
    "Time",
    "Space",
    "World",
    "Universe",
    "Galaxy",
    "Star",
    "Moon",
    "Sun",
    "Earth",
    "Ocean",
    "Mountain",
    "Forest",
    "Desert",
    "City",
    "Town",
    "Village",
    "Castle",
    "Tower",
    "Bridge",
    "Garden",
    "House",
    "Home",
    "Family",
    "Child",
    "Woman",
    "Man",
    "King",
    "Queen",
    "Prince",
    "Princess",
    "Warrior",
    "Hero",
    "Villain",
    "Master",
    "Student",
    "Teacher",
  ];

  const getRandomElement = (array: string[]) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const generateTitle = () => {
    const numWords = Math.floor(Math.random() * 4) + 2;
    const words = [];
    for (let i = 0; i < numWords; i++) {
      words.push(getRandomElement(titleWords));
    }
    return words.join(" ");
  };

  const generateAuthor = () => {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    return `${firstName} ${lastName}`;
  };

  const generateISBN = () => {
    const prefix = "978";
    const group = Math.floor(Math.random() * 10);
    const publisher = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    const title = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const check = Math.floor(Math.random() * 10);
    return `${prefix}-${group}-${publisher}-${title}-${check}`;
  };

  const generateYear = () => {
    const currentYear = new Date().getFullYear();
    return Math.floor(Math.random() * (currentYear - 1900 + 1)) + 1900;
  };

  const parseCSV = useCallback((csvText: string): BookRecord[] => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      throw new Error(
        "CSV file must have at least a header row and one data row",
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const expectedHeaders = [
      "Title",
      "Author",
      "Genre",
      "PublishedYear",
      "ISBN",
    ];

    const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    const data: BookRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values: string[] | number[] = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length !== headers.length) {
        console.warn(
          `Row ${i + 1} has ${values.length} columns, expected ${headers.length}. Skipping.`,
        );
        continue;
      }

      const record = {};
      headers.forEach((header, index) => {
        const value = values[index].replace(/^"|"$/g, "");

        if (header === "PublishedYear") {
          const year = Number.parseInt(value);
          if (isNaN(year)) {
            console.warn(
              `Invalid year "${value}" in row ${i + 1}. Using 2000.`,
            );
            record[header] = 2000;
          } else {
            record[header] = year;
          }
        } else {
          record[header] = value;
        }
      });

      data.push(record as BookRecord);
    }

    return data;
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
        });
        return;
      }

      setIsProcessing(true);

      try {
        const text = await file.text();
        const data = parseCSV(text);

        if (data.length === 0) {
          throw new Error("No valid data rows found in CSV file");
        }

        onFileUpload(data);
      } catch (error) {
        toast({
          title: "Error parsing CSV",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          dismissible: true,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [parseCSV, onFileUpload, toast],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const generateSampleData = useCallback(() => {
    setIsProcessing(true);

    const sampleBooks: BookRecord[] = [];
    const recordCount = 12000;

    console.log(`[v0] Generating ${recordCount} book records...`);

    for (let i = 0; i < recordCount; i++) {
      sampleBooks.push({
        Title: generateTitle(),
        Author: generateAuthor(),
        Genre: getRandomElement(genres),
        PublishedYear: generateYear(),
        ISBN: generateISBN(),
      });

      if ((i + 1) % 1000 === 0) {
        console.log(`[v0] Generated ${i + 1} records...`);
      }
    }

    console.log(
      `[v0] Book data generation complete! Total records: ${sampleBooks.length}`,
    );

    onFileUpload(sampleBooks);
    setIsProcessing(false);

    toast({
      title: "Sample data generated",
      description: `Generated ${recordCount.toLocaleString()} realistic book records for testing`,
    });
  }, [onFileUpload, toast]);

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
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
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload CSV File</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your CSV file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Required columns: Title, Author, Genre, PublishedYear, ISBN
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isProcessing}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>

              {isProcessing ? "Processing..." : "Choose File"}
            </Button>

            <Button
              variant="secondary"
              onClick={generateSampleData}
              disabled={isProcessing}
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>

              {isProcessing ? "Generating..." : "Generate 12K Sample Records"}
            </Button>
          </div>

          <Input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
