# visualization.py - Audio Visualization Utilities
import matplotlib.pyplot as plt
import numpy as np
import os
import uuid

# Configure matplotlib
plt.rcParams['figure.figsize'] = [14, 7]
plt.style.use('dark_background')


def save_plot(y: np.ndarray, sr: int, title: str, output_dir: str = ".") -> str:
    """Generate and save a waveform plot."""
    fig, ax = plt.subplots(figsize=(14, 5))
    ax.plot(y, alpha=0.7, color='#00D4FF', linewidth=0.8)
    ax.set_xlabel("Samples")
    ax.set_ylabel("Amplitude")
    ax.grid(True, alpha=0.2)
    plt.tight_layout()
    
    filename = f"waveform_{uuid.uuid4().hex}.png"
    filepath = os.path.join(output_dir, filename)
    plt.savefig(filepath, dpi=150, bbox_inches='tight', facecolor='#1a1a2e')
    plt.close()
    return filepath


def save_comparison_plot(
    original_y: np.ndarray, 
    original_sr: int, 
    processed_y: np.ndarray, 
    processed_sr: int, 
    title: str, 
    output_dir: str = "."
) -> str:
    """
    Generate and save an OVERLAY waveform plot (before/after on same chart).
    Colors: Purple (original) + Cyan (processed)
    """
    fig, ax = plt.subplots(figsize=(14, 7))
    
    # Calculate time arrays
    time_original = np.arange(len(original_y)) / original_sr
    time_processed = np.arange(len(processed_y)) / processed_sr
    
    # Plot original audio (Purple/Magenta)
    ax.plot(time_original, original_y, alpha=0.6, color='#E066FF', linewidth=0.8, label='Original')
    
    # Plot processed audio (Cyan)
    ax.plot(time_processed, processed_y, alpha=0.7, color='#00D4FF', linewidth=0.8, label='Processed')
    
    # Labels and styling - English, no title
    ax.set_xlabel("Time (s)", fontsize=11, color='white')
    ax.set_ylabel("Amplitude", fontsize=11, color='white')
    ax.grid(True, alpha=0.2, linestyle='--')
    
    # Legend inside the chart
    ax.legend(loc='upper right', fontsize=10, framealpha=0.8)
    
    # Set x-axis limit to max of both
    max_time = max(time_original[-1] if len(time_original) > 0 else 1, 
                   time_processed[-1] if len(time_processed) > 0 else 1)
    ax.set_xlim(0, max_time)
    
    plt.tight_layout()
    
    filename = f"comparison_{uuid.uuid4().hex}.png"
    filepath = os.path.join(output_dir, filename)
    plt.savefig(filepath, dpi=150, bbox_inches='tight', facecolor='#1a1a2e')
    plt.close()
    return filepath
