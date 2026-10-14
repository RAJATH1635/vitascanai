from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt

from evaluate_image_model import evaluate_image_model
from evaluate_tabular_model import evaluate_tabular_model


OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)


results = []


print("=" * 60)
print("        VitaScan AI Model Evaluation")
print("=" * 60)


# -------------------------
# IMAGE MODELS
# -------------------------

for disease in [

    "malaria",

    "breast_cancer",

    "dementia"

]:

    metrics = evaluate_image_model(disease)

    metrics["Model"] = disease

    results.append(metrics)


# -------------------------
# TABULAR MODEL
# -------------------------

metrics = evaluate_tabular_model("anemia")

metrics["Model"] = "anemia"

results.append(metrics)


# -------------------------
# SAVE SUMMARY CSV
# -------------------------

df = pd.DataFrame(results)

df = df[[
    "Model",
    "accuracy",
    "precision",
    "recall",
    "f1_score"
]]

df.to_csv(

    OUTPUT_DIR / "summary.csv",

    index=False

)


# -------------------------
# COMPARISON GRAPH
# -------------------------

plt.figure(figsize=(10,6))

plt.bar(

    df["Model"],

    df["accuracy"]

)

plt.ylabel("Accuracy")

plt.title("VitaScan AI Model Comparison")

plt.ylim(0,1)

plt.tight_layout()

plt.savefig(

    OUTPUT_DIR / "comparison.png",

    dpi=300

)

plt.close()


# -------------------------
# PRINT RESULTS
# -------------------------

print()

print(df)

print()

print("=" * 60)

print("Evaluation Completed Successfully")

print("=" * 60)