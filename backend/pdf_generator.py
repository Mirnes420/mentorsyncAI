import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, ListFlowable, ListItem
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def generate_styled_cv(cv_data: dict) -> bytes:
    """
    Takes structured CV data (dict) and returns a stylized PDF as bytes.
    cv_data format:
    {
       "basics": {
           "name": "Jane Doe",
           "title": "Senior Software Engineer",
           "contact_info": "email@example.com | (555) 123-4567 | github.com/jane"
       },
       "summary": "Experienced engineer...",
       "skills": ["Python", "Docker", "AWS"],
       "experience": [
           {
               "company": "Tech Corp",
               "location": "Remote",
               "title": "Backend Engineer",
               "dates": "Jan 2020 - Present",
               "description": ["Did this", "Did that"]
           }
       ],
       "education": [
           {
               "institution": "University",
               "degree": "B.S. Computer Science",
               "dates": "2015-2019"
           }
       ]
    }
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom Styles
    name_style = ParagraphStyle(
        "NameStyle",
        parent=styles["Heading1"],
        fontSize=24,
        leading=28,
        alignment=TA_CENTER,
        spaceAfter=6,
        textColor="#1a365d" # A professional dark blue
    )
    
    title_style = ParagraphStyle(
        "JobTitleStyle",
        parent=styles["Normal"],
        fontSize=12,
        alignment=TA_CENTER,
        textColor="#4a5568",
        spaceAfter=6
    )

    contact_style = ParagraphStyle(
        "ContactStyle",
        parent=styles["Normal"],
        fontSize=10,
        alignment=TA_CENTER,
        textColor="#718096",
        spaceAfter=15
    )

    section_header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontSize=14,
        textColor="#2b6cb0",
        spaceBefore=15,
        spaceAfter=6,
        borderPadding=(0,0,2,0)
    )

    role_title_style = ParagraphStyle(
        "RoleTitle",
        parent=styles["Heading3"],
        fontSize=12,
        spaceBefore=8,
        spaceAfter=2
    )

    date_style = ParagraphStyle(
        "DateStyle",
        parent=styles["Normal"],
        fontSize=10,
        textColor="#718096",
        alignment=TA_LEFT,
        spaceAfter=4
    )
    
    body_text_style = ParagraphStyle(
        "BodyText",
        parent=styles["BodyText"],
        fontSize=10,
        leading=14
    )

    bullet_style = ParagraphStyle(
        "BulletText",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        leftIndent=15
    )

    story = []

    # 1. Header (Basics)
    basics = cv_data.get("basics", {})
    story.append(Paragraph(basics.get("name", "Name Not Provided").upper(), name_style))
    story.append(Paragraph(basics.get("title", ""), title_style))
    story.append(Paragraph(basics.get("contact_info", ""), contact_style))
    story.append(HRFlowable(width="100%", thickness=1, color="#e2e8f0", spaceAfter=15))

    # 2. Professional Summary
    summary = cv_data.get("summary", "")
    if summary:
        story.append(Paragraph("PROFESSIONAL SUMMARY", section_header_style))
        story.append(Paragraph(summary, body_text_style))
        story.append(Spacer(1, 10))

    # 3. Skills
    skills = cv_data.get("skills", [])
    if skills:
        story.append(Paragraph("TECHNICAL SKILLS", section_header_style))
        # Group skills into a comma-separated string for compactness, or a list
        skills_str = " • ".join(skills)
        story.append(Paragraph(skills_str, body_text_style))
        story.append(Spacer(1, 10))

    # 4. Experience
    experience = cv_data.get("experience", [])
    if experience:
        story.append(Paragraph("EXPERIENCE", section_header_style))
        for exp in experience:
            # Format: Title, Company - Location
            header_str = f"<b>{exp.get('title', '')}</b> | {exp.get('company', '')} - {exp.get('location', '')}"
            story.append(Paragraph(header_str, role_title_style))
            story.append(Paragraph(exp.get("dates", ""), date_style))
            
            # Bullet points
            bullets = exp.get("description", [])
            items = []
            for b in bullets:
                items.append(ListItem(Paragraph(b, bullet_style), bulletColor='black', bulletOffsetY=-2))
            
            if items:
                story.append(ListFlowable(items, bulletType='bullet', start='bulletchar', bulletFontSize=8))
            story.append(Spacer(1, 8))

    # 5. Education
    education = cv_data.get("education", [])
    if education:
        story.append(Paragraph("EDUCATION", section_header_style))
        for ed in education:
            header_str = f"<b>{ed.get('degree', '')}</b> | {ed.get('institution', '')}"
            story.append(Paragraph(header_str, role_title_style))
            story.append(Paragraph(ed.get("dates", ""), date_style))
            if ed.get("details"):
                story.append(Paragraph(ed.get("details", ""), body_text_style))
            story.append(Spacer(1, 4))

    # 6. Projects
    projects = cv_data.get("projects", [])
    if projects:
        story.append(Paragraph("PROJECTS", section_header_style))
        for proj in projects:
            name = proj.get("name", "")
            desc = proj.get("description", "")
            stack = proj.get("stack", [])
            url = proj.get("url", "")
            
            header_str = f"<b>{name}</b>"
            if url:
                header_str += f' — <a href="{url}" color="#2b6cb0">{url}</a>'
            story.append(Paragraph(header_str, role_title_style))
            
            if desc:
                story.append(Paragraph(desc, body_text_style))
            if stack:
                story.append(Paragraph(f"<i>Stack: {', '.join(stack)}</i>", date_style))
            story.append(Spacer(1, 6))

    # 7. Certifications
    certifications = cv_data.get("certifications", [])
    if certifications:
        story.append(Paragraph("CERTIFICATIONS", section_header_style))
        for cert in certifications:
            cert_str = f"<b>{cert.get('name', '')}</b>"
            if cert.get('issuer'):
                cert_str += f" — {cert.get('issuer')}"
            if cert.get('date'):
                cert_str += f" ({cert.get('date')})"
            story.append(Paragraph(cert_str, body_text_style))
            story.append(Spacer(1, 4))

    # 8. Languages
    languages = cv_data.get("languages", [])
    if languages:
        story.append(Paragraph("LANGUAGES", section_header_style))
        lang_parts = [f"{l.get('language', '')} ({l.get('level', '')})" for l in languages]
        story.append(Paragraph(" • ".join(lang_parts), body_text_style))

    # Build PDF
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
