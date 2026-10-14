from pathlib import Path
import shutil

SOURCE = Path(r"E:\vita\vitascan\Datasets\breast_dataset\Dataset_BUSI_with_GT")
DEST = Path(r"E:\vita\vitascan\Datasets\breast_dataset_clean")

if DEST.exists():
    shutil.rmtree(DEST)

DEST.mkdir()

print("=" * 60)
print("Preparing Clean Breast Cancer Dataset")
print("=" * 60)

total = 0

for cls in SOURCE.iterdir():

    if not cls.is_dir():
        continue

    (DEST / cls.name).mkdir()

    count = 0

    for img in cls.glob("*.png"):

        if "_mask" in img.stem:
            continue

        shutil.copy(img, DEST / cls.name / img.name)
        count += 1

    total += count

    print(f"{cls.name:<12} {count} images")

print("-" * 50)
print(f"Total Images : {total}")
print("\nClean dataset created successfully!")