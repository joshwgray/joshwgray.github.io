#!/usr/bin/env python3
"""Generate the downloadable engineering CV PDF from the Hugo data files."""

from __future__ import annotations

import argparse
import json
import subprocess
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import CondPageBreak, HRFlowable, Paragraph, SimpleDocTemplate, Spacer


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = REPO_ROOT / "static" / "cv" / "josh-gray-engineering-cv.pdf"


def load_yaml(path: Path):
    """Load YAML with PyYAML when available, otherwise use Ruby's standard YAML parser."""
    try:
        import yaml  # type: ignore

        with path.open("r", encoding="utf-8") as source:
            return yaml.safe_load(source)
    except ModuleNotFoundError:
        ruby = (
            "require 'yaml'; require 'json'; "
            "puts JSON.generate(YAML.safe_load(File.read(ARGV[0]), [], [], true))"
        )
        result = subprocess.run(
            ["ruby", "-e", ruby, str(path)],
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)


def clean(value) -> str:
    return (
        str(value)
        .replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u2011", "-")
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2022", "-")
    )


def safe(value) -> str:
    return escape(clean(value))


def format_month(value) -> str:
    if str(value).lower() == "present":
        return "Present"
    return datetime.strptime(str(value), "%Y-%m").strftime("%b %Y")


def add_footer(canvas, document) -> None:
    canvas.saveState()
    canvas.setTitle("Josh Gray - Engineering CV")
    canvas.setAuthor("Josh Gray")
    canvas.setStrokeColor(colors.HexColor("#CBD5E1"))
    canvas.setLineWidth(0.4)
    canvas.line(18 * mm, 13 * mm, A4[0] - 18 * mm, 13 * mm)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(18 * mm, 8.5 * mm, "Josh Gray | Engineering CV")
    canvas.drawRightString(A4[0] - 18 * mm, 8.5 * mm, f"Page {document.page}")
    canvas.restoreState()


def build_pdf(output: Path) -> None:
    metadata = load_yaml(REPO_ROOT / "data" / "cv" / "metadata.yaml")
    skills = load_yaml(REPO_ROOT / "data" / "cv" / "skills.yaml")
    experience = load_yaml(REPO_ROOT / "data" / "cv" / "experience.yaml")
    qualifications = load_yaml(REPO_ROOT / "data" / "cv" / "qualifications.yaml")

    slate = colors.HexColor("#172033")
    accent = colors.HexColor("#215C92")
    muted = colors.HexColor("#526174")
    rule = colors.HexColor("#CBD5E1")

    sample = getSampleStyleSheet()
    styles = {
        "name": ParagraphStyle(
            "CVName",
            parent=sample["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=27,
            textColor=slate,
            alignment=TA_CENTER,
            spaceAfter=3,
        ),
        "tagline": ParagraphStyle(
            "CVTagline",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=accent,
            alignment=TA_CENTER,
            spaceAfter=4,
        ),
        "contact": ParagraphStyle(
            "CVContact",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=10.5,
            textColor=muted,
            alignment=TA_CENTER,
            spaceAfter=7,
        ),
        "summary": ParagraphStyle(
            "CVSummary",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=12.5,
            textColor=slate,
            spaceAfter=5,
        ),
        "section": ParagraphStyle(
            "CVSection",
            parent=sample["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=15,
            textColor=accent,
            spaceBefore=9,
            spaceAfter=4,
            keepWithNext=True,
        ),
        "subsection": ParagraphStyle(
            "CVSubsection",
            parent=sample["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=9.2,
            leading=11,
            textColor=slate,
            spaceBefore=4,
            spaceAfter=2,
            keepWithNext=True,
        ),
        "role": ParagraphStyle(
            "CVRole",
            parent=sample["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=10.3,
            leading=12.5,
            textColor=slate,
            spaceBefore=4,
            spaceAfter=1,
            keepWithNext=True,
        ),
        "meta": ParagraphStyle(
            "CVMeta",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=7.8,
            leading=9.5,
            textColor=muted,
            spaceAfter=2.5,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "CVBody",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8.4,
            leading=10.7,
            textColor=slate,
            spaceAfter=2.5,
        ),
        "bullet": ParagraphStyle(
            "CVBullet",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8.1,
            leading=10.2,
            textColor=slate,
            leftIndent=10,
            firstLineIndent=-7,
            spaceAfter=1.4,
        ),
        "small": ParagraphStyle(
            "CVSmall",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=7.6,
            leading=9.5,
            textColor=muted,
            spaceAfter=2,
        ),
    }

    output.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=14 * mm,
        bottomMargin=18 * mm,
        title="Josh Gray - Engineering CV",
        author="Josh Gray",
    )

    social = {item["platform"]: item for item in metadata.get("social", [])}
    contact_parts = [
        safe(metadata["contact"]["location"]),
        safe(metadata.get("email", "")),
    ]
    for platform in ("LinkedIn", "GitHub"):
        item = social.get(platform)
        if item:
            contact_parts.append(
                f'<link href="{safe(item["url"])}" color="#215C92">{safe(platform)}</link>'
            )

    story = [
        Paragraph("Josh Gray", styles["name"]),
        Paragraph(safe(metadata["tagline"]), styles["tagline"]),
        Paragraph(" | ".join(part for part in contact_parts if part), styles["contact"]),
        HRFlowable(width="100%", thickness=0.7, color=rule, spaceAfter=6),
        Paragraph(safe(metadata["summary"]), styles["summary"]),
    ]

    story.append(Paragraph("Experience", styles["section"]))
    positions = sorted(
        experience.get("positions", []),
        key=lambda item: item.get("startDate", ""),
        reverse=True,
    )

    for position in positions:
        story.append(CondPageBreak(38 * mm))
        story.append(
            Paragraph(
                f'<b>{safe(position["role"])}</b> <font color="#526174">at '
                f'{safe(position["company"])}</font>',
                styles["role"],
            )
        )
        date_range = f'{format_month(position["startDate"])} - {format_month(position["endDate"])}'
        location = position.get("location")
        if location:
            date_range += f' | {clean(location)}'
        story.append(Paragraph(safe(date_range), styles["meta"]))
        story.append(Paragraph(safe(position.get("description", "")), styles["body"]))

        for highlight in position.get("highlights", []):
            story.append(Paragraph(safe(highlight), styles["bullet"], bulletText="-"))

        details = []
        if position.get("skills"):
            details.append("Skills: " + ", ".join(clean(value) for value in position["skills"]))
        if position.get("technologies"):
            details.append("Technologies: " + ", ".join(clean(value) for value in position["technologies"]))
        if details:
            story.append(Paragraph(safe(" | ".join(details)), styles["small"]))
        story.append(Spacer(1, 3.5 * mm))

    story.append(Paragraph("Skills", styles["section"]))

    for category in skills.get("categories", []):
        names = ", ".join(safe(item["name"]) for item in category.get("skills", []))
        story.append(
            Paragraph(f'<b>{safe(category["name"])}</b>: {names}', styles["body"])
        )

    story.append(Paragraph("Education & Professional Development", styles["section"]))

    for item in qualifications.get("education", []):
        story.append(Paragraph("Education", styles["subsection"]))
        story.append(
            Paragraph(
                f'<b>{safe(item["qualification"])}</b> - {safe(item["institution"])} '
                f'({safe(item["startYear"])}-{safe(item["endYear"])})',
                styles["body"],
            )
        )

    for item in qualifications.get("certifications", []):
        story.append(Paragraph("Certification", styles["subsection"]))
        detail = f'{safe(item["issuer"])} - Issued {safe(item["issued"])}'
        if item.get("status"):
            detail += f' - {safe(item["status"])}'
        topics = ", ".join(safe(topic) for topic in item.get("topics", []))
        story.append(Paragraph(f'<b>{safe(item["name"])}</b> - {detail}', styles["body"]))
        if topics:
            story.append(Paragraph(f'<b>Topics:</b> {topics}', styles["small"]))

    for item in qualifications.get("training", []):
        story.append(Paragraph("Training", styles["subsection"]))
        story.append(Paragraph(f'<b>{safe(item["name"])}</b>', styles["body"]))
        for course in item.get("courses", []):
            story.append(Paragraph(safe(course), styles["bullet"], bulletText="-"))

    document.build(story, onFirstPage=add_footer, onLaterPages=add_footer)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    build_pdf(args.output.resolve())
    print(args.output.resolve())


if __name__ == "__main__":
    main()
