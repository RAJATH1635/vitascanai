from pathlib import Path

print("=" * 60)
print("      VitaScan AI - Dementia Dataset Explorer")
print("=" * 60)

# Dataset Path
DATASET_PATH = Path(
    r"E:\vita\vitascan\Datasets\Dementia_dataset\AugmentedAlzheimerDataset"
)

# Check dataset
if not DATASET_PATH.exists():
    print("❌ Dataset not found!")
    print(DATASET_PATH)
    exit()

print(f"\n✅ Dataset Found:")
print(DATASET_PATH)

print("\nClasses Found")
print("-" * 60)

total_images = 0

for folder in sorted(DATASET_PATH.iterdir()):

    if folder.is_dir():

        image_files = []

        for ext in ["*.jpg", "*.jpeg", "*.png"]:

            image_files.extend(folder.glob(ext))

        count = len(image_files)

        total_images += count

        print(f"{folder.name:<25} {count:>6} images")

print("-" * 60)
print(f"Total Images : {total_images}")