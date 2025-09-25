// Script to generate 10,000+ fake book records for CSV editor testing

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
  "Sarah",
  "Christopher",
  "Karen",
  "Charles",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Helen",
  "Mark",
  "Sandra",
  "Donald",
  "Donna",
  "Steven",
  "Carol",
  "Paul",
  "Ruth",
  "Andrew",
  "Sharon",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Laura",
  "Kevin",
  "Sarah",
  "Brian",
  "Kimberly",
  "George",
  "Deborah",
  "Edward",
  "Dorothy",
  "Ronald",
  "Lisa",
  "Timothy",
  "Nancy",
  "Jason",
  "Karen",
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

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTitle() {
  const numWords = Math.floor(Math.random() * 4) + 2; // 2-5 words
  const words = [];

  for (let i = 0; i < numWords; i++) {
    words.push(getRandomElement(titleWords));
  }

  return words.join(" ");
}

function generateAuthor() {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  return `${firstName} ${lastName}`;
}

function generateISBN() {
  // Generate a fake ISBN-13
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
}

function generateYear() {
  const currentYear = new Date().getFullYear();
  return Math.floor(Math.random() * (currentYear - 1900 + 1)) + 1900;
}

function generateBookData(count = 10000) {
  const books = [];

  console.log(`Generating ${count} book records...`);

  for (let i = 0; i < count; i++) {
    books.push({
      Title: generateTitle(),
      Author: generateAuthor(),
      Genre: getRandomElement(genres),
      PublishedYear: generateYear(),
      ISBN: generateISBN(),
    });

    if ((i + 1) % 1000 === 0) {
      console.log(`Generated ${i + 1} records...`);
    }
  }

  return books;
}

function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes in CSV
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

  return csvContent;
}

// Generate the data
const bookData = generateBookData(12000); // Generate 12,000 records
const csvContent = convertToCSV(bookData);

console.log("Book data generation complete!");
console.log(`Total records: ${bookData.length}`);
console.log("Sample records:");
console.log(bookData.slice(0, 3));
if (typeof window !== "undefined") {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample-books-12000.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
} else {
  // Node environment - log the first few lines
  console.log("\nFirst few lines of CSV:");
  console.log(csvContent.split("\n").slice(0, 5).join("\n"));
}
