from sqlalchemy.orm import Session
from .models import (
    CampusEventModel,
    PrepTaskModel,
    UserPreferenceModel,
    CampusNotificationModel,
)

def seed_all_demo_accounts(db: Session):
    """
    Seeds rich, isolated, fictional campus data for all three demo accounts:
    1. Demo 1 (Campus Explorer - Jordan Lee): Upcoming hackathons, talks, personal timeline, prep checklist
    2. Demo 2 (Event Organizer - Maya Patel): Organized events, logistics tasks, schedules, notifications
    3. Demo 3 (AI Feature Tester - Devon Brooks): AI-imported flyers, text extractions, OCR reviews, tasks
    """

    # =========================================================================
    # DEMO USER 1: Campus Explorer (Jordan Lee)
    # =========================================================================
    user_1_id = "demo_user_1"

    demo1_events = [
        CampusEventModel(
            id="evt_1",
            user_id=user_1_id,
            title="HackNova 2026: 36-Hour National Collegiate Hackathon",
            short_description="36 hours of intensive engineering, collaborative AI prototyping, and $15,000 in prizes.",
            full_description=(
                "Join 400+ top collegiate builders across the country for 36 hours of intense building, "
                "hacking, and learning. HackNova features three core tracks: Agentic AI Systems, "
                "Sustainable Urban Tech, and Decentralized Infrastructure. Free meals, sleeping pods, "
                "and hardware lab access provided throughout the weekend."
            ),
            category="Hackathon",
            organizer="Campus ACM & Google Developer Student Club",
            organizer_email="hacknova@campus.edu",
            banner_image="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-10-17",
            start_time="09:00 AM",
            end_date="2026-10-18",
            end_time="09:00 PM",
            venue="Student Innovation Center, Hall A & B",
            room="Hall A (Hardware) & Hall B (Hacking)",
            is_virtual=False,
            registration_status="registered",
            registration_deadline="2026-10-15",
            registration_fee="Free (Sponsored)",
            attendees_count=382,
            capacity=450,
            tags=["Hackathon", "AI", "Engineering", "Prizes", "36-Hour"],
            speakers=[
                {
                    "name": "Dr. Elena Rostova",
                    "role": "VP of AI Research",
                    "organization": "OpenFrontier AI",
                    "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
                },
                {
                    "name": "Marcus Vance",
                    "role": "Staff Distributed Systems Engineer",
                    "organization": "Anthropic Systems",
                    "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
                },
            ],
            schedule=[
                {"time": "09:00 AM", "title": "Check-in, Swag Distribution & Breakfast", "venue": "Grand Atrium"},
                {"time": "10:30 AM", "title": "Opening Ceremony & Keynote Address", "venue": "Main Auditorium"},
                {"time": "12:00 PM", "title": "Hacking Begins & Team Formation Mixer", "venue": "Hall B"},
                {"time": "07:00 PM", "title": "Dinner & Sponsor Tech Mentoring Tables", "venue": "Courtyard Terrace"},
                {"time": "12:00 PM (Sun)", "title": "Hacking Concludes & Project Submissions", "venue": "Devpost Portal"},
                {"time": "03:00 PM (Sun)", "title": "Live Demos, Judging & Closing Ceremony", "venue": "Main Auditorium"},
            ],
            checklist_tasks=[
                "Form team of 4 and register on Devpost",
                "Prepare personal laptop charger and Ethernet dongle",
                "Confirm flight/transit arrival for Saturday 8:00 AM",
            ],
            external_url="https://hacknova2026.campus.edu",
            is_featured=True,
        ),
        CampusEventModel(
            id="evt_2",
            user_id=user_1_id,
            title="Keynote: Foundations of Multi-Agent Systems in Production",
            short_description="Distinguished faculty lecture exploring autonomous agent collaboration and distributed reasoning.",
            full_description=(
                "The Department of Computer Science presents an evening lecture with leading researchers "
                "in multi-agent reinforcement learning. The lecture covers communication topologies, "
                "cooperative task planning under partial observability, and enterprise deployment pitfalls."
            ),
            category="Tech Talk",
            organizer="Department of Computer Science & AI Lab",
            organizer_email="ai-colloquium@campus.edu",
            banner_image="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-10-21",
            start_time="04:30 PM",
            end_date="2026-10-21",
            end_time="06:30 PM",
            venue="Gates Computer Science Hall",
            room="Hewlett Auditorium (Room 100)",
            is_virtual=False,
            registration_status="registered",
            registration_deadline="2026-10-19",
            registration_fee="Free",
            attendees_count=195,
            capacity=220,
            tags=["AI", "Multi-Agent", "Research", "Keynote", "Computer Science"],
            speakers=[
                {
                    "name": "Prof. Ashish Vaswani",
                    "role": "Distinguished Visiting Scholar",
                    "organization": "Essential AI",
                    "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
                }
            ],
            checklist_tasks=["Review arXiv survey paper on multi-agent collaboration"],
            external_url="https://cs.campus.edu/events/multi-agent-foundations",
            is_featured=True,
        ),
        CampusEventModel(
            id="evt_3",
            user_id=user_1_id,
            title="Stanford AI & Robotics Career Showcase 2026",
            short_description="Annual industry recruiting expo connecting students with 50+ cutting-edge robotics & AI engineering teams.",
            full_description=(
                "Connect with hiring managers and research engineers from leading autonomous driving, "
                "humanoid robotics, and foundation model companies. Features private 1-on-1 interview suites, "
                "resume critique clinics, and live humanoid hardware demonstrations."
            ),
            category="Career",
            organizer="School of Engineering Career Center",
            organizer_email="engineering-careers@campus.edu",
            banner_image="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-10-24",
            start_time="10:00 AM",
            end_date="2026-10-24",
            end_time="04:00 PM",
            venue="Arrillaga Alumni Center",
            room="Grand Ballroom & McCaw Hall",
            is_virtual=False,
            registration_status="attended",
            registration_deadline="2026-10-22",
            registration_fee="Free for current students",
            attendees_count=650,
            capacity=800,
            tags=["Career", "Robotics", "AI", "Internships", "Full-Time", "Networking"],
            checklist_tasks=["Print 15 copies of updated resume", "Prepare 60-second elevator pitch"],
            is_featured=False,
        ),
        CampusEventModel(
            id="evt_4",
            user_id=user_1_id,
            title="Hands-On Zero-Knowledge Proofs Workshop",
            short_description="3-hour intensive code workshop on Circom, Groth16 zk-SNARKs, and cryptographic verification.",
            full_description=(
                "Practical cryptographic engineering workshop for advanced undergraduates and graduates. "
                "Participants will write circuits in Circom, generate witness proofs with snarkjs, and verify "
                "succinct arguments on a local Ethereum node."
            ),
            category="Workshop",
            organizer="Applied Cryptography Club",
            banner_image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-10-28",
            start_time="02:00 PM",
            end_date="2026-10-28",
            end_time="05:30 PM",
            venue="Huang Engineering Center",
            room="Basement Lab 018",
            is_virtual=False,
            registration_status="waitlisted",
            registration_deadline="2026-10-26",
            registration_fee="Free",
            attendees_count=45,
            capacity=40,
            tags=["Cryptography", "Zero Knowledge", "Hands-on", "Security", "Workshop"],
            checklist_tasks=["Pre-install Node.js 20, Rust, and Circom CLI", "Clone repository template"],
            is_featured=False,
        ),
        CampusEventModel(
            id="evt_5",
            user_id=user_1_id,
            title="Campus SoundWaves: Indie Rock & Synthwave Showcase",
            short_description="Celebrate midterms completion with 6 live student bands, food trucks, and light show.",
            full_description=(
                "The Student Union Board presents an evening outdoor music festival featuring top student "
                "musical ensembles, local food trucks, and laser installations. Free entry for all students with university ID."
            ),
            category="Cultural",
            organizer="Stanford Concert Network & Student Union",
            banner_image="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-06",
            start_time="06:30 PM",
            end_date="2026-11-06",
            end_time="11:00 PM",
            venue="Frost Amphitheater",
            registration_status="registered",
            registration_deadline="2026-11-05",
            registration_fee="Free with Student ID",
            attendees_count=1150,
            capacity=1800,
            tags=["Music", "Social", "Nightlife", "Student Bands", "Weekend"],
            checklist_tasks=["Pick up physical wristband from Union Ticket Desk"],
            is_featured=False,
        ),
        CampusEventModel(
            id="evt_6",
            user_id=user_1_id,
            title="Quantum Computing Hardware Architectures",
            short_description="Deep technical session on superconducting qubits, cryogenic dilution refrigerators, and error mitigation.",
            full_description=(
                "Guest seminar featuring research scientists from IBM Quantum and Stanford Physics discussing "
                "state-of-the-transmon qubit fabrication and coherence times."
            ),
            category="Tech Talk",
            organizer="Stanford Quantum Club & Physics Department",
            banner_image="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-12",
            start_time="03:00 PM",
            end_date="2026-11-12",
            end_time="05:00 PM",
            venue="Varian Physics Building",
            room="Colloquium Room 108",
            registration_status="registered",
            registration_deadline="2026-11-10",
            registration_fee="Free",
            attendees_count=92,
            capacity=120,
            tags=["Quantum", "Hardware", "Physics", "Architecture"],
            checklist_tasks=["Read IBM Eagle processor architecture paper"],
            is_featured=False,
        ),
        CampusEventModel(
            id="evt_7",
            user_id=user_1_id,
            title="Stanford CleanTech & Mobility Innovation Forum",
            short_description="Annual forum featuring founders, venture investors, and research labs advancing grid-scale decarbonization.",
            full_description=(
                "Annual showcase bringing together climate venture capitalists, civil engineering startups, "
                "and university researchers developing sodium-ion batteries, electric aviation, and microgrid controls."
            ),
            category="Academic",
            organizer="Precourt Institute for Energy",
            banner_image="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-18",
            start_time="09:00 AM",
            end_date="2026-11-18",
            end_time="03:30 PM",
            venue="Tresidder Memorial Union",
            room="Oak Lounge",
            registration_status="not_registered",
            registration_deadline="2026-11-14",
            registration_fee="Free",
            attendees_count=240,
            capacity=300,
            tags=["CleanTech", "Sustainability", "Mobility", "Energy", "Forum"],
            is_featured=False,
        ),
        CampusEventModel(
            id="evt_8",
            user_id=user_1_id,
            title="Distributed Systems Reading Group: Paxos vs Raft",
            short_description="Bi-weekly roundtable breaking down consensus safety proofs and leader election edge cases.",
            full_description=(
                "Open student seminar focusing on Leslie Lamport's original Paxos paper and Diego Ongaro's Raft thesis. "
                "Pizza and whiteboarding provided."
            ),
            category="Tech Talk",
            organizer="Systems & Networking Lab",
            banner_image="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-25",
            start_time="05:30 PM",
            end_date="2026-11-25",
            end_time="07:00 PM",
            venue="Gates Computer Science Hall",
            room="Room 392",
            registration_status="not_registered",
            registration_deadline="2026-11-24",
            registration_fee="Free",
            attendees_count=35,
            capacity=50,
            tags=["Distributed Systems", "Consensus", "Networking", "Seminar"],
            is_featured=False,
        ),
    ]

    for evt in demo1_events:
        db.add(evt)

    demo1_tasks = [
        PrepTaskModel(
            id="tsk_1",
            user_id=user_1_id,
            event_id="evt_1",
            event_title="HackNova 2026: 36-Hour National Collegiate Hackathon",
            title="Form HackNova 4-person team & register on Devpost",
            description="Recruit frontend and ML teammates before Friday registration cutoff.",
            due_date="2026-10-15",
            due_time="11:59 PM",
            is_completed=False,
            priority="high",
            category="registration",
        ),
        PrepTaskModel(
            id="tsk_2",
            user_id=user_1_id,
            event_id="evt_1",
            event_title="HackNova 2026: 36-Hour National Collegiate Hackathon",
            title="Set up PyTorch 2.4 & CUDA 12 environment for Agentic track",
            description="Test GPU drivers on local dev workstation and verify Hugging Face token.",
            due_date="2026-10-16",
            due_time="06:00 PM",
            is_completed=True,
            priority="high",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_3",
            user_id=user_1_id,
            event_id="evt_2",
            event_title="Keynote: Foundations of Multi-Agent Systems in Production",
            title="Review Dr. Vaswani's 2025 Attention arXiv preprint",
            description="Read chapters 3 & 4 regarding sparse graph communication topologies.",
            due_date="2026-10-20",
            due_time="08:00 PM",
            is_completed=False,
            priority="medium",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_4",
            user_id=user_1_id,
            event_id="evt_3",
            event_title="Stanford AI & Robotics Career Showcase 2026",
            title="Print 15 copies of resume on heavy cardstock",
            description="Include recent Hackathon awards and distributed systems portfolio link.",
            due_date="2026-10-23",
            due_time="05:00 PM",
            is_completed=False,
            priority="high",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_5",
            user_id=user_1_id,
            event_id="evt_4",
            event_title="Hands-On Zero-Knowledge Proofs Workshop",
            title="Install Circom compiler and SnarkJS CLI",
            description="Verify rustc toolchain and build local proving key test.",
            due_date="2026-10-26",
            due_time="12:00 PM",
            is_completed=False,
            priority="medium",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_6",
            user_id=user_1_id,
            event_id="evt_5",
            event_title="Campus SoundWaves: Indie Rock & Synthwave Showcase",
            title="Reserve rehearsal room in Music Center",
            description="Book Room B-12 for pre-show soundcheck.",
            due_date="2026-11-04",
            due_time="04:00 PM",
            is_completed=True,
            priority="low",
            category="prep",
        ),
    ]

    for tsk in demo1_tasks:
        db.add(tsk)

    demo1_notifs = [
        CampusNotificationModel(
            id="notif_1",
            user_id=user_1_id,
            title="HackNova Registration Closing",
            message="Registration for HackNova 2026 closes in 48 hours. Confirm your team on Devpost.",
            timestamp="10 minutes ago",
            read=False,
            type="deadline",
            event_id="evt_1",
        ),
        CampusNotificationModel(
            id="notif_2",
            user_id=user_1_id,
            title="New Speaker Announced",
            message="Dr. Elena Rostova will deliver the opening keynote at HackNova 2026.",
            timestamp="2 hours ago",
            read=False,
            type="update",
            event_id="evt_1",
        ),
        CampusNotificationModel(
            id="notif_3",
            user_id=user_1_id,
            title="AI Recommendation",
            message="Based on your interest in Hackathons, you may like the upcoming Zero-Knowledge Workshop.",
            timestamp="Yesterday",
            read=True,
            type="ai",
            event_id="evt_4",
        ),
        CampusNotificationModel(
            id="notif_4",
            user_id=user_1_id,
            title="Resume Upload Reminder",
            message="Upload your PDF resume prior to the AI & Robotics Career Showcase.",
            timestamp="2 days ago",
            read=True,
            type="reminder",
            event_id="evt_3",
        ),
        CampusNotificationModel(
            id="notif_5",
            user_id=user_1_id,
            title="Room Assignment Confirmed",
            message="Zero-Knowledge Workshop has been assigned to Huang Basement Lab 018.",
            timestamp="3 days ago",
            read=True,
            type="update",
            event_id="evt_4",
        ),
    ]

    for notif in demo1_notifs:
        db.add(notif)

    # Preferences for demo1
    demo1_pref = UserPreferenceModel(
        id=user_1_id,
        theme="midnight-pulse",
        custom_accent=None,
        name="Jordan Lee",
        email="demo1@mycampus.demo",
        student_id="EXP-2026-1042",
        department="Computer Science & Interactive Media",
        year_of_study="2nd Year (Sophomore)",
        campus_name="Stanford Center for Technology & Arts",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        interests=["Hackathon", "Tech Talk", "Workshop", "Sports"],
        notification_settings={
            "email_reminders": True,
            "deadline_alerts": True,
            "ai_recommendations": True,
            "weekly_digest": False,
            "browser_push": True,
        },
        calendar_sync={
            "google": True,
            "apple": False,
            "outlook": False,
        },
    )
    db.add(demo1_pref)

    # Alias for legacy default
    legacy_pref = UserPreferenceModel(
        id="current_user",
        theme="midnight-pulse",
        custom_accent=None,
        name="Jordan Lee",
        email="demo1@mycampus.demo",
        student_id="EXP-2026-1042",
        department="Computer Science & Interactive Media",
        year_of_study="2nd Year (Sophomore)",
        campus_name="Stanford Center for Technology & Arts",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        interests=["Hackathon", "Tech Talk", "Workshop", "Sports"],
        notification_settings={
            "email_reminders": True,
            "deadline_alerts": True,
            "ai_recommendations": True,
            "weekly_digest": False,
            "browser_push": True,
        },
        calendar_sync={
            "google": True,
            "apple": False,
            "outlook": False,
        },
    )
    db.add(legacy_pref)


    # =========================================================================
    # DEMO USER 2: Event Organizer (Maya Patel)
    # =========================================================================
    user_2_id = "demo_user_2"

    demo2_events = [
        CampusEventModel(
            id="evt_org_1",
            user_id=user_2_id,
            title="Collegiate DevSprint 2026: Code for Impact",
            short_description="48-hour social impact coding sprint led by Maya Patel and campus ACM chapter.",
            full_description=(
                "An open hackathon bringing together students across engineering, design, and public policy "
                "to engineer open-source civic tools and environmental sensor dashboards. Organized by ACM Vice Chair Maya Patel."
            ),
            category="Hackathon",
            organizer="Maya Patel (ACM Lead Organizer)",
            organizer_email="maya.patel@campus.edu",
            banner_image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-10-24",
            start_time="08:30 AM",
            end_date="2026-10-25",
            end_time="08:00 PM",
            venue="Gates Computer Science Hall",
            room="Main Atrium & Collaboration Lab 102",
            is_virtual=False,
            registration_status="registered",
            registration_deadline="2026-10-22",
            registration_fee="Free",
            attendees_count=215,
            capacity=250,
            tags=["Organizer", "Hackathon", "Civic Tech", "ACM", "Social Impact"],
            checklist_tasks=[
                "Confirm keynote auditorium AV setup",
                "Finalize catering contract for 250 attendees",
                "Send speaker prep instructions",
            ],
            external_url="https://devsprint2026.campus.edu",
            is_featured=True,
        ),
        CampusEventModel(
            id="evt_org_2",
            user_id=user_2_id,
            title="Campus Robotics Expo & Drone Demonstration",
            short_description="Outdoor live flight arena, autonomous quadruped demos, and industry showcases.",
            full_description=(
                "Live outdoor demonstration day co-organized with the Autonomous Systems Lab. "
                "Featuring obstacle course navigation by autonomous aerial drones and open quadruped testing."
            ),
            category="Tech Talk",
            organizer="Robotics Club & Maya Patel",
            organizer_email="robotics-expo@campus.edu",
            banner_image="https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-10-29",
            start_time="01:00 PM",
            end_date="2026-10-29",
            end_time="05:30 PM",
            venue="Packard Engineering Quad",
            room="Outdoor Flight Arena & Demo Tent",
            is_virtual=False,
            registration_status="registered",
            registration_deadline="2026-10-27",
            registration_fee="Free",
            attendees_count=140,
            capacity=180,
            tags=["Robotics", "Drones", "Organizer", "Hardware", "Live Demo"],
            checklist_tasks=["Inspect outdoor arena flight netting and safety perimeter"],
            is_featured=True,
        ),
        CampusEventModel(
            id="evt_org_3",
            user_id=user_2_id,
            title="UI/UX Design Systems Masterclass: From Figma to Token Pipeline",
            short_description="Hands-on design systems architecture workshop featuring industry design directors.",
            full_description=(
                "Interactive masterclass on creating robust semantic design tokens, variable components, "
                "and automated GitHub sync pipelines for unified web and mobile applications."
            ),
            category="Workshop",
            organizer="Design & Code Society (Maya Patel, Advisor)",
            organizer_email="designsystems@campus.edu",
            banner_image="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-05",
            start_time="03:00 PM",
            end_date="2026-11-05",
            end_time="06:00 PM",
            venue="Art & Architecture Center",
            room="Studio 201",
            is_virtual=False,
            registration_status="registered",
            registration_deadline="2026-11-03",
            registration_fee="Free",
            attendees_count=85,
            capacity=100,
            tags=["Design", "Figma", "UI/UX", "Design Systems", "Workshop"],
            is_featured=False,
        ),
        CampusEventModel(
            id="evt_org_4",
            user_id=user_2_id,
            title="Annual Student Startup Pitch Showcase & Venture Mixer",
            short_description="12 student ventures pitch to top Bay Area seed investors for $50,000 non-dilutive grants.",
            full_description=(
                "Premier annual entrepreneurship gala showcasing student-founded companies in deep tech, "
                "climate, and digital health. Includes catered networking dinner and angel investor panel."
            ),
            category="Career",
            organizer="Campus Venture Alliance",
            organizer_email="pitchday@campus.edu",
            banner_image="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-12",
            start_time="05:00 PM",
            end_date="2026-11-12",
            end_time="09:30 PM",
            venue="Graduate School of Business Auditorium",
            room="CEMEX Auditorium",
            is_virtual=False,
            registration_status="registered",
            registration_deadline="2026-11-09",
            registration_fee="Free",
            attendees_count=320,
            capacity=350,
            tags=["Startups", "Venture", "Pitching", "Networking", "Grants"],
            is_featured=False,
        ),
        CampusEventModel(
            id="evt_org_5",
            user_id=user_2_id,
            title="Cloud Native Kubernetes Hands-On Production Bootcamp",
            short_description="Container orchestration, Helm deployments, and cluster observability workshop.",
            full_description=(
                "Intensive 4-hour technical bootcamp covering multi-cluster ingress, GitOps with ArgoCD, "
                "and distributed Prometheus tracing for student engineering projects."
            ),
            category="Workshop",
            organizer="Systems & Infrastructure Club",
            organizer_email="k8s-bootcamp@campus.edu",
            banner_image="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-18",
            start_time="01:30 PM",
            end_date="2026-11-18",
            end_time="05:30 PM",
            venue="Turing Memorial Computing Center",
            room="Lab B03",
            is_virtual=False,
            registration_status="waitlisted",
            registration_deadline="2026-11-16",
            registration_fee="Free",
            attendees_count=60,
            capacity=60,
            tags=["Cloud", "Kubernetes", "DevOps", "Infrastructure"],
            is_featured=False,
        ),
    ]

    for evt in demo2_events:
        db.add(evt)

    demo2_tasks = [
        PrepTaskModel(
            id="tsk_org_1",
            user_id=user_2_id,
            event_id="evt_org_1",
            event_title="Collegiate DevSprint 2026: Code for Impact",
            title="Confirm keynote auditorium AV setup & projector aspect ratio",
            description="Verify HDMI matrix, wireless microphones, and livestream encoder test.",
            due_date="2026-10-22",
            due_time="04:00 PM",
            is_completed=False,
            priority="high",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_org_2",
            user_id=user_2_id,
            event_id="evt_org_1",
            event_title="Collegiate DevSprint 2026: Code for Impact",
            title="Finalize catering contract and dietary orders for 250 attendees",
            description="Signed agreement with Green Leaf Catering for lunch & dinner buffet.",
            due_date="2026-10-23",
            due_time="11:00 AM",
            is_completed=True,
            priority="high",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_org_3",
            user_id=user_2_id,
            event_id="evt_org_1",
            event_title="Collegiate DevSprint 2026: Code for Impact",
            title="Send speaker tech check instructions & mic timetable",
            description="Email slide submission deadline and stage arrival times to guest panelists.",
            due_date="2026-10-23",
            due_time="05:00 PM",
            is_completed=False,
            priority="medium",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_org_4",
            user_id=user_2_id,
            event_id="evt_org_2",
            event_title="Campus Robotics Expo & Drone Demonstration",
            title="Distribute volunteer shift schedules for check-in desks",
            description="Coordinate 12 student volunteers across 3 four-hour registration shifts.",
            due_date="2026-10-27",
            due_time="02:00 PM",
            is_completed=False,
            priority="high",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_org_5",
            user_id=user_2_id,
            event_id="evt_org_2",
            event_title="Campus Robotics Expo & Drone Demonstration",
            title="Print sponsor banner badges and directional signage",
            description="Collect heavy vinyl banners from campus print depot.",
            due_date="2026-10-28",
            due_time="12:00 PM",
            is_completed=True,
            priority="medium",
            category="prep",
        ),
    ]

    for tsk in demo2_tasks:
        db.add(tsk)

    demo2_notifs = [
        CampusNotificationModel(
            id="notif_org_1",
            user_id=user_2_id,
            title="Auditorium Booking Confirmed",
            message="Gates CS Hall Atrium booking approved for Collegiate DevSprint 2026.",
            timestamp="15 minutes ago",
            read=False,
            type="update",
            event_id="evt_org_1",
        ),
        CampusNotificationModel(
            id="notif_org_2",
            user_id=user_2_id,
            title="Keynote Speaker Tech Check Scheduled",
            message="Dr. Elena Rostova accepted the pre-event AV walkthrough schedule.",
            timestamp="1 hour ago",
            read=False,
            type="update",
            event_id="evt_org_1",
        ),
        CampusNotificationModel(
            id="notif_org_3",
            user_id=user_2_id,
            title="Sponsorship Contract Signed",
            message="Frontier Cloud Labs confirmed platinum sponsorship grant for prize pool.",
            timestamp="Yesterday",
            read=True,
            type="reminder",
            event_id="evt_org_1",
        ),
        CampusNotificationModel(
            id="notif_org_4",
            user_id=user_2_id,
            title="Volunteer Staffing Complete",
            message="12 student volunteers have confirmed check-in table shift availability.",
            timestamp="3 days ago",
            read=True,
            type="update",
            event_id="evt_org_2",
        ),
    ]

    for notif in demo2_notifs:
        db.add(notif)

    # Preferences for demo2
    demo2_pref = UserPreferenceModel(
        id=user_2_id,
        theme="cyber-slate",
        custom_accent="#C6FF3D",
        name="Maya Patel",
        email="demo2@mycampus.demo",
        student_id="ORG-2026-4481",
        department="Software Systems & Management",
        year_of_study="3rd Year (Junior)",
        campus_name="Stanford Center for Technology & Arts",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
        interests=["Tech Talk", "Workshop", "Career", "Academic"],
        notification_settings={
            "email_reminders": True,
            "deadline_alerts": True,
            "ai_recommendations": False,
            "weekly_digest": True,
            "browser_push": True,
        },
        calendar_sync={
            "google": True,
            "apple": True,
            "outlook": False,
        },
    )
    db.add(demo2_pref)


    # =========================================================================
    # DEMO USER 3: AI Feature Tester (Devon Brooks)
    # =========================================================================
    user_3_id = "demo_user_3"

    demo3_events = [
        CampusEventModel(
            id="evt_ai_1",
            user_id=user_3_id,
            title="Autonomous Drone Grand Prix & AI Vision Challenge",
            short_description="[AI Vision Imported] Multimodal flyer parsed with 94% confidence score.",
            full_description=(
                "Annual autonomous flight sprint where collegiate quadcopters run real-time YOLOv11 "
                "edge inference to maneuver through dynamic ring obstacle courses. Extracted seamlessly "
                "from high-resolution flyer poster via Gemini Vision."
            ),
            category="Hackathon",
            organizer="Autonomous Systems Lab & Vision AI Guild",
            organizer_email="dronegp@campus.edu",
            banner_image="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-10-27",
            start_time="10:00 AM",
            end_date="2026-10-27",
            end_time="06:00 PM",
            venue="Outdoor Flight Arena, North Campus",
            room="Arena Flight Cage A",
            is_virtual=False,
            registration_status="registered",
            registration_deadline="2026-10-25",
            registration_fee="Free",
            attendees_count=120,
            capacity=150,
            tags=["AI Vision", "Drones", "OCR-Extracted", "Hackathon", "Robotics"],
            checklist_tasks=[
                "Verify camera focal calibration on edge drone kit",
                "Review flight safety boundary parameters",
            ],
            external_url="https://dronegp.campus.edu",
            is_featured=True,
        ),
        CampusEventModel(
            id="evt_ai_2",
            user_id=user_3_id,
            title="Quantum Machine Learning & Parameterized Circuits",
            short_description="[AI Text Extracted] Announcement text parsed from department memo.",
            full_description=(
                "Distinguished academic colloquium exploring variational quantum eigensolvers (VQE) "
                "and barren plateau mitigation techniques in parameterized quantum circuits. "
                "Directly extracted from raw email announcement text."
            ),
            category="Tech Talk",
            organizer="Quantum Information Science Group",
            organizer_email="qml-colloquium@campus.edu",
            banner_image="https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-03",
            start_time="03:30 PM",
            end_date="2026-11-03",
            end_time="05:30 PM",
            venue="Varian Physics Hall",
            room="Colloquium Room 108",
            is_virtual=False,
            registration_status="registered",
            registration_deadline="2026-11-01",
            registration_fee="Free",
            attendees_count=78,
            capacity=90,
            tags=["Quantum", "Colloquium", "AI-Imported", "ML", "Physics"],
            checklist_tasks=["Read Qiskit circuit optimization guide"],
            external_url="https://qml.campus.edu",
            is_featured=True,
        ),
        CampusEventModel(
            id="evt_ai_3",
            user_id=user_3_id,
            title="Generative AI Safety & Verifiable Alignment Roundtable",
            short_description="[AI Import] Parsed with uncertain registration deadline warning.",
            full_description=(
                "Faculty and student roundtable discussing constitutional AI, mechanistic interpretability, "
                "and automated red-teaming. Notice: Missing registration deadline was accurately flagged "
                "by the AI extractor rather than fabricated."
            ),
            category="Academic",
            organizer="Center for AI Safety & Alignment",
            organizer_email="safety-roundtable@campus.edu",
            banner_image="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-10",
            start_time="04:00 PM",
            end_date="2026-11-10",
            end_time="06:30 PM",
            venue="Ethics & Technology Institute",
            room="Seminar Hall C",
            is_virtual=False,
            registration_status="waitlisted",
            registration_deadline="2026-11-08",
            registration_fee="Free",
            attendees_count=45,
            capacity=50,
            tags=["AI Safety", "Roundtable", "Interpretability", "Academic"],
            is_featured=False,
        ),
        CampusEventModel(
            id="evt_ai_4",
            user_id=user_3_id,
            title="Collegiate Agent Hackathon 2026: Multi-Model Swarms",
            short_description="[AI Extraction] Extracted from collegiate hackathon promotional flyer.",
            full_description=(
                "Collegiate hackathon challenging teams to build real-world autonomous agent swarms "
                "handling research synthesis, code review, and hardware orchestration. Full schedule "
                "and checklist extracted automatically."
            ),
            category="Hackathon",
            organizer="Agentic AI Guild",
            organizer_email="agenthack@campus.edu",
            banner_image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
            start_date="2026-11-16",
            start_time="09:00 AM",
            end_date="2026-11-17",
            end_time="07:00 PM",
            venue="Huang Engineering Center",
            room="Mackenzie Room & Terrace",
            is_virtual=False,
            registration_status="registered",
            registration_deadline="2026-11-14",
            registration_fee="Free",
            attendees_count=190,
            capacity=200,
            tags=["Agentic", "Hackathon", "AI", "Swarms"],
            checklist_tasks=["Prepare Gemini API key in local environment"],
            is_featured=False,
        ),
    ]

    for evt in demo3_events:
        db.add(evt)

    demo3_tasks = [
        PrepTaskModel(
            id="tsk_ai_1",
            user_id=user_3_id,
            event_id="evt_ai_1",
            event_title="Autonomous Drone Grand Prix & AI Vision Challenge",
            title="Inspect extracted venue and room numbers from Drone Grand Prix flyer",
            description="Verify OCR extraction of outdoor arena boundary and safety netting.",
            due_date="2026-10-25",
            due_time="02:00 PM",
            is_completed=False,
            priority="high",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_ai_2",
            user_id=user_3_id,
            event_id="evt_ai_2",
            event_title="Quantum Machine Learning & Parameterized Circuits",
            title="Verify confidence scores and missing fields for Quantum Colloquium",
            description="Review extraction breakdown: 98% confidence score across all fields.",
            due_date="2026-10-28",
            due_time="06:00 PM",
            is_completed=True,
            priority="medium",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_ai_3",
            user_id=user_3_id,
            event_id="evt_ai_3",
            event_title="Generative AI Safety & Verifiable Alignment Roundtable",
            title="Review suggested preparation tasks generated by Gemini Vision",
            description="Check suggested tasks for pre-reading safety papers and discussion points.",
            due_date="2026-11-01",
            due_time="04:00 PM",
            is_completed=False,
            priority="high",
            category="prep",
        ),
        PrepTaskModel(
            id="tsk_ai_4",
            user_id=user_3_id,
            event_id="evt_ai_4",
            event_title="Collegiate Agent Hackathon 2026: Multi-Model Swarms",
            title="Calibrate test prompts for poster OCR resolution tests",
            description="Run multimodal flyer parsing on 5 sample campus event posters.",
            due_date="2026-11-05",
            due_time="08:00 PM",
            is_completed=False,
            priority="low",
            category="prep",
        ),
    ]

    for tsk in demo3_tasks:
        db.add(tsk)

    demo3_notifs = [
        CampusNotificationModel(
            id="notif_ai_1",
            user_id=user_3_id,
            title="AI Extraction Completed",
            message="Drone Grand Prix flyer poster successfully parsed with 94% confidence.",
            timestamp="10 minutes ago",
            read=False,
            type="ai",
            event_id="evt_ai_1",
        ),
        CampusNotificationModel(
            id="notif_ai_2",
            user_id=user_3_id,
            title="Missing Field Alert Flagged",
            message="AI Extractor accurately detected missing deadline without hallucination.",
            timestamp="2 hours ago",
            read=False,
            type="deadline",
            event_id="evt_ai_3",
        ),
        CampusNotificationModel(
            id="notif_ai_3",
            user_id=user_3_id,
            title="Gemini Multimodal Vision Active",
            message="Google Gemini 2.5 Flash active and ready for text and image parsing.",
            timestamp="Yesterday",
            read=True,
            type="update",
            event_id="evt_ai_2",
        ),
    ]

    for notif in demo3_notifs:
        db.add(notif)

    # Preferences for demo3
    demo3_pref = UserPreferenceModel(
        id=user_3_id,
        theme="emerald-terminal",
        custom_accent="#C6FF3D",
        name="Devon Brooks",
        email="demo3@mycampus.demo",
        student_id="AI-2026-9901",
        department="Artificial Intelligence & Data Systems",
        year_of_study="4th Year (Senior)",
        campus_name="Stanford Center for Technology & Arts",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        interests=["Hackathon", "Tech Talk", "Academic"],
        notification_settings={
            "email_reminders": True,
            "deadline_alerts": True,
            "ai_recommendations": True,
            "weekly_digest": True,
            "browser_push": True,
        },
        calendar_sync={
            "google": True,
            "apple": False,
            "outlook": False,
        },
    )
    db.add(demo3_pref)

    db.commit()


def seed_database_if_empty(db: Session):
    """
    Checks if database is populated. If empty or missing demo accounts, seeds initial data.
    """
    existing_events_count = db.query(CampusEventModel).count()
    if existing_events_count == 0:
        seed_all_demo_accounts(db)


def reset_all_demo_data(db: Session):
    """
    Cleans all existing event, task, notification, and preference rows
    and repopulates the clean sample data for all 3 demo accounts.
    """
    db.query(PrepTaskModel).delete()
    db.query(CampusNotificationModel).delete()
    db.query(CampusEventModel).delete()
    db.query(UserPreferenceModel).delete()
    db.commit()
    seed_all_demo_accounts(db)
