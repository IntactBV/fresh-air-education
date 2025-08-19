export async function GET() {
  const mentors = Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    name: `Mentor ${i + 1}`,
    expertise: ['Math', 'Science', 'History', 'Art', 'Technology'][Math.floor(Math.random() * 5)],
    yearsOfExperience: Math.floor(Math.random() * 20) + 1,
    email: `mentor${i + 1}@example.com`
  }));

  return Response.json(mentors);
}
