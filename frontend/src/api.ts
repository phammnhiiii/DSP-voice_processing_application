import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export interface ProcessAudioResponse {
    audio_url: string;
    waveform_url: string | null;
    raw_audio_url: string | null;
}

export interface TTSResponse {
    audio_url: string;
}

export interface STTResponse {
    text: string;
}

export interface TranslateResponse {
    translated_text: string;
}

// Process audio with effects (chipmunk, robot, echo, electronic, stutter)
export const processAudio = async (
    file: File | Blob,
    effect: string,
    delay: number = 0.2,
    repeat: number = 3,
    enableFilter: boolean = false
): Promise<ProcessAudioResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('effect', effect);
    formData.append('delay', delay.toString());
    formData.append('repeat', repeat.toString());
    formData.append('enable_filter', enableFilter.toString());

    const response = await axios.post<ProcessAudioResponse>(
        `${API_BASE}/process-audio`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

// Translate text between languages
export const translateText = async (
    text: string,
    sourceLang: string,
    targetLang: string
): Promise<TranslateResponse> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('source_lang', sourceLang);
    formData.append('target_lang', targetLang);

    const response = await axios.post<TranslateResponse>(`${API_BASE}/translate`, formData);
    return response.data;
};

// Text to Speech using backend API
export const convertTextToSpeech = async (
    text: string,
    lang: string = 'vi'
): Promise<TTSResponse> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('lang', lang);

    const response = await axios.post<TTSResponse>(`${API_BASE}/tts`, formData);
    return response.data;
};

// Speech to Text using backend API
export const speechToText = async (
    file: File | Blob,
    language: string = 'vi-VN'
): Promise<STTResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    const response = await axios.post<STTResponse>(`${API_BASE}/stt`, formData);
    return response.data;
};

// Get full URL for file paths returned by API
export const getFileUrl = (path: string | null): string | null => {
    if (!path) return null;
    return `${API_BASE}${path}`;
};

// Filter audio with DSP algorithms (noise, echo, music, siren)
export interface FilterAudioResponse {
    audio_url: string;
}

export type FilterType = 'noise' | 'echo' | 'music' | 'siren';

export const filterAudio = async (
    file: File | Blob,
    filterType: FilterType,
    intensity: number = 50
): Promise<FilterAudioResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filter_type', filterType);
    formData.append('intensity', intensity.toString());

    const response = await axios.post<FilterAudioResponse>(
        `${API_BASE}/filter-audio`,
        formData
    );
    return response.data;
};

// Effect types supported by DSP backend
export type DSPEffect =
    | 'chipmunk'
    | 'robot'
    | 'echo'
    | 'electronic'
    | 'stutter'
    | 'whisper'
    | 'distortion'
    | 'reverse'
    | 'monster'
    | 'telephone'
    | 'process_voice';

export const DSP_EFFECTS: { id: DSPEffect; name: string }[] = [
    { id: 'chipmunk', name: 'Chipmunk' },
    { id: 'robot', name: 'Robot' },
    { id: 'echo', name: 'Echo' },
    { id: 'electronic', name: 'Electronic' },
    { id: 'stutter', name: 'Stutter' },
    { id: 'whisper', name: 'Whisper' },
    { id: 'distortion', name: 'Distortion' },
    { id: 'reverse', name: 'Reverse' },
    { id: 'monster', name: 'Monster' },
    { id: 'telephone', name: 'Telephone' },
    { id: 'process_voice', name: 'Denoise' },
];

// ============== ELEVENLABS TTS ==============

export interface Voice {
    voice_id: string;
    name: string;
    category: string;
}

export interface VoicesResponse {
    voices: Voice[];
}

export interface CloneVoiceResponse {
    voice_id: string;
    name: string;
}

// Get all available ElevenLabs voices
export const getVoices = async (): Promise<Voice[]> => {
    try {
        const response = await axios.get<VoicesResponse>(`${API_BASE}/voices`);
        return response.data.voices || [];
    } catch (error) {
        console.error('Error fetching voices:', error);
        return [];
    }
};

// Text to Speech using ElevenLabs
export const ttsElevenLabs = async (
    text: string,
    voiceId: string = '21m00Tcm4TlvDq8ikWAM'
): Promise<TTSResponse> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('voice_id', voiceId);

    const response = await axios.post<TTSResponse>(`${API_BASE}/tts-eleven`, formData);
    return response.data;
};

// Clone a voice from audio sample
export const cloneVoice = async (
    name: string,
    audioFile: File | Blob,
    description: string = ''
): Promise<CloneVoiceResponse> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', audioFile);
    formData.append('description', description);

    const response = await axios.post<CloneVoiceResponse>(`${API_BASE}/clone-voice`, formData);
    return response.data;
};

// ============== AI DENOISING (DeepFilterNet) ==============

export interface AIDenoiseStatusResponse {
    available: boolean;
    sample_rate: number | null;
    error?: string;
}

export interface AIDenoiseResponse {
    audio_url: string;
}

// Check if AI denoising is available
export const getAIDenoiseStatus = async (): Promise<AIDenoiseStatusResponse> => {
    try {
        const response = await axios.get<AIDenoiseStatusResponse>(`${API_BASE}/ai-denoise-status`);
        return response.data;
    } catch (error) {
        return { available: false, sample_rate: null, error: 'Failed to check status' };
    }
};

// Denoise audio using AI (DeepFilterNet)
export const aiDenoise = async (file: File | Blob): Promise<AIDenoiseResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<AIDenoiseResponse>(`${API_BASE}/ai-denoise`, formData);
    return response.data;
};

// ============== XTTS VOICE CLONING ==============

export interface XTTSStatusResponse {
    available: boolean;
    languages: string[];
    error?: string;
}

export interface XTTSCloneResponse {
    audio_url: string;
}

// Check if XTTS is available
export const getXTTSStatus = async (): Promise<XTTSStatusResponse> => {
    try {
        const response = await axios.get<XTTSStatusResponse>(`${API_BASE}/xtts-status`);
        return response.data;
    } catch (error) {
        return { available: false, languages: [], error: 'Failed to check status' };
    }
};

// Clone voice using XTTS
export const xttsCloneVoice = async (
    text: string,
    speakerFile: File | Blob,
    language: string = 'vi'
): Promise<XTTSCloneResponse> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('speaker_file', speakerFile);
    formData.append('language', language);

    const response = await axios.post<XTTSCloneResponse>(`${API_BASE}/xtts-clone`, formData);
    return response.data;
};
