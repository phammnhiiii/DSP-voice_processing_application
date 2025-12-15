import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export interface ProcessAudioResponse {
    audio_url: string;
    waveform_url: string | null;
}

export interface TTSResponse {
    audio_url: string;
}

export interface STTResponse {
    text: string;
}

// Process audio with effects (chipmunk, robot, echo, electronic, stutter)
export const processAudio = async (
    file: File | Blob,
    effect: string,
    delay: number = 0.2,
    repeat: number = 3
): Promise<ProcessAudioResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('effect', effect);
    formData.append('delay', delay.toString());
    formData.append('repeat', repeat.toString());

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

// Text to Speech
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

// Speech to Text
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
    | 'process_voice';

export const DSP_EFFECTS: { id: DSPEffect; name: string; icon: string }[] = [
    { id: 'chipmunk', name: 'Chipmunk', icon: '🐿️' },
    { id: 'robot', name: 'Robot', icon: '🤖' },
    { id: 'echo', name: 'Tiếng Vọng', icon: '🔊' },
    { id: 'electronic', name: 'Điện Tử', icon: '⚡' },
    { id: 'stutter', name: 'Nói Lắp', icon: '🔁' },
    { id: 'process_voice', name: 'Xử Lý Giọng', icon: '🎙️' },
];
