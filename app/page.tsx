import MatrixRain from "@/components/MatrixRain";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative pt-12 pb-8 px-4">
      <MatrixRain />
      <HomeClient />
    </main>
  );
}
