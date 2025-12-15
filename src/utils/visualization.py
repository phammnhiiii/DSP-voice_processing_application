# visualization.py - Audio Visualization Utilities
import matplotlib.pyplot as plt
import numpy as np
import os
import uuid

# Configure matplotlib
plt.rcParams['figure.figsize'] = [12, 4]
plt.style.use('dark_background')


def save_plot(y: np.ndarray, sr: int, title: str, output_dir: str = ".") -> str:
    """Generate and save a waveform plot."""
    fig, ax = plt.subplots(figsize=(12, 4))
    ax.plot(y, label="Processed Audio", alpha=0.7)
    ax.legend(loc="upper right")
    ax.set_xlabel("Time")
    ax.set_ylabel("Amplitude")
    ax.set_title(title)
    plt.tight_layout()
    
    filename = f"waveform_{uuid.uuid4().hex}.png"
    filepath = os.path.join(output_dir, filename)
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close()
    return filepath
