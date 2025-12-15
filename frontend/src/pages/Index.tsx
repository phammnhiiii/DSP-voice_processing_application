import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { VoiceTransformer } from '@/components/sections/VoiceTransformer';
import { NoiseFilter } from '@/components/sections/NoiseFilter';
import { TextToSpeech } from '@/components/sections/TextToSpeech';
import { SpeechToText } from '@/components/sections/SpeechToText';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <VoiceTransformer />
        <NoiseFilter />
        <TextToSpeech />
        <SpeechToText />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
