'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DecoderPage() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(text);
      setOutput(decoded);
    } catch {
      try {
        const parsed = JSON.parse(text);
        setOutput(JSON.stringify(parsed, null, 2));
      } catch {
        setOutput(text);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Card className="bg-white/90 backdrop-blur-xl border-stone-200">
        <CardHeader>
          <CardTitle>Decoder utilitario</CardTitle>
          <CardDescription>Pega un texto URL-encoded o JSON para decodificarlo rápidamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Pega aquí..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={handleDecode} className="bg-green-700 hover:bg-green-800">Decodificar</Button>
          <pre className="whitespace-pre-wrap bg-stone-50 rounded-xl p-4 border border-stone-200 text-sm">{output}</pre>
        </CardContent>
      </Card>
    </div>
  );
}


