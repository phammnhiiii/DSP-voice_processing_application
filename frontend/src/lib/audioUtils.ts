// audioUtils.ts - Utility functions for audio processing

/**
 * Convert audio Blob to WAV format
 * MediaRecorder typically outputs webm, this converts it to wav
 */
export async function convertToWav(blob: Blob): Promise<Blob> {
    // Create an audio context
    const audioContext = new AudioContext();

    // Decode the audio data
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Convert to WAV
    const wavBlob = audioBufferToWav(audioBuffer);

    // Close the audio context
    await audioContext.close();

    return wavBlob;
}

/**
 * Convert AudioBuffer to WAV Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    // Interleave channels
    let interleaved: Float32Array;
    if (numChannels === 2) {
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);
        interleaved = new Float32Array(left.length + right.length);
        for (let i = 0; i < left.length; i++) {
            interleaved[i * 2] = left[i];
            interleaved[i * 2 + 1] = right[i];
        }
    } else {
        interleaved = buffer.getChannelData(0);
    }

    const dataLength = interleaved.length * bytesPerSample;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    writeString(view, 8, 'WAVE');

    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // byte rate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    const offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
        const sample = Math.max(-1, Math.min(1, interleaved[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + i * 2, intSample, true);
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Download Blob as WAV file
 */
export async function downloadAsWav(blob: Blob, filename: string): Promise<void> {
    try {
        // Convert to WAV if not already
        const wavBlob = blob.type === 'audio/wav' ? blob : await convertToWav(blob);

        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.wav') ? filename : `${filename}.wav`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error converting to WAV:', error);
        // Fallback: download as original format
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
