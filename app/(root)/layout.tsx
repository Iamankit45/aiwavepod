
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <div>
    <main>
        <p>Left Sidebar</p>
        {children}
        <p>Right Sidebar</p>
    </main>
   </div>
  );
}
