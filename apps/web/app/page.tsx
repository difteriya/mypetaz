import Link from 'next/link';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen max-w-[1280px] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="text-5xl">🐾</span>
      <h1 className="text-4xl font-bold text-brand-700">mypet.az</h1>
      <p className="max-w-md text-lg text-brand-900/70">
        Azərbaycanda ev heyvanları üçün &quot;hamısı bir yerdə&quot; portal.
      </p>

      <div className="flex gap-3">
        {session?.user ? (
          <Link href="/dashboard">
            <Button>İdarə panelinə keç</Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button>Daxil ol</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Qeydiyyat</Button>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
