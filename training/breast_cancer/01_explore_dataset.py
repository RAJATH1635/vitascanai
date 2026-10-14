from pathlib import Path

print("=" * 60)
print("VitaScan AI - Breast Cancer Dataset Explorer")
print("=" * 60)

DATASET_PATH = Path(
    r"E:\vita\vitascan\Datasets\breast_dataset\Dataset_BUSI_with_GT"
)

if not DATASET_PATH.exists():
    print("Dataset not found!")
    exit()

print("\nDataset Found:")
print(DATASET_PATH)

print("\nClasses")
print("-" * 50)

total_images = 0

for cls in sorted(DATASET_PATH.iterdir()):

    if not cls.is_dir():
        continue

    images = [
        img
        for img in cls.glob("*.png")
        if "_mask" not in img.stem
    ]

    print(f"{cls.name:<12} {len(images)} images")

    total_images += len(images)

print("-" * 50)

print(f"Total Images : {total_images}")