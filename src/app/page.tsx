import { Button } from "@ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h3 className="text-3xl font-bold tracking-tight text-center">
        Fresh Air Education
      </h3>
      <div className="flex items-center gap-4">
        <Link href="/edu">
          <Button>Autentificare</Button>
        </Link>
        <Link href="/edu/register">
          <Button variant="outline">Înregistrare</Button>
        </Link>
      </div>
    </div>
  );
}
