package gov.pragati.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "escalation_history")
public class EscalationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id", nullable = false)
    private Alert alert;

    private Integer fromLevel;
    private Integer toLevel;

    @Column(columnDefinition = "TEXT")
    private String escalationReason;

    @Column(length = 100)
    private String escalatedToRole;

    @Column(length = 150)
    private String escalatedToUser;

    private boolean acknowledged = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime escalatedAt = LocalDateTime.now();

    public EscalationHistory() {}

    public EscalationHistory(Alert alert, Integer fromLevel, Integer toLevel, String escalationReason, String escalatedToRole, String escalatedToUser) {
        this.alert = alert;
        this.fromLevel = fromLevel;
        this.toLevel = toLevel;
        this.escalationReason = escalationReason;
        this.escalatedToRole = escalatedToRole;
        this.escalatedToUser = escalatedToUser;
        this.escalatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Alert getAlert() { return alert; }
    public void setAlert(Alert alert) { this.alert = alert; }

    public Integer getFromLevel() { return fromLevel; }
    public void setFromLevel(Integer fromLevel) { this.fromLevel = fromLevel; }

    public Integer getToLevel() { return toLevel; }
    public void setToLevel(Integer toLevel) { this.toLevel = toLevel; }

    public String getEscalationReason() { return escalationReason; }
    public void setEscalationReason(String escalationReason) { this.escalationReason = escalationReason; }

    public String getEscalatedToRole() { return escalatedToRole; }
    public void setEscalatedToRole(String escalatedToRole) { this.escalatedToRole = escalatedToRole; }

    public String getEscalatedToUser() { return escalatedToUser; }
    public void setEscalatedToUser(String escalatedToUser) { this.escalatedToUser = escalatedToUser; }

    public boolean isAcknowledged() { return acknowledged; }
    public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }

    public LocalDateTime getEscalatedAt() { return escalatedAt; }
    public void setEscalatedAt(LocalDateTime escalatedAt) { this.escalatedAt = escalatedAt; }
}
