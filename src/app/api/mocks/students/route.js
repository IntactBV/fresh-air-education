export async function GET() {
  const students = [
    { id: 1, name: "Alice Smith", age: 18, grade: "A" },
    { id: 2, name: "Bob Johnson", age: 19, grade: "B" },
    { id: 3, name: "Charlie Brown", age: 17, grade: "A-" }
  ];

  return Response.json(students);
}
