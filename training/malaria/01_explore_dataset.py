from pathlib import Path

print("=" * 60)
print("VitaScan AI - Malaria Dataset Explorer")
print("=" * 60)

DATASET_PATH = Path(
    r"E:\vita\vitascan\Datasets\malaria_dataset\cell_images"
)

if not DATASET_PATH.exists():
    print("\nDataset not found!")
    exit()

print("\nDataset Found:")
print(DATASET_PATH)

print("\nClasses")
print("-" * 50)

total_images = 0

for cls in sorted(DATASET_PATH.iterdir()):

    if not cls.is_dir():
        continue

    images = list(cls.glob("*"))

    print(f"{cls.name:<15} {len(images)} images")

    total_images += len(images)

print("-" * 50)
print(f"Total Images : {total_images}")