import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Mdorado</h1>
      <Image
        src="/Dorado_page-0001.jpg"
        alt="Mdorado"
        width={500}
        height={400}
        className="rounded-xl shadow-lg"
      />
    </div>
  );
}
