import matplotlib.pyplot as plt

def save_waveform(original, processed, path):
    plt.figure(figsize=(12, 4))
    plt.plot(original, label="Original", alpha=0.7)
    plt.plot(processed, label="Processed", alpha=0.7)
    plt.legend()
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
