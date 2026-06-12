"""Academy Guild — education and badges (Phase 6+)."""
from typing import Dict


class AcademyGuild:
    def __init__(self):
        self.name = "Academy Guild"
        self.enabled = False

    async def enroll(self, student: str, course: str = "hive_basics") -> Dict:
        return {"status": "enrolled", "student": student, "course": course, "badge": "none", "phase_required": 6}

    async def award_badge(self, student: str, badge: str) -> Dict:
        return {"status": "awarded", "student": student, "badge": badge}
