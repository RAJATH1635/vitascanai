import pandas as pd
from pathlib import Path

print("=" * 60)
print("VitaScan AI - Anemia Dataset Explorer")
print("=" * 60)

DATASET = Path(
    r"E:\vita\vitascan\Datasets\anemia_dataset\anemia.csv"
)

if not DATASET.exists():
    print("Dataset not found!")
    print(DATASET)
    exit()

df = pd.read_csv(DATASET)

print("\nDataset Found!\n")

print(df.head())

print("\n" + "=" * 60)

print("Dataset Shape")
print(df.shape)

print("\nColumns")
print(df.columns.tolist())

print("\nMissing Values")
print(df.isnull().sum())

print("\nClass Distribution")

print(df["Result"].value_counts())

print("\nDataset Information\n")

print(df.info())

print("=" * 60)