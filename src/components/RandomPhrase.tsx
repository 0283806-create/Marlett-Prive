import { useEffect, useState } from "react";

const phrases = [
  "En Marlett, los momentos no se planean: se sienten en familia, se celebran juntos y se guardan para siempre.",
  "En Marlett, los momentos se vuelven memorias: de esas que se cuentan, se comparten y se atesoran en familia.",
  "En Marlett, no solo celebramos eventos: celebramos historias familiares que merecen ser recordadas.",
  "En Marlett, los momentos unen, la familia crece y los recuerdos florecen.",
  "En Marlett, los momentos se tejen despacio, entre risas, abrazos y recuerdos que permanecen."
];

export default function RandomPhrase() {
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    setPhrase(phrases[randomIndex]);
  }, []);

  return (
    <p className="text-lg md:text-xl font-light text-[#d5dccc] italic tracking-wide">
      {phrase}
    </p>
  );
}

