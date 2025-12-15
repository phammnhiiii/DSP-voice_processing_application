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

