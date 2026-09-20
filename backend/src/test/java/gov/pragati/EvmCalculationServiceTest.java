package gov.pragati;

import gov.pragati.entity.Project;
import gov.pragati.repository.RiskThresholdRepository;
import gov.pragati.service.EvmCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class EvmCalculationServiceTest {

    private EvmCalculationService evmService;
    private RiskThresholdRepository thresholdRepository;

    @BeforeEach
    void setUp() {
        thresholdRepository = Mockito.mock(RiskThresholdRepository.class);
        evmService = new EvmCalculationService(thresholdRepository);
    }

    @Test
    void testEvmCalculation_Healthy() {
        Project p = new Project();
        p.setProjectBudget(1000.0);
        p.setPlannedProgress(50.0);
        p.setPhysicalProgress(50.0);
        p.setActualCost(500.0);

        evmService.recalculateEvmMetrics(p);

        assertEquals(500.0, p.getPlannedCost());
        assertEquals(500.0, p.getEarnedValue());
        assertEquals(1.00, p.getSpi());
        assertEquals(1.00, p.getCpi());
        assertEquals(0.0, p.getScheduleVariance());
        assertEquals(0.0, p.getCostVariance());
        assertEquals("LOW", p.getRiskLevel());
    }

    @Test
    void testEvmCalculation_DelayedAndOverBudget() {
        Project p = new Project();
        p.setProjectBudget(1000.0);
        p.setPlannedProgress(60.0); // PV = 600
        p.setPhysicalProgress(30.0); // EV = 300
        p.setActualCost(500.0);      // AC = 500

        evmService.recalculateEvmMetrics(p);

        assertEquals(600.0, p.getPlannedCost());
        assertEquals(300.0, p.getEarnedValue());
        assertEquals(0.50, p.getSpi()); // 300 / 600
        assertEquals(0.60, p.getCpi()); // 300 / 500
        assertEquals(-300.0, p.getScheduleVariance());
        assertEquals(-200.0, p.getCostVariance());
        assertEquals("CRITICAL", p.getRiskLevel());
    }

    @Test
    void testEvmCalculation_SafeDivisionByZero() {
        Project p = new Project();
        p.setProjectBudget(1000.0);
        p.setPlannedProgress(0.0);
        p.setPhysicalProgress(0.0);
        p.setActualCost(0.0);

        assertDoesNotThrow(() -> evmService.recalculateEvmMetrics(p));
        assertEquals(1.0, p.getSpi());
        assertEquals(1.0, p.getCpi());
    }
}
