export async function GET() {
  const documents = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `Document ${i + 1}`,
    author: `Author ${Math.floor(Math.random() * 10) + 1}`,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
    summary: `This is a summary for document ${i + 1}.`,
  }));

  return Response.json(documents);
}
