export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="bg-muted/30 flex min-h-svh flex-1 items-center justify-center p-6">{children}</div>;
}
