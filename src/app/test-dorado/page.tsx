import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">GOLDM</h1>
      <Image
        src="/Dorado.svg"
        alt="GOLDM"
        width={500}
        height={400}
        className="rounded-xl shadow-lg"
      />
    </div>
  );
}
