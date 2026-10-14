from predictor import predict_anemia

result = predict_anemia(
    gender=1,
    hemoglobin=9.5,
    mch=21,
    mchc=29,
    mcv=72,
)

print(result)