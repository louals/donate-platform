import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <FooterSection />
    </>
  );
}
