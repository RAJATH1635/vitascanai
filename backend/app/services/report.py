from sqlalchemy.orm import Session

from app.models.prediction import Prediction


class ReportService:

    @staticmethod
    def get_reports(
        db: Session,
        user_id: str,
    ):
        """
        Return all reports for the logged-in user.
        """
        return (
            db.query(Prediction)
            .filter(Prediction.user_id == user_id)
            .order_by(Prediction.created_at.desc())
            .all()
        )

    @staticmethod
    def get_report(
        db: Session,
        report_id: str,
        user_id: str,
    ):
        print("\n========== REPORT DEBUG ==========")
        print("Requested Report ID:", report_id)
        print("Current User ID:", user_id)

        reports = db.query(Prediction).all()

        print(f"Total Reports in DB: {len(reports)}")

        for r in reports:
            print("----------------------------")
            print("DB Report ID :", r.id)
            print("DB User ID   :", r.user_id)
            print("Disease      :", r.disease)

        report = (
            db.query(Prediction)
            .filter(
                Prediction.id == report_id,
                Prediction.user_id == user_id,
            )
            .first()
        )

        print("FOUND REPORT:", report)
        print("=================================\n")

        return report