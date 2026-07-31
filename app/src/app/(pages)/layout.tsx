import Navbar from "@components/Navbar";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 flex flex-col">
        {children}
      </main>
    </>
  );
}
