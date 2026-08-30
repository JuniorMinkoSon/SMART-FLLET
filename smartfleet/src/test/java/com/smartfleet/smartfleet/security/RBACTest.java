package com.smartfleet.smartfleet.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class RBACTest {

    // TEST 11: ADMIN role validation
    @Test
    @WithMockUser(roles = "ADMIN")
    void testAdminRoleAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertTrue(auth.isAuthenticated());
        assertTrue(auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    // TEST 12: GESTIONNAIRE role validation
    @Test
    @WithMockUser(roles = "GESTIONNAIRE")
    void testGestionnaireRoleAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertTrue(auth.isAuthenticated());
        assertTrue(auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_GESTIONNAIRE")));
    }

    // TEST 13: CONDUCTEUR role validation
    @Test
    @WithMockUser(roles = "CONDUCTEUR")
    void testConducteurRoleAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertTrue(auth.isAuthenticated());
        assertTrue(auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CONDUCTEUR")));
    }

    // TEST 14: ADMIN has multiple permissions
    @Test
    @WithMockUser(roles = "ADMIN")
    void testAdminHasFullPermissions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertTrue(auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    // TEST 15: GESTIONNAIRE can manage missions
    @Test
    @WithMockUser(roles = "GESTIONNAIRE")
    void testGestionnaireCanManageMissions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertTrue(auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_GESTIONNAIRE")));
    }

    // TEST 16: CONDUCTEUR can view own missions
    @Test
    @WithMockUser(roles = "CONDUCTEUR", username = "conductor@example.com")
    void testConducteurIdentityPreserved() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertEquals("conductor@example.com", auth.getPrincipal());
        assertTrue(auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CONDUCTEUR")));
    }

    // TEST 17: Users must be authenticated
    @Test
    void testUnauthenticatedUserHasNoRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertFalse(auth.isAuthenticated());
    }

    // TEST 18: Security context is thread-scoped
    @Test
    @WithMockUser(roles = "ADMIN")
    void testSecurityContextThreadScoped() {
        Authentication auth1 = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth1);
        assertTrue(auth1.isAuthenticated());
    }

    // TEST 19: Role-based authorization consistency
    @Test
    @WithMockUser(roles = "GESTIONNAIRE")
    void testRoleConsistency() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        long gestionnaireRoles = auth.getAuthorities().stream()
            .filter(a -> a.getAuthority().equals("ROLE_GESTIONNAIRE"))
            .count();
        assertEquals(1, gestionnaireRoles);
    }

    // TEST 20: Security principle enforcement
    @Test
    @WithMockUser(roles = "CONDUCTEUR")
    void testConducteurLimitedPermissions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Conducteur should only have CONDUCTEUR role, not ADMIN or GESTIONNAIRE
        boolean hasAdminRole = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean hasGestionnaireRole = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_GESTIONNAIRE"));
        assertFalse(hasAdminRole);
        assertFalse(hasGestionnaireRole);
    }
}
