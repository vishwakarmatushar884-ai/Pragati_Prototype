package gov.pragati.service;

import gov.pragati.entity.*;
import gov.pragati.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DataSeedService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeedService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final FinancialRecordRepository financialRepository;
    private final IssueRepository issueRepository;
    private final IssueCommentRepository issueCommentRepository;
    private final AlertRepository alertRepository;
    private final EscalationHistoryRepository escalationHistoryRepository;
    private final AnomalyRepository anomalyRepository;
    private final RiskThresholdRepository thresholdRepository;
    private final SystemSettingRepository settingRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeedService(UserRepository userRepository,
                           RoleRepository roleRepository,
                           ProjectRepository projectRepository,
                           MilestoneRepository milestoneRepository,
                           FinancialRecordRepository financialRepository,
                           IssueRepository issueRepository,
                           IssueCommentRepository issueCommentRepository,
                           AlertRepository alertRepository,
                           EscalationHistoryRepository escalationHistoryRepository,
                           AnomalyRepository anomalyRepository,
                           RiskThresholdRepository thresholdRepository,
                           SystemSettingRepository settingRepository,
                           NotificationRepository notificationRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.projectRepository = projectRepository;
        this.milestoneRepository = milestoneRepository;
        this.financialRepository = financialRepository;
        this.issueRepository = issueRepository;
        this.issueCommentRepository = issueCommentRepository;
        this.alertRepository = alertRepository;
        this.escalationHistoryRepository = escalationHistoryRepository;
        this.anomalyRepository = anomalyRepository;
        this.thresholdRepository = thresholdRepository;
        this.settingRepository = settingRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (roleRepository.count() > 0 && projectRepository.count() > 0) {
            log.info("Database already seeded with demo projects and accounts.");
            return;
        }

        log.info("Seeding PRAGATI demo database with Government of India project data...");
        seedRoles();
        seedUsers();
        seedSettingsAndThresholds();
        seedProjectsAndRelatedData();
        log.info("Database seeding complete: 20+ realistic infrastructure projects ready for National demo.");
    }

    private void seedRoles() {
        for (RoleName rn : RoleName.values()) {
            if (roleRepository.findByName(rn).isEmpty()) {
                roleRepository.save(new Role(rn, "Role for " + rn.name()));
            }
        }
    }

    private void seedUsers() {
        String encodedPassword = passwordEncoder.encode("Demo@123");

        createUserIfNotExists("admin@pragati.demo", encodedPassword, "Shri Rajesh Verma, IAS", "Chief Project Monitoring Officer", "Cabinet Secretariat", "PMO Project Monitoring Group", RoleName.SUPER_ADMIN);
        createUserIfNotExists("ministry@pragati.demo", encodedPassword, "Dr. Sunita Deshmukh", "Joint Secretary (Infrastructure)", "Ministry of Road Transport and Highways", "Highway Development Wing", RoleName.MINISTRY_ADMIN);
        createUserIfNotExists("manager@pragati.demo", encodedPassword, "Vikramaditya Rao", "Chief General Manager & Project Director", "Ministry of Road Transport and Highways", "National Highways Authority of India (NHAI)", RoleName.PROJECT_MANAGER);
        createUserIfNotExists("field@pragati.demo", encodedPassword, "Ananya Sharma", "Senior Resident Field Engineer", "Ministry of Jal Shakti", "Field Operations Directorate MP", RoleName.FIELD_OFFICER);
        createUserIfNotExists("auditor@pragati.demo", encodedPassword, "K. S. Narayanan", "Principal Director of Audit", "Comptroller and Auditor General of India", "Infrastructure Audit Cell", RoleName.AUDITOR);
        createUserIfNotExists("viewer@pragati.demo", encodedPassword, "Public Observer / Stakeholder", "Project Evaluation Analyst", "NITI Aayog", "Development Monitoring Division", RoleName.VIEWER);
    }

    private void createUserIfNotExists(String email, String password, String name, String desig, String min, String dept, RoleName roleName) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User(email, password, name, desig, min, dept);
            Role role = roleRepository.findByName(roleName).orElseThrow();
            user.setRoles(Set.of(role));
            userRepository.save(user);
        }
    }

    private void seedSettingsAndThresholds() {
        if (thresholdRepository.count() == 0) {
            thresholdRepository.save(new RiskThreshold("LOW", 0.95, 2.0, 0.95, 2.0, 80, 100, "Healthy project metrics"));
            thresholdRepository.save(new RiskThreshold("MEDIUM", 0.85, 0.95, 0.85, 0.95, 60, 79, "Moderate slippage requiring watch"));
            thresholdRepository.save(new RiskThreshold("HIGH", 0.75, 0.85, 0.75, 0.85, 40, 59, "High risk demanding intervention"));
            thresholdRepository.save(new RiskThreshold("CRITICAL", 0.0, 0.75, 0.0, 0.75, 0, 39, "Critical failure or escalation trigger"));
        }

        if (settingRepository.count() == 0) {
            settingRepository.save(new SystemSetting("weight_schedule", "30", "Schedule performance weighting percentage", "HEALTH_WEIGHTS"));
            settingRepository.save(new SystemSetting("weight_cost", "25", "Cost performance weighting percentage", "HEALTH_WEIGHTS"));
            settingRepository.save(new SystemSetting("weight_milestone", "20", "Milestone delivery weighting percentage", "HEALTH_WEIGHTS"));
            settingRepository.save(new SystemSetting("weight_issues", "15", "Issue severity impact weighting percentage", "HEALTH_WEIGHTS"));
            settingRepository.save(new SystemSetting("weight_regularity", "10", "Update regularity weighting percentage", "HEALTH_WEIGHTS"));

            settingRepository.save(new SystemSetting("escalation_level1_minutes", "5", "Demo Minutes for Level 1 auto-escalation", "ESCALATION"));
            settingRepository.save(new SystemSetting("escalation_level2_minutes", "10", "Demo Minutes for Level 2 auto-escalation", "ESCALATION"));
            settingRepository.save(new SystemSetting("stale_update_days", "14", "Days before progress update is flagged stale", "ALERTS"));
            settingRepository.save(new SystemSetting("cost_overrun_pct_threshold", "10", "Cost overrun percentage triggering alerts", "ALERTS"));
        }
    }

    private void seedProjectsAndRelatedData() {
        // We seed 20 projects: 5 LOW, 5 MEDIUM, 5 HIGH, 5 CRITICAL
        List<ProjectSeedData> seeds = getProjectSeedList();

        for (ProjectSeedData data : seeds) {
            Project p = new Project();
            p.setProjectCode(data.code);
            p.setProjectName(data.name);
            p.setMinistry(data.ministry);
            p.setDepartment(data.department);
            p.setScheme(data.scheme);
            p.setSector(data.sector);
            p.setProjectDescription(data.description);
            p.setProjectManager(data.manager);
            p.setImplementingAgency(data.agency);
            p.setContractor(data.contractor);
            p.setState(data.state);
            p.setDistrict(data.district);
            p.setLocation(data.location);
            p.setLatitude(data.lat);
            p.setLongitude(data.lng);
            p.setStartDate(data.startDate);
            p.setPlannedEndDate(data.plannedEndDate);
            p.setProjectBudget(data.budget);
            p.setApprovedCost(data.budget);
            p.setPlannedCost(data.plannedCost);
            p.setActualCost(data.actualCost);
            p.setEarnedValue(data.earnedValue);
            p.setPhysicalProgress(data.physicalProgress);
            p.setPlannedProgress(data.plannedProgress);
            p.setFinancialProgress(data.financialProgress);
            p.setSpi(data.spi);
            p.setCpi(data.cpi);
            p.setScheduleVariance(data.sv);
            p.setCostVariance(data.cv);
            p.setCurrentStatus(data.status);
            if ("COMPLETED".equalsIgnoreCase(data.status)) {
                p.setActualCompletionDate(LocalDate.of(2024, 11, 20));
            }
            p.setPriority(data.priority);
            p.setRiskLevel(data.riskLevel);
            p.setHealthScore(data.healthScore);
            p.setAiRiskProbability(data.aiRiskProb);
            p.setAiPredictedDelayDays(data.aiDelayDays);
            p.setAiExplanationSummary(data.aiExplanation);
            p.setLastUpdated(LocalDateTime.now().minusDays(data.daysSinceUpdate));

            Project savedProject = projectRepository.save(p);

            // Add Milestones
            seedMilestones(savedProject, data);

            // Add Financial Records
            seedFinancialRecords(savedProject, data);

            // Add Issues if applicable
            seedIssues(savedProject, data);

            // Add Anomalies if applicable
            seedAnomalies(savedProject, data);

            // Add Alerts if applicable
            seedAlerts(savedProject, data);
        }

        // Add demo audit logs & notifications
        seedAuditLogsAndNotifications();
    }

    private void seedMilestones(Project p, ProjectSeedData d) {
        Milestone m1 = new Milestone();
        m1.setProject(p);
        m1.setName("Phase I: Land Acquisition & Environmental Clearance");
        m1.setDescription("Complete survey, land compensation, and statutory clearance");
        m1.setPlannedStartDate(p.getStartDate());
        m1.setPlannedEndDate(p.getStartDate().plusMonths(4));
        m1.setActualStartDate(p.getStartDate());
        m1.setActualEndDate(p.getStartDate().plusMonths(4));
        m1.setWeightagePercentage(25.0);
        m1.setPlannedProgress(100.0);
        m1.setActualProgress(100.0);
        m1.setStatus(MilestoneStatus.COMPLETED);
        m1.setResponsibleOfficer(p.getProjectManager());
        m1.setOverdue(false);
        milestoneRepository.save(m1);

        Milestone m2 = new Milestone();
        m2.setProject(p);
        m2.setName("Phase II: Core Civil Works & Structural Erection");
        m2.setDescription("Foundations, substructure, earthworks and major civil erection");
        m2.setPlannedStartDate(p.getStartDate().plusMonths(4));
        m2.setPlannedEndDate(p.getStartDate().plusMonths(12));
        m2.setActualStartDate(p.getStartDate().plusMonths(4));
        m2.setWeightagePercentage(45.0);
        m2.setPlannedProgress(d.plannedProgress);
        m2.setActualProgress(d.physicalProgress);
        m2.setStatus(d.physicalProgress >= 100 ? MilestoneStatus.COMPLETED : (d.spi < 0.85 ? MilestoneStatus.DELAYED : MilestoneStatus.IN_PROGRESS));
        m2.setResponsibleOfficer(p.getProjectManager());
        m2.setOverdue(d.spi < 0.85 && m2.getPlannedEndDate().isBefore(LocalDate.now()));
        milestoneRepository.save(m2);

        Milestone m3 = new Milestone();
        m3.setProject(p);
        m3.setName("Phase III: Equipment Commissioning & Handover");
        m3.setDescription("Integration testing, trial runs, safety audit, and final commissioning");
        m3.setPlannedStartDate(p.getStartDate().plusMonths(12));
        m3.setPlannedEndDate(p.getPlannedEndDate());
        m3.setWeightagePercentage(30.0);
        m3.setPlannedProgress(Math.max(0, d.plannedProgress - 70));
        m3.setActualProgress(Math.max(0, d.physicalProgress - 70));
        m3.setStatus(d.physicalProgress >= 100 ? MilestoneStatus.COMPLETED : MilestoneStatus.NOT_STARTED);
        m3.setResponsibleOfficer(p.getProjectManager());
        m3.setOverdue(d.riskLevel.equals("CRITICAL") && m3.getPlannedEndDate().isBefore(LocalDate.now().plusMonths(2)));
        milestoneRepository.save(m3);
    }

    private void seedFinancialRecords(Project p, ProjectSeedData d) {
        String[] months = {"2024-04", "2024-06", "2024-08", "2024-10", "2024-12", "2025-02"};
        double cumulative = 0.0;
        double stepSpend = d.actualCost / months.length;
        double stepPlan = d.plannedCost / months.length;

        for (int i = 0; i < months.length; i++) {
            FinancialRecord f = new FinancialRecord();
            f.setProject(p);
            f.setFiscalYear("2024-25");
            f.setRecordMonth(months[i]);
            f.setPlannedExpenditure(Math.round(stepPlan * (i + 1) * 10.0) / 10.0);
            f.setActualExpenditure(Math.round(stepSpend * 10.0) / 10.0);
            cumulative += f.getActualExpenditure();
            f.setCumulativeExpenditure(Math.round(cumulative * 10.0) / 10.0);
            f.setCostVariance(Math.round((f.getPlannedExpenditure() - cumulative) * 10.0) / 10.0);
            f.setCpiAtRecord(d.cpi);
            f.setRecordedBy("Accounts Officer");
            f.setRemarks("Quarterly milestone fund disbursement tranche #" + (i + 1));
            financialRepository.save(f);
        }
    }

    private void seedIssues(Project p, ProjectSeedData d) {
        if ("HIGH".equals(d.riskLevel) || "CRITICAL".equals(d.riskLevel)) {
            Issue i1 = new Issue();
            i1.setProject(p);
            i1.setTitle("Delay in Forest & Wildlife Clearance for Section 3");
            i1.setDescription("State Forest Department clearance pending for 14.2 km stretch causing contractor demobilization risk.");
            i1.setCategory(IssueCategory.ENVIRONMENT);
            i1.setPriority("CRITICAL".equals(d.riskLevel) ? IssuePriority.CRITICAL : IssuePriority.HIGH);
            i1.setStatus(IssueStatus.OPEN);
            i1.setAssignedTo(p.getProjectManager());
            i1.setReportedBy("Ananya Sharma, Field Officer");
            i1.setDueDate(LocalDate.now().plusDays(15));
            i1.setActionRequired("High-level inter-departmental joint inspection and fast-track diversion proposal.");
            Issue savedIssue = issueRepository.save(i1);

            IssueComment c1 = new IssueComment(savedIssue, "Shri Rajesh Verma, IAS", "SUPER_ADMIN", "Escalated to Chief Secretary MP in weekly infrastructure review.");
            issueCommentRepository.save(c1);
        }

        if ("MEDIUM".equals(d.riskLevel) || "HIGH".equals(d.riskLevel)) {
            Issue i2 = new Issue();
            i2.setProject(p);
            i2.setTitle("Right of Way (RoW) utility relocation delay");
            i2.setDescription("High-tension electricity transmission line relocation awaiting power grid shutdown window.");
            i2.setCategory(IssueCategory.TECHNICAL);
            i2.setPriority(IssuePriority.MEDIUM);
            i2.setStatus(IssueStatus.IN_PROGRESS);
            i2.setAssignedTo("Vikramaditya Rao");
            i2.setReportedBy("Field Engineer");
            i2.setDueDate(LocalDate.now().plusDays(30));
            i2.setActionRequired("Coordinate 48-hour scheduled power outage with State Transmission Corp.");
            issueRepository.save(i2);
        }
    }

    private void seedAnomalies(Project p, ProjectSeedData d) {
        if ("CRITICAL".equals(d.riskLevel)) {
            Anomaly a1 = new Anomaly(
                    p,
                    "FINANCIAL_EXCEEDS_PHYSICAL",
                    String.format("Financial disbursement (%.1f%%) is significantly ahead of on-site physical progress (%.1f%%) with a %.1f%% divergence.",
                            d.financialProgress, d.physicalProgress, d.financialProgress - d.physicalProgress),
                    AnomalySeverity.HIGH
            );
            anomalyRepository.save(a1);

            if (d.actualCost > d.budget) {
                Anomaly a2 = new Anomaly(
                        p,
                        "BUDGET_OVERRUN",
                        String.format("Actual expenditure (₹%.2f Cr) has exceeded total approved budget allocation of ₹%.2f Cr.", d.actualCost, d.budget),
                        AnomalySeverity.CRITICAL
                );
                anomalyRepository.save(a2);
            }
        }
    }

    private void seedAlerts(Project p, ProjectSeedData d) {
        if ("CRITICAL".equals(d.riskLevel)) {
            Alert a = new Alert(
                    p,
                    "CRITICAL_SCHEDULE_COLLAPSE",
                    AlertSeverity.CRITICAL,
                    String.format("Severe schedule slippage on %s (SPI = %.2f, Delay = +%.0f days). Immediate executive unblocking required.",
                            p.getProjectName(), d.spi, d.aiDelayDays),
                    p.getProjectManager()
            );
            a.setEscalationLevel(1); // Seeded as Level 1 escalated
            a.setStatus(AlertStatus.ESCALATED);
            a.setLastEscalatedAt(LocalDateTime.now().minusHours(2));
            Alert savedAlert = alertRepository.save(a);

            EscalationHistory h = new EscalationHistory(
                    savedAlert,
                    0,
                    1,
                    "Auto-Escalation: Unacknowledged after 5 minutes threshold breach",
                    "MINISTRY_ADMIN",
                    "Joint Secretary (Infrastructure)"
            );
            escalationHistoryRepository.save(h);
        } else if ("HIGH".equals(d.riskLevel)) {
            Alert a = new Alert(
                    p,
                    "HIGH_RISK_BREACH",
                    AlertSeverity.HIGH,
                    String.format("Project %s crossed High Risk threshold (SPI=%.2f, CPI=%.2f, Health=%d/100).",
                            p.getProjectCode(), d.spi, d.cpi, d.healthScore),
                    p.getProjectManager()
            );
            alertRepository.save(a);
        }
    }

    private void seedAuditLogsAndNotifications() {
        notificationRepository.save(new Notification(
                "manager@pragati.demo",
                "Critical Alert: Bhopal Metro Phase-II",
                "Severe schedule delay detected (SPI: 0.68). Escalated to Ministry Joint Secretary.",
                "ESCALATION",
                1L,
                "CRITICAL"
        ));

        notificationRepository.save(new Notification(
                "ministry@pragati.demo",
                "Level 1 Escalation Received",
                "Alert 'CRITICAL_SCHEDULE_COLLAPSE' on project PRG-RLY-2024-002 requires review.",
                "ESCALATION",
                2L,
                "HIGH"
        ));

        auditLogRepository.save(new AuditLog(
                "field@pragati.demo",
                "ROLE_FIELD_OFFICER",
                AuditAction.UPDATE_PROGRESS,
                "Project",
                1L,
                "Bhopal-Indore High-Speed Highway Corridor",
                "Submitted bi-weekly progress update: physical progress 42.0%, actual expenditure ₹680.00 Cr"
        ));
    }

    private static class ProjectSeedData {
        String code, name, ministry, department, scheme, sector, description, manager, agency, contractor, state, district, location, status, priority, riskLevel, aiExplanation;
        double lat, lng, budget, plannedCost, actualCost, earnedValue, physicalProgress, plannedProgress, financialProgress, spi, cpi, sv, cv, aiRiskProb, aiDelayDays;
        int healthScore, daysSinceUpdate;
        LocalDate startDate, plannedEndDate;

        ProjectSeedData(String code, String name, String ministry, String sector, String state, String district, String loc,
                        double lat, double lng, double budget, double physicalProg, double plannedProg, double actualCost,
                        double spi, double cpi, String riskLevel, int healthScore, double delayDays, String aiExp) {
            this.code = code;
            this.name = name;
            this.ministry = ministry;
            this.department = "Department of " + sector;
            this.scheme = "National " + sector + " Infrastructure Mission";
            this.sector = sector;
            this.description = "Flagship " + sector + " development initiative in " + state + " connecting " + district + " to major industrial growth corridors.";
            this.manager = "Vikramaditya Rao, PD";
            this.agency = "State Infrastructure Development Corporation (" + state + ")";
            this.contractor = "L&T - Shapoorji Consortium";
            this.state = state;
            this.district = district;
            this.location = loc;
            this.lat = lat;
            this.lng = lng;
            this.budget = budget;
            this.startDate = LocalDate.of(2023, 6, 1);
            this.plannedEndDate = LocalDate.of(2025, 12, 31);
            this.physicalProgress = physicalProg;
            this.plannedProgress = plannedProg;
            this.actualCost = actualCost;
            this.plannedCost = Math.round((plannedProg / 100.0) * budget * 10.0) / 10.0;
            this.earnedValue = Math.round((physicalProg / 100.0) * budget * 10.0) / 10.0;
            this.financialProgress = Math.round((actualCost / budget) * 1000.0) / 10.0;
            this.spi = spi;
            this.cpi = cpi;
            this.sv = Math.round((earnedValue - plannedCost) * 10.0) / 10.0;
            this.cv = Math.round((earnedValue - actualCost) * 10.0) / 10.0;
            this.status = physicalProg >= 100 ? "COMPLETED" : (spi < 0.85 ? "DELAYED" : "IN_PROGRESS");
            this.priority = riskLevel.equals("CRITICAL") ? "CRITICAL" : (riskLevel.equals("HIGH") ? "HIGH" : "MEDIUM");
            this.riskLevel = riskLevel;
            this.healthScore = healthScore;
            this.aiRiskProb = riskLevel.equals("CRITICAL") ? 0.92 : (riskLevel.equals("HIGH") ? 0.78 : (riskLevel.equals("MEDIUM") ? 0.48 : 0.12));
            this.aiDelayDays = delayDays;
            this.aiExplanation = aiExp;
            this.daysSinceUpdate = riskLevel.equals("CRITICAL") ? 22 : 4;
        }
    }

    private List<ProjectSeedData> getProjectSeedList() {
        List<ProjectSeedData> list = new ArrayList<>();

                // 4 COMPLETED FLAGSHIP PROJECTS (100% Physical Progress)
        list.add(new ProjectSeedData("PRG-HWY-2023-001", "Atal Tunnel Rohtang Highway Link", "Ministry of Road Transport and Highways", "Highways", "Himachal Pradesh", "Kullu", "Rohtang Pass Km 10", 32.3667, 77.1744, 3200.0, 100.0, 100.0, 3140.0, 1.00, 1.02, "LOW", 98, 0, "Project successfully completed and operational. All milestones achieved within approved parameters."));
        list.add(new ProjectSeedData("PRG-RLY-2023-001", "Chenab River Mega Rail Bridge Section", "Ministry of Railways", "Railways", "Jammu and Kashmir", "Reasi", "Bakkal-Kauri Rail Span", 33.1539, 74.8817, 1480.0, 100.0, 100.0, 1460.0, 1.00, 1.01, "LOW", 97, 0, "Arch erection, structural health monitoring and trial train runs successfully commissioned."));
        list.add(new ProjectSeedData("PRG-PWR-2023-001", "Bhadla Solar Park Grid Interconnection", "Ministry of New and Renewable Energy", "Power", "Rajasthan", "Jodhpur", "Bhadla Phase-IV Complex", 27.5383, 71.9167, 2100.0, 100.0, 100.0, 2050.0, 1.00, 1.02, "LOW", 99, 0, "Full 2245 MW solar generation capacity synchronized with the national grid."));
        list.add(new ProjectSeedData("PRG-URB-2023-001", "Surat Diamond Bourse Smart Access Corridor", "Ministry of Housing and Urban Affairs", "Urban Development", "Gujarat", "Surat", "DREAM City Zone", 21.1167, 72.8000, 850.0, 100.0, 100.0, 835.0, 1.00, 1.02, "LOW", 100, 0, "Multi-modal rapid access transit, flyover, and smart utility network commissioned on schedule."));

        // 5 LOW RISK PROJECTS
        list.add(new ProjectSeedData("PRG-HWY-2024-001", "Delhi-Mumbai Expressway Spur Link MP", "Ministry of Road Transport and Highways", "Highways", "Madhya Pradesh", "Ratlam", "Ratlam Bypass Km 42", 23.3315, 75.0367, 1450.0, 78.0, 75.0, 1080.0, 1.04, 1.05, "LOW", 95, 0, "SPI (1.04) and CPI (1.05) exceed baseline with zero overdue milestones."));
        list.add(new ProjectSeedData("PRG-RLY-2024-001", "Western Dedicated Freight Corridor Ring", "Ministry of Railways", "Railways", "Rajasthan", "Jaipur", "Phulera Junction", 26.8756, 75.2415, 2800.0, 84.0, 82.0, 2300.0, 1.02, 1.02, "LOW", 92, 0, "Track electrification & signaling ahead of master schedule."));
        list.add(new ProjectSeedData("PRG-PWR-2024-001", "Khavda Ultra Mega Solar Park Phase-I", "Ministry of New and Renewable Energy", "Power", "Gujarat", "Kutch", "Khavda Renewable Zone", 23.8542, 69.7214, 3200.0, 91.0, 90.0, 2850.0, 1.01, 1.02, "LOW", 96, 0, "Grid synchronization completed with optimal budget variance."));
        list.add(new ProjectSeedData("PRG-WTR-2024-001", "Jal Jeevan Multi-Village Piped Supply UP", "Ministry of Jal Shakti", "Water Supply", "Uttar Pradesh", "Varanasi", "Sevapuri Block", 25.3176, 82.9739, 850.0, 68.0, 66.0, 560.0, 1.03, 1.03, "LOW", 90, 0, "Household tap connections progressing smoothly across 140 villages."));
        list.add(new ProjectSeedData("PRG-DGT-2024-001", "BharatNet Gram Panchayat Optical Fiber", "Ministry of Communications", "Digital Infrastructure", "Karnataka", "Mysuru", "Hunsur Taluk", 12.3072, 76.2921, 620.0, 72.0, 70.0, 430.0, 1.03, 1.04, "LOW", 93, 0, "Underground duct laying and GP terminal testing completed."));

        // 5 MEDIUM RISK PROJECTS
        list.add(new ProjectSeedData("PRG-HWY-2024-002", "Varanasi-Kolkata Economic Corridor Package-3", "Ministry of Road Transport and Highways", "Highways", "Bihar", "Gaya", "Dobhi Highway Stretch", 24.5833, 84.9500, 1850.0, 54.0, 60.0, 1060.0, 0.90, 0.94, "MEDIUM", 74, 18, "Moderate schedule lag due to monsoon quarrying restrictions in Bihar."));
        list.add(new ProjectSeedData("PRG-HLT-2024-001", "AIIMS Awantipora Super Specialty Hospital", "Ministry of Health and Family Welfare", "Healthcare", "Assam", "Guwahati", "Amingaon Medical Hub", 26.1821, 91.6881, 1120.0, 48.0, 53.0, 570.0, 0.91, 0.94, "MEDIUM", 72, 22, "HVAC & specialized medical gas pipeline procurement awaiting vendor sign-off."));
        list.add(new ProjectSeedData("PRG-URB-2024-001", "Smart City Smart Mobility Hub Pune", "Ministry of Housing and Urban Affairs", "Urban Development", "Maharashtra", "Pune", "Shivajinagar Intermodal", 18.5204, 73.8567, 940.0, 61.0, 68.0, 620.0, 0.90, 0.92, "MEDIUM", 70, 25, "Underground utility shifting causing traffic diversion bottlenecks."));
        list.add(new ProjectSeedData("PRG-EDU-2024-001", "Central Tribal University Campus & Labs", "Ministry of Education", "Education", "Odisha", "Koraput", "Sunabeda Hills", 18.7214, 82.8576, 580.0, 42.0, 46.0, 260.0, 0.91, 0.94, "MEDIUM", 76, 14, "Labor shortages during local festive season resolved."));
        list.add(new ProjectSeedData("PRG-RUR-2024-001", "PMGSY All-Weather Hill Connectivity", "Ministry of Rural Development", "Rural Development", "Assam", "Dima Hasao", "Haflong Valley", 25.1764, 93.0238, 480.0, 51.0, 56.0, 275.0, 0.91, 0.89, "MEDIUM", 68, 20, "Slope stabilization and retaining wall works in hilly terrain."));

        // 5 HIGH RISK PROJECTS
        list.add(new ProjectSeedData("PRG-HWY-2024-003", "Coastal Highway 4-Laning Section-II", "Ministry of Road Transport and Highways", "Highways", "Odisha", "Puri", "Konark Coastal Stretch", 19.8135, 85.8312, 1680.0, 38.0, 48.0, 720.0, 0.79, 0.88, "HIGH", 54, 48, "SPI=0.79 with 2 overdue milestones and environmental CRZ clearance hurdles."));
        list.add(new ProjectSeedData("PRG-IRR-2024-001", "Narmada Malwa River Linking Irrigation Canal", "Ministry of Jal Shakti", "Irrigation", "Madhya Pradesh", "Indore", "Sanwer Branch Canal", 22.9734, 75.8012, 2100.0, 41.0, 52.0, 980.0, 0.79, 0.88, "HIGH", 52, 55, "Land compensation litigation on 18 km right-of-way alignment."));
        list.add(new ProjectSeedData("PRG-RLY-2024-002", "Bengaluru Suburban Rail Corridor-2", "Ministry of Railways", "Railways", "Karnataka", "Bengaluru", "Yeshwantpur to Chikkabanavara", 13.0280, 77.5409, 3600.0, 32.0, 42.0, 1350.0, 0.76, 0.85, "HIGH", 48, 65, "Defense land transfer pending and utility shifting across arterial junctions."));
        list.add(new ProjectSeedData("PRG-PWR-2024-002", "765kV Green Energy Transmission Corridor", "Ministry of Power", "Power", "Rajasthan", "Bikaner", "Nokh Substation", 27.5342, 72.4189, 1950.0, 44.0, 56.0, 990.0, 0.78, 0.86, "HIGH", 50, 52, "Great Indian Bustard conservation court compliance requiring underground cabling."));
        list.add(new ProjectSeedData("PRG-URB-2024-002", "Chennai Metro Phase-2 Line-4 Elevated", "Ministry of Housing and Urban Affairs", "Urban Development", "Tamil Nadu", "Chennai", "Poonamallee Bypass", 13.0475, 80.0934, 4200.0, 36.0, 46.0, 1850.0, 0.78, 0.82, "HIGH", 46, 68, "TBM launch shaft civil contractor arbitration dispute."));

        // 5 CRITICAL RISK PROJECTS
        list.add(new ProjectSeedData("PRG-RLY-2024-003", "Bhopal Metro Purple Line Section 2", "Ministry of Housing and Urban Affairs", "Railways", "Madhya Pradesh", "Bhopal", "AIIMS to Subhash Nagar", 23.2599, 77.4126, 2450.0, 24.0, 48.0, 980.0, 0.50, 0.60, "CRITICAL", 32, 140, "SPI=0.50, CPI=0.60, 3 overdue milestones and severe contractor liquidity crunch."));
        list.add(new ProjectSeedData("PRG-WTR-2024-002", "Bundelkhand Water Grid Surface Reservoir", "Ministry of Jal Shakti", "Water Supply", "Uttar Pradesh", "Jhansi", "Babina Dam Reservoir", 25.2412, 78.4719, 1350.0, 28.0, 58.0, 680.0, 0.48, 0.55, "CRITICAL", 28, 165, "Civil contractor abandoned earthworks. Anomaly detected: spend 50% vs progress 28%."));
        list.add(new ProjectSeedData("PRG-HWY-2024-004", "Western Ring Road Tunnel Bypass Surat", "Ministry of Road Transport and Highways", "Highways", "Gujarat", "Surat", "Hazira Industrial Bypass", 21.1702, 72.8311, 2900.0, 21.0, 52.0, 1250.0, 0.40, 0.49, "CRITICAL", 24, 190, "Tunnel boring geotech collapse. Critical safety issue and severe schedule delay."));
        list.add(new ProjectSeedData("PRG-HLT-2024-002", "Patna Medicity Regional Trauma Center", "Ministry of Health and Family Welfare", "Healthcare", "Bihar", "Patna", "Bihta Medical Enclave", 25.5681, 84.8712, 1250.0, 26.0, 55.0, 710.0, 0.47, 0.46, "CRITICAL", 26, 175, "Budget overrun warning, 4 unresolved critical issues, unacknowledged level 2 alerts."));
        list.add(new ProjectSeedData("PRG-IRR-2024-002", "Upper Krishna Barrage Expansion Stage-III", "Ministry of Jal Shakti", "Irrigation", "Karnataka", "Vijayapura", "Almatti Reservoir Complex", 16.3289, 75.8872, 3800.0, 30.0, 64.0, 1920.0, 0.47, 0.59, "CRITICAL", 30, 150, "Inter-state water disputes tribunal stay and severe cost overrun."));

        return list;
    }
}
